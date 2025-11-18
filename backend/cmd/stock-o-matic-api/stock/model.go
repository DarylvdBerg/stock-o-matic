package stock

import (
	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
)

type stock struct {
	database.Model
	Name     string
	Quantity int32
}

func (s *stock) toProto() *corev1.Stock {
	return &corev1.Stock{
		Id:       s.ID,
		Name:     s.Name,
		Quantity: s.Quantity,
	}
}

func toProtoSlice(s []*stock) []*corev1.Stock {
	protoStocks := make([]*corev1.Stock, len(s))
	for _, dStock := range s {
		protoStocks = append(protoStocks, dStock.toProto())
	}

	return protoStocks
}
