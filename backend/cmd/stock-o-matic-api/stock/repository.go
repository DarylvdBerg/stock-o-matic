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

type IRepository interface {
	GetStock(ctx context.Context) ([]*corev1.Stock, error)
	AddStock(ctx context.Context, data *corev1.Stock) (*corev1.Stock, error)
	UpdateStock(ctx context.Context, id uint32, data *corev1.Stock) (*corev1.Stock, error)
	DeleteStock(ctx context.Context, id uint32) error
}

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
func (r *Repository) AddStock(ctx context.Context, data *corev1.Stock) (*corev1.Stock, error) {
	logging.Debug(ctx, "Stock repository called, trying to add stock information.")

	s := &stock{
		Name:     data.Name,
		Quantity: data.Quantity,
		ImageURL: data.ImageUrl,
	}

	// Only append the categories when present in the request.
	// Otherwise for now, assume we don't want to set any categories.
	if len(data.Categories) > 0 {
		s.Categories = category.ToDbModelSlice(data.Categories)
	}

	newStock, err := r.Upsert(ctx, s)
	if err != nil {
		return nil, err
	}

	return (*newStock).toProto(), nil
}

// UpdateStock updates existing stock information in the database.
func (r *Repository) UpdateStock(ctx context.Context, id uint32, data *corev1.Stock) (*corev1.Stock, error) {
	logging.Debug(ctx, "Stock repository called, trying to update stock information.")

	s := &stock{
		Model: database.Model{
			ID: id,
		},
	}

	res := r.DB().Model(&s).Updates(stock{Name: data.Name, Quantity: data.Quantity, ImageURL: data.ImageUrl})
	if res.Error != nil {
		logging.Error(ctx, "failed to update stock", zap.Error(res.Error))
		return nil, res.Error
	}

	// Replace the category associations.
	categories := category.ToDbModelSlice(data.Categories)
	if err := r.DB().Model(&s).Association("Categories").Replace(categories); err != nil {
		logging.Error(ctx, "failed to update stock categories", zap.Error(err))
		return nil, err
	}

	s.Name = data.Name
	s.Quantity = data.Quantity
	s.ImageURL = data.ImageUrl
	s.Categories = categories
	return s.toProto(), nil
}

// DeleteStock removes stock information from the database by id.
func (r *Repository) DeleteStock(ctx context.Context, id uint32) error {
	logging.Debug(ctx, "Stock repository called, trying to delete stock information.")

	s := &stock{
		Model: database.Model{
			ID: id,
		},
	}

	// Clear category associations first.
	if err := r.DB().Model(s).Association("Categories").Clear(); err != nil {
		logging.Error(ctx, "failed to clear stock categories", zap.Error(err))
		return err
	}

	res := r.DB().Delete(s)
	if res.Error != nil {
		logging.Error(ctx, "failed to delete stock", zap.Error(res.Error))
		return res.Error
	}

	return nil
}
