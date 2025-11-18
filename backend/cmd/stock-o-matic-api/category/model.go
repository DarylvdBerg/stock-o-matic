package category

import "github.com/DarylvdBerg/stock-o-matic/internal/database"

type Category struct {
	database.Model
	Name string
}
