package category

import (
	"context"

	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
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
