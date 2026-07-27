# Deployment

Self-hosting stock-o-matic with Docker Compose, behind an existing Cloudflare Tunnel + nginx reverse proxy on the host, and protected by Cloudflare Access.

## Architecture

```
 browser ──TLS──► cloudflare edge ──tunnel──► nginx (host) ──► frontend (Next.js 127.0.0.1:3000)
                       │                                            │
                 Access (auth)                                      rewrites /rpc/*, /uploads/*, /api/v1/*
                                                                     │
                                                                     ▼
                                                                backend (Go :8080) ── postgres
```

- Nothing on the host is exposed to the public internet. The frontend binds to `127.0.0.1:3000` only, so only processes on the host (your nginx) can reach it.
- The browser talks only to `stock.darylvdberg.nl`. Your existing Cloudflare Tunnel forwards to nginx, which proxies to the frontend. Next.js proxies RPC, image uploads, and static uploads to the backend over the internal docker network.
- Cloudflare Access sits in front of the hostname and gates the two allow-listed email addresses.

This guide assumes you **already have** a Cloudflare Tunnel and nginx reverse proxy running on the host (common on CasaOS). If you don't, either set those up first or re-introduce the `cloudflared` service into `docker-compose.prod.yml`.

## Prerequisites

- A Linux host with Docker Engine ≥ 24 and the Compose plugin (CasaOS bundles both).
- An existing Cloudflare Tunnel pointing at the host, and nginx running on the host as a reverse proxy.
- The repository cloned to the host (e.g. `/opt/stock-o-matic`).
- A domain managed in Cloudflare (DNS hosted there). In this guide: `darylvdberg.nl`.
- A (free) Cloudflare Zero Trust account — one-click enable from the dashboard.

---

## 1. Cloudflare setup

All of this is in the Cloudflare dashboard; none of it requires changes on the server.

### 1a. Add the public hostname to your existing tunnel

1. Open **Zero Trust** → **Networks** → **Tunnels** → your existing tunnel → **Configure** → **Public Hostname** → **Add a public hostname**.
2. **Subdomain:** `stock`
3. **Domain:** `darylvdberg.nl`
4. **Service type:** `HTTP`
5. **URL:** whatever your nginx listens on from the tunnel's perspective — typically `localhost:80` if `cloudflared` runs on the host, or `nginx:80` if it shares a docker network with nginx.
6. **Save**.

Cloudflare creates the DNS record automatically.

### 1b. Create the Access application

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

Keep `.env.prod` out of git (it's already `.env*`-ignored in the Dockerfiles' build context; add it to `.gitignore` if you haven't).

### 2b. Configure nginx

The frontend container binds to `127.0.0.1:3000` on the host. Add an nginx vhost (on the host) that proxies your tunnel traffic to it:

```nginx
server {
    listen 80;
    server_name stock.darylvdberg.nl;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reload nginx (`nginx -s reload` or equivalent).

### 2c. Build and start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

First run will build the Go binary and the Next.js bundle — expect ~3–5 minutes. Subsequent runs reuse cached layers.

### 2d. Verify

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f frontend
curl -I http://127.0.0.1:3000   # should return 200 from the host
```

Open `https://stock.darylvdberg.nl` — Cloudflare Access prompts for an email code, then the app loads. If you get `502 Bad Gateway`, it's almost always nginx → frontend or tunnel → nginx; check those logs in that order.

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

> **Heads-up:** the only port the compose binds is `127.0.0.1:3000` (loopback-only, for nginx). If CasaOS's UI rewrites that to `0.0.0.0:3000`, change it back — the whole point is that only nginx on the host can reach the frontend directly.

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
# tunnel + nginx logs live outside this compose project
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
| `502 Bad Gateway` from `stock.darylvdberg.nl` | Tunnel → nginx, or nginx → frontend. Check in that order: is the tunnel public-hostname target reachable? Does `curl -I http://127.0.0.1:3000` on the host succeed? Is `docker compose logs frontend` clean? |
| Browser CORS error | You kept `NEXT_PUBLIC_RPC_URL` set to an absolute URL from dev. Unset it or set it to `/rpc`. |
| RPC calls return HTML | Access session expired — the fetch got the login page HTML. Refresh the browser to re-auth. |
| `connection refused` backend → postgres | Postgres healthcheck hasn't passed yet. `docker compose logs postgres`; first boot of a fresh DB can take 20–30 s. |
| `relation ... does not exist` on first boot | Normal — GORM's `AutoMigrate` runs on backend startup and creates the tables. The first call after startup will succeed. |

---

## 6. What *not* to change without thinking

- **Don't** change the frontend port binding from `127.0.0.1:3000` to `0.0.0.0:3000`. Loopback-only is what keeps the frontend off the public internet — your tunnel + Access are the only public path.
- **Don't** set `BACKEND_URL` to a public URL. It should always be the internal docker service name (`http://backend:8080`).
- **Don't** put secrets into `docker-compose.prod.yml`. Keep them in `.env.prod` and back that file up separately (e.g. in a password manager).
