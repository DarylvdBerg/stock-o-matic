package stock

import (
	"context"
	"fmt"

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

	q := fmt.Sprintf("INSERT INTO stocks (name, quantity) VALUES ('%s', %d);", stock.Name, stock.Quantity)
	_, err := r.Insert(ctx, q)
	if err != nil {
		return err
	}

	return nil
}
