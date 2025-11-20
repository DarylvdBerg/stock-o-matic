package category

import (
	"context"

	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Repository struct {
	database.Repository[Category]
}

func NewRepository(ctx context.Context, db *gorm.DB) *Repository {
	// Initialize the repository object.
	repo := &Repository{
		Repository: *database.NewImplementation[Category](db),
	}

	err := db.AutoMigrate(&Category{})
	if err != nil {
		logging.Fatal(ctx, "Failed to auto-migrate Category model.", zap.Error(err))
	}

	return repo
}

// GetCategories retrieves all category information from the database.
func (r *Repository) GetCategories(ctx context.Context) ([]*corev1.Category, error) {
	logging.Debug(ctx, "Category repository called, trying to get all categories information.")

	categories, err := r.QueryAll(ctx)
	if err != nil {
		return nil, err
	}

	return ToProtoSlice(categories), nil
}

// AddCategory adds new category information to the database.
func (r *Repository) AddCategory(ctx context.Context, data *corev1.Category) error {
	logging.Debug(ctx, "Category repository called, trying to add category information.")

	c := Category{
		Name: data.Name,
	}

	_, err := r.Upsert(ctx, c)
	if err != nil {
		return err
	}

	return nil
}

// UpdateCategory updates existing category information in the database.
func (r *Repository) UpdateCategory(ctx context.Context, id uint32, name string) (*corev1.Category, error) {
	logging.Debug(ctx, "Category repository called, trying to update category information.")

	c := Category{
		Model: database.Model{
			ID: id,
		},
		Name: name,
	}

	_, err := r.QuerySingle(ctx, id)
	if err != nil {
		logging.Debug(ctx, "failed to find category for update validation", zap.Uint32("id", id), zap.Error(err))
		return nil, err
	}

	cat, err := r.Upsert(ctx, c)
	if err != nil {
		return nil, err
	}

	return (*cat).toProto(), nil
}
