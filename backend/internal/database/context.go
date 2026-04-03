package database

import (
	"context"
	"database/sql"

	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
)

type databaseContextKey struct{}

func from(ctx context.Context) *sql.Conn {
	val := ctx.Value(databaseContextKey{})
	conn, ok := val.(*sql.Conn)
	if !ok || conn == nil {
		logging.Fatal(ctx, "Failed to fetch database connection object from context, returned as nil.")
	}

	return conn
}

// With stores a database connection in the context.
func With(ctx context.Context, conn *sql.Conn) context.Context {
	return context.WithValue(ctx, databaseContextKey{}, conn)
}
