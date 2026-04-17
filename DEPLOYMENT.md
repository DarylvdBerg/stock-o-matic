# Deployment

Self-hosting stock-o-matic with Docker Compose, fronted by a Cloudflare Tunnel and protected by Cloudflare Access.

## Architecture

```
 browser ──TLS──► cloudflare edge ──tunnel──► cloudflared ──► frontend (Next.js :3000)
                       │                                          │
                 Access (auth)                                    rewrites /rpc/*, /uploads/*, /api/v1/*
                                                                   │
                                                                   ▼
                                                              backend (Go :8080) ── postgres
```

- Nothing is exposed to the public internet on the host. The only outbound connection is `cloudflared` → Cloudflare.
- The browser talks only to `stock.darylvdberg.nl`. Next.js proxies RPC, image uploads, and static uploads to the backend over the internal docker network.
- Cloudflare Access sits in front of the hostname and gates the two allow-listed email addresses.

## Prerequisites

- A Linux host with Docker Engine ≥ 24 and the Compose plugin (CasaOS bundles both).
- The repository cloned to the host (e.g. `/opt/stock-o-matic`).
- A domain managed in Cloudflare (DNS hosted there). In this guide: `darylvdberg.nl`.
- A (free) Cloudflare Zero Trust account — one-click enable from the dashboard.

---

## 1. Cloudflare setup (do this first — you need the tunnel token)

All of this is in the Cloudflare dashboard; none of it requires changes on the server.

### 1a. Create the tunnel

1. Open **Zero Trust** → **Networks** → **Tunnels** → **Create a tunnel**.
2. Choose **Cloudflared**, name it e.g. `stock-o-matic`, click **Save**.
3. On the *Install and run a connector* screen, pick **Docker**. You'll see a command like `cloudflared tunnel --token ey...`. Copy **only the token** (the long `ey…` string) — you'll paste it into `.env.prod`. Don't run the command; our compose file does it.
4. Click **Next**.

### 1b. Add the public hostname

Still in the tunnel setup:

1. **Subdomain:** `stock`
2. **Domain:** `darylvdberg.nl`
3. **Service type:** `HTTP`
4. **URL:** `frontend:3000` *(note: the docker service name, not `localhost`)*
5. **Save tunnel**.

Cloudflare creates the DNS record automatically.

### 1c. Create the Access application

1. **Zero Trust** → **Access** → **Applications** → **Add an application** → **Self-hosted**.
2. **Name:** `Stock-o-matic`
3. **Session duration:** 24 hours (taste)
4. **Application domain:** subdomain `stock`, domain `darylvdberg.nl`.
5. **Identity providers:** leave *One-time PIN* enabled (sends a login code to the user's email). Add Google/GitHub if you want one-click login.
6. Click **Next** to the policy screen.
7. **Policy name:** `Allowed users`, **Action:** `Allow`.
8. Under **Configure rules**, add an **Include** rule with selector **Emails** and enter the two addresses (yours and your girlfriend's).
9. **Save**.

> **Tip:** you can also use the **Emails ending in** selector (`@q42.nl`, etc.) if you prefer a domain-wide rule.

---

## 2. Deploy on any Docker host

This works on plain Debian/Ubuntu, Unraid, Portainer, Synology, etc.

### 2a. Configure environment

```bash
cd /opt/stock-o-matic
cp .env.prod.example .env.prod
$EDITOR .env.prod
```

Fill in:

- `POSTGRES_PASSWORD` — generate with `openssl rand -base64 32`.
- `TUNNEL_TOKEN` — the token you copied in step 1a.

Keep `.env.prod` out of git (it's already `.env*`-ignored in the Dockerfiles' build context; add it to `.gitignore` if you haven't).

### 2b. Build and start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

First run will build the Go binary and the Next.js bundle — expect ~3–5 minutes. Subsequent runs reuse cached layers.

### 2c. Verify

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f cloudflared
```

You should see `Registered tunnel connection` lines. Open `https://stock.darylvdberg.nl` — Cloudflare will prompt for an email code, then the app loads.

---

## 3. Deploy on CasaOS

CasaOS is Docker underneath, so the generic steps above all work. Two ways to wire it in.

### Option A — Run via CLI (simplest)

SSH into the CasaOS host and follow section 2 exactly. The stack runs outside CasaOS's UI but is fully functional. You can still use CasaOS for disks/monitoring.

### Option B — Import as a CasaOS custom app

1. SSH in and clone the repo to `/DATA/AppData/stock-o-matic` (CasaOS's app-data convention).
2. Create `.env.prod` there as in step 2a.
3. In the CasaOS UI: **App Store** → **Custom Install** (the `+` icon top-right).
4. Click **Import** → paste the contents of `docker-compose.prod.yml` **and** inline the env values (CasaOS doesn't support `--env-file` yet — replace `${POSTGRES_PASSWORD}` etc. with real values, or keep using the CLI).
5. **Install**. The stack appears in your CasaOS dashboard.

> **Heads-up:** CasaOS sometimes auto-exposes ports it sees in a compose file. Our compose uses no host `ports:` mappings on purpose — if CasaOS adds any, remove them via the app's **Settings** → **Ports** screen. The whole point of the Cloudflare Tunnel is that nothing is directly reachable.

---

## 4. Day-two operations

### Updating

```bash
cd /opt/stock-o-matic
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

### Logs

```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f cloudflared
```

### Backups

Two volumes hold your data: `stock-o-matic_postgres-data` and `stock-o-matic_uploads-data`.

```bash
# Database dump
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup-$(date +%F).sql

# Uploads (tar of the named volume)
docker run --rm -v stock-o-matic_uploads-data:/data -v "$PWD":/backup alpine \
  tar czf /backup/uploads-$(date +%F).tgz -C /data .
```

Schedule these in cron/systemd and copy the outputs off-host (restic, rclone, whatever you already use).

### Adding/removing allowed users

Zero Trust → Access → Applications → *Stock-o-matic* → **Policies** → edit the Include list. No server restart required.

---

## 5. Troubleshooting

| Symptom | Likely cause |
|---|---|
| `502 Bad Gateway` from `stock.darylvdberg.nl` | Tunnel is up but `frontend` isn't ready yet, or the public-hostname target points at the wrong service name/port. Check `docker compose logs frontend` and the tunnel config in the dashboard. |
| Browser CORS error | You kept `NEXT_PUBLIC_RPC_URL` set to an absolute URL from dev. Unset it or set it to `/rpc`. |
| RPC calls return HTML | Access session expired — the fetch got the login page HTML. Refresh the browser to re-auth. |
| `connection refused` backend → postgres | Postgres healthcheck hasn't passed yet. `docker compose logs postgres`; first boot of a fresh DB can take 20–30 s. |
| `relation ... does not exist` on first boot | Normal — GORM's `AutoMigrate` runs on backend startup and creates the tables. The first call after startup will succeed. |

### Regenerating the tunnel token

If you rotate the token: Zero Trust → Networks → Tunnels → the tunnel → **Configure** → **Re-run the connector** → copy the new token into `.env.prod` and `docker compose up -d cloudflared`.

---

## 6. What *not* to change without thinking

- **Don't** add `ports:` on any service. That opens the service to the public internet and bypasses Access.
- **Don't** set `BACKEND_URL` to a public URL. It should always be the internal docker service name (`http://backend:8080`).
- **Don't** put secrets into `docker-compose.prod.yml`. Keep them in `.env.prod` and back that file up separately (e.g. in a password manager).
