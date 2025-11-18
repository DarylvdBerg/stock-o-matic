package database

import (
	"context"

	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Repository[T any] struct {
	db *gorm.DB
}

func NewImplementation[T any](db *gorm.DB) *Repository[T] {
	return &Repository[T]{
		db,
	}
}

// QueryAll executes the provided SQL query and scans the result into a value of type T.
func (r *Repository[T]) QueryAll(ctx context.Context) ([]T, error) {
	var result []T
	res := r.db.Find(&result)
	if res.Error != nil {
		logging.Error(ctx, "failed to execute query", zap.Error(res.Error))
		return nil, res.Error
	}

	return result, nil
}

func (r *Repository[T]) QuerySingle(ctx context.Context) (*T, error) {
	panic("implement me")
}

// Upsert executes the provided SQL upsert query within a transaction.
func (r *Repository[T]) Upsert(ctx context.Context, data T) (*T, error) {
	res := r.db.Save(&data)
	if res.Error != nil {
		logging.Error(ctx, "failed to execute upsert", zap.Error(res.Error))
		return nil, res.Error
	}

	return &data, nil
}
