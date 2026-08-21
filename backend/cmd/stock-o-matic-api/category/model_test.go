package category

import (
	"testing"

	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
	"github.com/stretchr/testify/assert"
)

func TestToProto(t *testing.T) {
	c := &Category{
		Model: database.Model{
			ID: 1,
		},
		Name:         "Test Category",
		MonitorStock: true,
	}

	protoCategory := c.toProto()

	assert.Equal(t, protoCategory.Name, c.Name)
	assert.Equal(t, protoCategory.Id, &c.ID)
	assert.Equal(t, protoCategory.MonitorStock, c.MonitorStock)
}

func TestToProtoSlice(t *testing.T) {
	slice := []Category{
		{
			Model: database.Model{
				ID: 1,
			},
			Name: "Category 1",
		},
		{
			Model: database.Model{
				ID: 2,
			},
			Name: "Category 2",
		},
	}

	protoCategories := ToProtoSlice(slice)

	assert.Len(t, protoCategories, 2)
	for i, c := range slice {
		assert.Equal(t, protoCategories[i].Name, c.Name)
		assert.Equal(t, protoCategories[i].Id, &c.ID)
	}
}

func TestToDbModel(t *testing.T) {
	id := uint32(1)
	s := &corev1.Category{
		Id:           &id,
		Name:         "Test Category",
		MonitorStock: true,
	}

	dbCategory := ToDbModel(s)

	assert.Equal(t, s.Id, &dbCategory.ID)
	assert.Equal(t, s.Name, dbCategory.Name)
	assert.Equal(t, s.MonitorStock, dbCategory.MonitorStock)
}

func TestToDbModelSlice(t *testing.T) {
	id1 := uint32(1)
	id2 := uint32(2)
	slice := []*corev1.Category{
		{
			Id:   &id1,
			Name: "Category 1",
		},
		{
			Id:   &id2,
			Name: "Category 2",
		},
	}

	dbCategories := ToDbModelSlice(slice)

	assert.Len(t, dbCategories, 2)
	for i, c := range slice {
		assert.Equal(t, c.Id, &dbCategories[i].ID)
		assert.Equal(t, c.Name, dbCategories[i].Name)
	}
}
