# stock-o-matic

Stock-o-matic is a full-stack application for managing your personal home inventory. It helps you keep track of what groceries and household items you have in stock, so you always know what you need to buy when shopping.

## Features
- **Backend:** Go, gRPC, PostgreSQL
- **Frontend:** Next.js, TypeScript
- **Protobuf:** Shared API definitions for backend and frontend
- **Docker Compose:** For local development with PostgreSQL

## Project Structure
```
backend/      # Go backend, gRPC servers, models, repositories
frontend/     # Next.js frontend, TypeScript, generated proto types
proto/        # Protobuf definitions for core and service APIs
```
