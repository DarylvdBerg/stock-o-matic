package stock

import (
	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
	"gorm.io/gorm"
)

type stock struct {
	gorm.Model
	Name     string
	Quantity int
}

func (s *stock) toProto() *corev1.Stock {
	return &corev1.Stock{
		Id:       uint32(s.ID),
		Name:     s.Name,
		Quantity: int32(s.Quantity),
	}
}

func toProtoSlice(s []*stock) []*corev1.Stock {
	protoStocks := make([]*corev1.Stock, len(s))
	for _, dStock := range s {
		protoStocks = append(protoStocks, dStock.toProto())
	}

	return protoStocks
}
