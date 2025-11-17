package stock

import (
	"context"

	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
	"github.com/jmoiron/sqlx"
)

type Repository struct {
	database.Repository[[]*corev1.Stock]
	table *table
}

func NewRepository(ctx context.Context, db *sqlx.DB) *Repository {
	return &Repository{
		Repository: *database.NewImplementation[[]*corev1.Stock](db),
		table:      newTable(ctx, db),
	}
}

// GetStock retrieves all stock information from the database.
func (r *Repository) GetStock(ctx context.Context) ([]*corev1.Stock, error) {
	logging.Debug(ctx, "Stock repository called, trying to get all services information.")

	q := "SELECT * FROM stocks;"

	res, err := r.Query(ctx, q)
	if err != nil {
		return nil, err
	}

	return *res, nil
}

// AddStock adds new stock information to the database.
func (r *Repository) AddStock(ctx context.Context, stock *corev1.Stock) error {
	logging.Debug(ctx, "Stock repository called, trying to add stock information.")

	q := "INSERT INTO stocks (name, quantity) VALUES ($1, $2);"
	_, err := r.ExecContext(ctx, q, stock.Name, stock.Quantity)
	if err != nil {
		return err
	}

	return nil
}
