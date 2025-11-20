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
		Name: "Test Category",
	}

	protoCategory := c.toProto()

	assert.Equal(t, protoCategory.Name, c.Name)
	assert.Equal(t, protoCategory.Id, c.ID)
}

func TestToProtoSlice(t *testing.T) {
	slice := []*Category{
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
		assert.Equal(t, protoCategories[i].Id, c.ID)
	}
}

func TestToDbModel(t *testing.T) {
	s := &corev1.Category{
		Id:   1,
		Name: "Test Category",
	}

	dbCategory := ToDbModel(s)

	assert.Equal(t, s.Id, dbCategory.ID)
	assert.Equal(t, s.Name, dbCategory.Name)
}

func TestToDbModelSlice(t *testing.T) {
	slice := []*corev1.Category{
		{
			Id:   1,
			Name: "Category 1",
		},
		{
			Id:   2,
			Name: "Category 2",
		},
	}

	dbCategories := ToDbModelSlice(slice)

	assert.Len(t, dbCategories, 2)
	for i, c := range slice {
		assert.Equal(t, c.Id, dbCategories[i].ID)
		assert.Equal(t, c.Name, dbCategories[i].Name)
	}
}
