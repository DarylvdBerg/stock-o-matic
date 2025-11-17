package stock

import (
	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	"github.com/DarylvdBerg/stock-o-matic/internal/proto/stock/core"
)

type Repository struct {
	database.Repository[*core.Stock]
}

func NewRepository() *Repository {
	return &Repository{
		database.Repository[*core.Stock]{},
	}
}
