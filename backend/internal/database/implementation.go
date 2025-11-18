package database

import (
	"context"

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

// Query executes the provided SQL query and scans the result into a value of type T.
func (r *Repository[T]) Query(ctx context.Context, query string) (*T, error) {
	//var result T
	//var err error
	//
	//// Validate whether the generic type is a slice or not.
	//if reflect.TypeOf(result).Kind() == reflect.Slice {
	//	err = r.db.Select(&result, query)
	//} else {
	//	err = r.db.Get(&result, query)
	//}
	//
	//if err != nil {
	//	logging.Error(ctx, "Failed to fetch data", zap.Error(err))
	//	return nil, err
	//}

	return nil, nil
}

// Upsert executes the provided SQL upsert query within a transaction.
func (r *Repository[T]) Upsert(ctx context.Context, query string) (*T, error) {
	//// For insert start a transaction to ensure we can always properly add the data.
	//tx, err := r.db.BeginTx(ctx, nil)
	//if err != nil {
	//	logging.Error(ctx, "Failed to create transaction", zap.Error(err))
	//	terr := tx.Rollback()
	//	if terr != nil {
	//		return nil, terr
	//	}
	//}
	//
	//// Execute the insert query.
	//_, err = tx.ExecContext(ctx, query)
	//if err != nil {
	//	logging.Error(ctx, "Failed to insert data", zap.Error(err))
	//	terr := tx.Rollback()
	//	if terr != nil {
	//		return nil, terr
	//	}
	//	return nil, err
	//}
	//
	//// Commit the transaction.
	//err = tx.Commit()
	//if err != nil {
	//	logging.Error(ctx, "Failed to commit transaction", zap.Error(err))
	//	terr := tx.Rollback()
	//	if terr != nil {
	//		return nil, terr
	//	}
	//	return nil, err
	//}

	return nil, nil
}
