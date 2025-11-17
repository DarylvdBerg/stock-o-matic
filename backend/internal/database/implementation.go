package database

import (
	"context"
	"database/sql"

	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"go.uber.org/zap"
)

type Repository[T any] struct {
	dbName string
}

func NewImplementation[T any](dbName string) *Repository[T] {
	return &Repository[T]{
		dbName: dbName,
	}
}

// Query executes the provided SQL query and scans the result into a value of type T.
func (r *Repository[T]) Query(ctx context.Context, query string) (*T, error) {
	// Get the connection from our context.
	rows, err := from(ctx).QueryContext(ctx, query)
	if err != nil {
		logging.Error(ctx, "Failed to execute query", zap.Error(err))
		return nil, err
	}

	// Ensure rows are closed after we're done.
	defer func(rows *sql.Rows) {
		cerr := rows.Close()
		if cerr != nil {
			logging.Error(ctx, "Failed to close rows", zap.Error(err))
		}
	}(rows)

	var result *T

	// Validate if we have any rows.
	if !rows.Next() {
		if err := rows.Err(); err != nil {
			logging.Error(ctx, "Rows iteration error", zap.Error(err))
			return nil, err
		}
		// no rows returned
		return nil, sql.ErrNoRows
	}

	// Scan the result into our generic type T.
	rerr := rows.Scan(result)
	if rerr != nil {
		logging.Error(ctx, "Failed to scan result", zap.Error(rerr))
		return nil, rerr
	}

	return result, nil
}
