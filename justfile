[private]
default:
    just --list

# Generate from proto files
proto:
    buf generate

# Validate proto files
proto-validate:
    buf lint

# Run all checks
checks:
    buf lint
    cd backend && go build ./...
    cd backend && go test ./...