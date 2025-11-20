package rpcs_test

import (
	"testing"

	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/category"
	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/rpcs"
	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
	v1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/services/v1"
	"github.com/stretchr/testify/assert"
)

func TestAddCategory_CategoryNil_ReturnInvalidArgument(t *testing.T) {
	ctx := t.Context()
	req := &v1.AddCategoryRequest{
		Category: nil,
	}

	server := rpcs.NewCategoryServer(category.Repository{})

	_, err := server.AddCategory(ctx, req)
	assert.NotNil(t, err)
	assert.Equal(t, rpcs.AddCategoryCategoryNilError.Error(), err.Error())
}

func TestAddCategory_IdZero_ReturnInvalidArgument(t *testing.T) {
	ctx := t.Context()
	req := &v1.AddCategoryRequest{
		Category: &corev1.Category{
			Name: "",
		},
	}

	server := rpcs.NewCategoryServer(category.Repository{})

	_, err := server.AddCategory(ctx, req)

	assert.NotNil(t, err)
	assert.Equal(t, rpcs.AddCategoryNameEmptyError.Error(), err.Error())
}
