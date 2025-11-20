[private]
default:
    just --list

# Generate from proto files
proto:
    buf generate

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

# Frontend type checking
next-type-check:
    cd frontend && npx tsc --noEmit

# Run all checks for the backend
backend-checks:
    just proto-lint
    just go-build
    just go-test
    just go-lint