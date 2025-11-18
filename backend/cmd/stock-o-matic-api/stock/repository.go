package stock

import (
	"context"
	"fmt"

	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Repository struct {
	database.Repository[[]*corev1.Stock]
}

func NewRepository(ctx context.Context, db *gorm.DB) *Repository {
	// Initialize the repository object.
	repo := &Repository{
		Repository: *database.NewImplementation[[]*corev1.Stock](db),
	}

	// Migrate the stock model.
	err := db.AutoMigrate(&stock{})
	if err != nil {
		logging.Fatal(ctx, "Failed to auto-migrate Stock model.", zap.Error(err))
	}

	return repo
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
	_, err := r.Upsert(ctx, q)
	if err != nil {
		return err
	}

	return nil
}

// UpdateStock updates existing stock information in the database.
func (r *Repository) UpdateStock(ctx context.Context, name, id string, quantity int32) error {
	logging.Debug(ctx, "Stock repository called, trying to update stock information.")
	q := fmt.Sprintf("UPDATE stocks SET name = '%s', quantity = %d WHERE id = '%s';", name, quantity, id)

	_, err := r.Upsert(ctx, q)
	if err != nil {
		return err
	}

	return nil
}
