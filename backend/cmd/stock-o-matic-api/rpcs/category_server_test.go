package rpcs_test

import (
	"testing"

	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/rpcs"
	mockcategory "github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/tests/mocks/category"
	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
	v1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/services/v1"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/mock/gomock"
)

func TestGetCategories_Valid_ReturnCategories(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)

	req := &v1.GetCategoriesRequest{}
	mockRepo := mockcategory.NewMockIRepository(ctrl)
	id := uint32(1)
	expected := []*corev1.Category{
		{
			Id:   &id,
			Name: "Category 1",
		},
	}

	mockRepo.
		EXPECT().
		GetCategories(gomock.Any()).
		Return(expected, nil)

	server := rpcs.NewCategoryServer(mockRepo)

	res, err := server.GetCategories(ctx, req)
	require.NoError(t, err)
	assert.Len(t, res.Categories, 1)
	assert.Equal(t, expected[0].Id, res.Categories[0].Id)
	assert.Equal(t, expected[0].Name, res.Categories[0].Name)
}

func TestGetCategories_Error_ReturnAborted(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)

	req := &v1.GetCategoriesRequest{}
	mockRepo := mockcategory.NewMockIRepository(ctrl)

	mockRepo.
		EXPECT().
		GetCategories(gomock.Any()).
		Return(nil, assert.AnError)

	server := rpcs.NewCategoryServer(mockRepo)

	_, err := server.GetCategories(ctx, req)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "failed to get categories with error")
}

func TestAddCategory_CategoryNil_ReturnInvalidArgument(t *testing.T) {
	ctx := t.Context()
	req := &v1.AddCategoryRequest{
		Category: nil,
	}

	server := rpcs.NewCategoryServer(mockcategory.NewMockIRepository(gomock.NewController(t)))

	_, err := server.AddCategory(ctx, req)
	require.Error(t, err)
	assert.Equal(t, rpcs.AddCategoryCategoryNilError.Error(), err.Error())
}

func TestAddCategory_IdZero_ReturnInvalidArgument(t *testing.T) {
	ctx := t.Context()
	req := &v1.AddCategoryRequest{
		Category: &corev1.Category{
			Name: "",
		},
	}

	server := rpcs.NewCategoryServer(mockcategory.NewMockIRepository(gomock.NewController(t)))

	_, err := server.AddCategory(ctx, req)

	require.Error(t, err)
	assert.Equal(t, rpcs.AddCategoryNameEmptyError.Error(), err.Error())
}

func TestUpdateCategory_IdZero_ReturnInvalidArgument(t *testing.T) {
	ctx := t.Context()
	req := &v1.UpdateCategoryRequest{
		Id:   0,
		Name: "New Name",
	}

	server := rpcs.NewCategoryServer(mockcategory.NewMockIRepository(gomock.NewController(t)))
	_, err := server.UpdateCategory(ctx, req)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "missing id")
}

func TestUpdateCategory_NameEmpty_ReturnInvalidArgument(t *testing.T) {
	ctx := t.Context()
	req := &v1.UpdateCategoryRequest{
		Id:   1,
		Name: "",
	}

	server := rpcs.NewCategoryServer(mockcategory.NewMockIRepository(gomock.NewController(t)))
	_, err := server.UpdateCategory(ctx, req)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "name cannot be nil or empty")
}

func TestDeleteCategory_IdZero_ReturnInvalidArgument(t *testing.T) {
	ctx := t.Context()
	req := &v1.DeleteCategoryRequest{
		Id: 0,
	}

	server := rpcs.NewCategoryServer(mockcategory.NewMockIRepository(gomock.NewController(t)))
	_, err := server.DeleteCategory(ctx, req)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "missing id")
}

func TestDeleteCategory_Error_ReturnAborted(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)
	req := &v1.DeleteCategoryRequest{
		Id: 1,
	}

	mockRepo := mockcategory.NewMockIRepository(ctrl)
	mockRepo.
		EXPECT().
		DeleteCategory(gomock.Any(), req.Id).
		Return(assert.AnError)

	server := rpcs.NewCategoryServer(mockRepo)
	_, err := server.DeleteCategory(ctx, req)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "failed to delete category with error")
}

func TestDeleteCategory_Valid_Success(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)
	req := &v1.DeleteCategoryRequest{
		Id: 1,
	}

	mockRepo := mockcategory.NewMockIRepository(ctrl)
	mockRepo.
		EXPECT().
		DeleteCategory(gomock.Any(), req.Id).
		Return(nil)

	server := rpcs.NewCategoryServer(mockRepo)
	_, err := server.DeleteCategory(ctx, req)
	require.NoError(t, err)
}
