# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stock-o-matic is a full-stack home inventory management application for tracking groceries and household items. Go backend with Connect-RPC, Next.js frontend with Material-UI, PostgreSQL database.

## Commands

All commands are defined in the `justfile`. Run `just` to see the full list.

### Backend (Go)
```bash
just go-build          # Build
just go-test           # Run all tests
just go-lint           # Lint with golangci-lint (auto-fix)
just go-memory-check   # Check memory alignment issues
```

Single test: `cd backend && go test ./cmd/stock-o-matic-api/stock/... -run TestName`

### Frontend (Next.js)
```bash
just next-build        # Build
just next-lint         # ESLint
just next-format       # Prettier (auto-fix)
just next-type-check   # TypeScript type checking
cd frontend && npm test            # Jest tests
cd frontend && npm test -- --testPathPattern=path/to/test  # Single test
```

### Proto Code Generation
```bash
just proto             # Generate Go + TypeScript from proto files
just proto-go          # Go only
just proto-next        # TypeScript only
just proto-lint        # Lint proto files
```

### Infrastructure
```bash
just up                # Start PostgreSQL, Jaeger, PGAdmin via Docker Compose
just down              # Stop services
```

### CI Validation
```bash
just all-checks        # Run all backend + frontend checks
just backend-checks    # proto-lint → go-build → go-test → go-lint
just frontend-checks   # next-format → next-lint → next-type-check → next-build
```

## Architecture

### API Contract (Proto-First)
Protocol Buffers in `proto/` define the API contract. `buf` generates:
- Go server code → `backend/internal/proto/`
- TypeScript client code → `frontend/lib/proto/`

Two services: **StockService** and **CategoryService**, each with Get/Add/Update RPCs. Communication uses Connect-RPC (HTTP/1.1 + HTTP/2 compatible gRPC).

### Backend (`backend/`)
- **Entry point:** `cmd/stock-o-matic-api/main.go` — starts gRPC server on `:8080`
- **Domain packages:** `cmd/stock-o-matic-api/stock/` and `cmd/stock-o-matic-api/category/` — each contains models, repository (GORM), and server (RPC handler)
- **RPC registration:** `cmd/stock-o-matic-api/rpcs/` wires up service handlers
- **Infrastructure:** `internal/` has config, database (GORM/PostgreSQL), logging (zap), and server setup
- Repository pattern: domain repos abstract database access via GORM

### Frontend (`frontend/`)
- **Next.js 16** with app directory router (`src/app/`)
- **Components:** `components/` — actions, grid, header, modals
- **API clients:** `lib/client/` — StockClient and CategoryClient wrapping generated proto services
- **Hooks:** `lib/hooks/` — useStockClient, useCategoryClient
- **State:** `stores/stock.ts` — Zustand store for stock state
- **Config:** `lib/config/client-config.ts` — RPC transport setup
- **Path aliases:** `@/*` maps to `./src/*`, `./lib/*`, `./components/*`

### Environment Variables
- Backend: configured via `backend/.env`
- Frontend: `NEXT_PUBLIC_RPC_URL` (default: `localhost:3000`), `NEXT_PUBLIC_RPC_TIMEOUT` (default: 30000ms)
- Docker: `docker-compose.yml` reads from `.env.docker`

## Code Style

- **Go:** golangci-lint with strict config (`.golangci.yml`) — includes errcheck, gosec, revive, dupl, funlen, goconst, gocritic
- **TypeScript:** ESLint (Next.js + TypeScript + Prettier rules), Prettier with tabs and semicolons
- **Commits:** Conventional commit format required for PR titles
- **Mocks:** Generated with mockgen: `just go-gen-mock path dest`
