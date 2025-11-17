package stock

import (
	"context"
	"database/sql"

	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
)

type Repository struct {
	database.Repository[[]*corev1.Stock]
	table *table
}

func NewRepository(ctx context.Context, conn *sql.Conn) *Repository {
	return &Repository{
		Repository: *database.NewImplementation[[]*corev1.Stock](conn),
		table:      newTable(ctx, conn),
	}
}

func (r *Repository) GetStock(ctx context.Context) ([]*corev1.Stock, error) {
	logging.Debug(ctx, "Stock repository called, trying to get all services information.")

	q := "SELECT * FROM stocks;"

	res, err := r.Query(ctx, q)
	if err != nil {
		return nil, err
	}

	return *res, nil
}
