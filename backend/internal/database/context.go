package database

import (
	"context"
	"database/sql"

	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
)

type databaseContextKey struct{}

func from(ctx context.Context) *sql.Conn {
	conn := ctx.Value(databaseContextKey{}).(*sql.Conn)
	if conn == nil {
		logging.Fatal(ctx, "Failed to fetch database connection object from context, returned as nil.")
		return nil
	}

	return conn
}

func With(ctx context.Context, conn *sql.Conn) context.Context {
	return context.WithValue(ctx, databaseContextKey{}, conn)
}
