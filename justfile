[private]
default:
    just --list


# Generate Go code from proto files
proto-go:
    buf generate --template buf.gen.go.yaml

# Generate TypeScript code from proto files
proto-next:
     cd frontend && npx buf generate ../ --template ../buf.gen.ts.yaml

# Generate from proto files
proto:
    just proto-go
    just proto-next

# Validate proto files
proto-validate:
    buf lint

# docker compose up
up: 
    docker compose up -d

# docker compose down
down:
    docker compose down

# Test backend
go-test:
    cd backend && go test ./...

# Build backend
go-build:
    cd backend && go build ./...

# Lint backend Go code
go-lint:
    cd backend && go tool golangci-lint run --config .golangci.yml --fix

# Check memory issues in backend Go code
go-memory-check:
    cd backend && go tool aligo check ./...

# View memory allocation in backend go code
go-memory-view:
    cd backend && go tool aligo view ./...

# Lint proto files
proto-lint:
    buf lint

# Frontend linting
next-lint:
    cd frontend && npx eslint .

# Frontend formatting
next-format:
    cd frontend && npx prettier . --write

# Frontend type checking
next-type-check:
    cd frontend && npx tsc --noEmit

next-build:
    cd frontend && npm run build

# Run all checks for the backend
backend-checks:
    just proto-lint
    just go-build
    just go-test
    just go-lint

# Run all frontend checks
frontend-checks:
    just next-format
    just next-lint
    just next-type-check
    just next-build

# Run all checks
all-checks:
    just backend-checks
    just frontend-checks
