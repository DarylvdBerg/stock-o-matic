package category

import "github.com/DarylvdBerg/stock-o-matic/internal/database"

type Repository struct {
	database.Repository[Category]
}
