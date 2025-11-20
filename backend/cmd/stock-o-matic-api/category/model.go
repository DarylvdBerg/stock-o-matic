package category

import (
	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
)

type Category struct {
	database.Model
	Name string `gorm:"uniqueIndex"`
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
	pCategories := make([]*corev1.Category, 0)
	for _, dCategory := range c {
		pCategories = append(pCategories, dCategory.toProto())
	}

	return pCategories
}

// ToDbModel converts a protobuf Category to its database model representation.
func ToDbModel(p *corev1.Category) *Category {
	return &Category{
		Model: database.Model{
			ID: p.Id,
		},
		Name: p.Name,
	}
}

// ToDbModelSlice converts a slice of protobuf Categories to their database model representations.
func ToDbModelSlice(p []*corev1.Category) []Category {
	dbCategories := make([]Category, 0)
	for _, dCategory := range p {
		dbCategories = append(dbCategories, *ToDbModel(dCategory))
	}

	return dbCategories
}
