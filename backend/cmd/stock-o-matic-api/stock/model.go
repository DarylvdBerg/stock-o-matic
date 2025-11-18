package stock

import (
	"strconv"

	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
	"gorm.io/gorm"
)

type stock struct {
	gorm.Model
	Name     string
	Quantity int
}

func (s *stock) ToProto() *corev1.Stock {
	return &corev1.Stock{
		Id:       strconv.Itoa(int(s.ID)),
		Name:     s.Name,
		Quantity: int32(s.Quantity),
	}
}
