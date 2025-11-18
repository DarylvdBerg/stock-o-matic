package category

import (
	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
)

type Category struct {
	database.Model
	Name string
}

// toProto converts a Category database model to its protobuf representation.
func (c *Category) toProto() *corev1.Category {
	return &corev1.Category{
		Id:   c.ID,
		Name: c.Name,
	}
}

// ToProtoSlice converts a slice of Category database models to their protobuf representations.
func ToProtoSlice(c []Category) []*corev1.Category {
	pCategories := make([]*corev1.Category, len(c))
	for _, dCategory := range c {
		pCategories = append(pCategories, dCategory.toProto())
	}

	return pCategories
}
