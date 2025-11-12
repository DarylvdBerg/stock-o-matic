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

# Run all checks
checks:
    buf lint
    cd backend && go build ./...
    cd backend && go test ./...
    cd backend && golangci-lint run --config .golangci.yml