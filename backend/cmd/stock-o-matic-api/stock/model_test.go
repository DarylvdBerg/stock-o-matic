package stock

import (
	"testing"

	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	"github.com/stretchr/testify/assert"
)

func TestToProto(t *testing.T) {
	s := &stock{
		Model: database.Model{
			ID: 1,
		},
		Name: "Test Stock",
	}

	protoStock := s.toProto()

	assert.Equal(t, s.ID, protoStock.Id)
	assert.Equal(t, s.Name, protoStock.Name)
}

func TestToProtoSlice(t *testing.T) {
	slice := []*stock{
		{
			Model: database.Model{
				ID: 1,
			},
			Name: "Stock 1",
		},
		{
			Model: database.Model{
				ID: 2,
			},
			Name: "Stock 2",
		},
	}

	protoStocks := toProtoSlice(slice)

	assert.Len(t, protoStocks, 2)
	for i, s := range slice {
		assert.Equal(t, s.ID, protoStocks[i].Id)
		assert.Equal(t, s.Name, protoStocks[i].Name)
	}
}
