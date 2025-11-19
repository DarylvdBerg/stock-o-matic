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
	database.Repository[*Category]
}

func NewRepository(ctx context.Context, db *gorm.DB) *Repository {
	// Initialize the repository object.
	repo := &Repository{
		Repository: *database.NewImplementation[*Category](db),
	}

	err := db.AutoMigrate(&Category{})
	if err != nil {
		logging.Fatal(ctx, "Failed to auto-migrate Category model.", zap.Error(err))
	}

	return repo
}

// AddCategory adds new category information to the database.
func (r *Repository) AddCategory(ctx context.Context, data *corev1.Category) error {
	logging.Debug(ctx, "Category repository called, trying to add category information.")

	c := &Category{
		Name: data.Name,
	}

	_, err := r.Upsert(ctx, c)
	if err != nil {
		return err
	}

	return nil
}
