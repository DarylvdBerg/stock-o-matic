package stock

import (
	"context"

	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/category"
	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Repository struct {
	database.Repository[*stock]
}

func NewRepository(ctx context.Context, db *gorm.DB) *Repository {
	// Initialize the repository object.
	repo := &Repository{
		Repository: *database.NewImplementation[*stock](db),
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
	res, err := r.QueryAll(ctx, PreloadCategoryName)
	if err != nil {
		return nil, err
	}
	return toProtoSlice(res), nil
}

// AddStock adds new stock information to the database.
func (r *Repository) AddStock(ctx context.Context, data *corev1.Stock) error {
	logging.Debug(ctx, "Stock repository called, trying to add stock information.")

	s := &stock{
		Name:     data.Name,
		Quantity: data.Quantity,
	}

	// Only append the categories when present in the request.
	// Otherwise for now, assume we don't want to set any categories.
	if len(data.Categories) > 0 {
		s.Categories = category.ToDbModelSlice(data.Categories)
	}

	_, err := r.Upsert(ctx, s)
	if err != nil {
		return err
	}

	return nil
}

// UpdateStock updates existing stock information in the database.
func (r *Repository) UpdateStock(ctx context.Context, name string, id uint32, quantity int32) (*corev1.Stock, error) {
	logging.Debug(ctx, "Stock repository called, trying to update stock information.")

	s := &stock{
		Model: database.Model{
			ID: id,
		},
		Name:     name,
		Quantity: quantity,
	}

	res, err := r.Upsert(ctx, s)
	if err != nil {
		return nil, err
	}

	return (*res).toProto(), nil
}
