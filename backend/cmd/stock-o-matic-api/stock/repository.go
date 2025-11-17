package stock

import (
	"context"
	"database/sql"

	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"github.com/DarylvdBerg/stock-o-matic/internal/proto/stock/core"
)

type Repository struct {
	database.Repository[[]*core.Stock]
}

func NewRepository(conn *sql.Conn) *Repository {
	return &Repository{
		Repository: *database.NewImplementation[[]*core.Stock](conn),
	}
}

func (r *Repository) GetStock(ctx context.Context) ([]*core.Stock, error) {
	logging.Debug(ctx, "Stock repository called, trying to get all stock information.")

	q := `SELECT * FROM stocks;`

	res, err := r.Repository.Query(ctx, q)
	if err != nil {
		return nil, err
	}

	return *res, nil
}
