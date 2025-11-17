package database

import (
	"context"

	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type Repository[T any] struct {
	db *sqlx.DB
}

func NewImplementation[T any](db *sqlx.DB) *Repository[T] {
	return &Repository[T]{
		db,
	}
}

// Query executes the provided SQL query and scans the result into a value of type T.
func (r *Repository[T]) Query(ctx context.Context, query string) (*T, error) {

	var result T
	err := r.db.Select(&result, query)
	if err != nil {
		logging.Error(ctx, "Failed to fetch data", zap.Error(err))
		return nil, err
	}

	return &result, nil
}

func (r *Repository[T]) Insert(ctx context.Context, query string) (*T, error) {

	return nil, nil
}
