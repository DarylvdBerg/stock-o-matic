package stock

import (
	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/category"
	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
)

const (
	PreloadCategoryName = "Categories"
)

type stock struct {
	database.Model
	Name       string `gorm:"uniqueIndex"`
	Quantity   int32
	Categories []category.Category `gorm:"many2many:stock_categories;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}

// toProto converts a stock database model to its protobuf representation.
func (s *stock) toProto() *corev1.Stock {
	return &corev1.Stock{
		Id:         s.ID,
		Name:       s.Name,
		Quantity:   s.Quantity,
		Categories: category.ToProtoSlice(s.Categories),
	}
}

// toProtoSlice converts a slice of stock database models to their protobuf representations.
func toProtoSlice(s []*stock) []*corev1.Stock {
	protoStocks := make([]*corev1.Stock, 0)
	for _, dStock := range s {
		protoStocks = append(protoStocks, dStock.toProto())
	}

	return protoStocks
}
