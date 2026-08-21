package rpcs_test

import (
	"context"
	"testing"

	"connectrpc.com/connect"
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
	assert.Equal(t, connect.CodeAborted, connect.CodeOf(err))
}

func TestAddCategory_CategoryNil_ReturnInvalidArgument(t *testing.T) {
	ctx := t.Context()
	req := &v1.AddCategoryRequest{
		Category: nil,
	}

	server := rpcs.NewCategoryServer(mockcategory.NewMockIRepository(gomock.NewController(t)))

	_, err := server.AddCategory(ctx, req)
	require.Error(t, err)
	assert.Equal(t, connect.CodeInvalidArgument, connect.CodeOf(err))
	assert.Contains(t, err.Error(), "missing category from request")
}

func TestAddCategory_NameEmpty_ReturnInvalidArgument(t *testing.T) {
	ctx := t.Context()
	req := &v1.AddCategoryRequest{
		Category: &corev1.Category{
			Name: "",
		},
	}

	server := rpcs.NewCategoryServer(mockcategory.NewMockIRepository(gomock.NewController(t)))

	_, err := server.AddCategory(ctx, req)
	require.Error(t, err)
	assert.Equal(t, connect.CodeInvalidArgument, connect.CodeOf(err))
	assert.Contains(t, err.Error(), "name cannot be nil or empty")
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
	assert.Equal(t, connect.CodeInvalidArgument, connect.CodeOf(err))
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
	assert.Equal(t, connect.CodeInvalidArgument, connect.CodeOf(err))
}

func TestDeleteCategory_IdZero_ReturnInvalidArgument(t *testing.T) {
	ctx := t.Context()
	req := &v1.DeleteCategoryRequest{
		Id: 0,
	}

	server := rpcs.NewCategoryServer(mockcategory.NewMockIRepository(gomock.NewController(t)))
	_, err := server.DeleteCategory(ctx, req)
	require.Error(t, err)
	assert.Equal(t, connect.CodeInvalidArgument, connect.CodeOf(err))
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
	assert.Equal(t, connect.CodeAborted, connect.CodeOf(err))
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

func TestAddCategory_Valid_ForwardsMonitorStock(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)

	req := &v1.AddCategoryRequest{
		Category: &corev1.Category{
			Name:         "Fruit",
			MonitorStock: true,
		},
	}

	var captured *corev1.Category
	mockRepo := mockcategory.NewMockIRepository(ctrl)
	mockRepo.
		EXPECT().
		AddCategory(gomock.Any(), gomock.Any()).
		DoAndReturn(func(_ context.Context, c *corev1.Category) error {
			captured = c
			return nil
		})

	server := rpcs.NewCategoryServer(mockRepo)
	_, err := server.AddCategory(ctx, req)
	require.NoError(t, err)
	require.NotNil(t, captured)
	assert.True(t, captured.MonitorStock)
}

func TestUpdateCategory_Valid_ForwardsMonitorStock(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)

	req := &v1.UpdateCategoryRequest{
		Id:           1,
		Name:         "Fruit",
		MonitorStock: true,
	}

	var capturedMonitor bool
	mockRepo := mockcategory.NewMockIRepository(ctrl)
	mockRepo.
		EXPECT().
		UpdateCategory(gomock.Any(), req.Id, req.Name, gomock.Any()).
		DoAndReturn(func(_ context.Context, _ uint32, _ string, monitorStock bool) (*corev1.Category, error) {
			capturedMonitor = monitorStock
			return &corev1.Category{Id: &req.Id, Name: req.Name, MonitorStock: monitorStock}, nil
		})

	server := rpcs.NewCategoryServer(mockRepo)
	_, err := server.UpdateCategory(ctx, req)
	require.NoError(t, err)
	assert.True(t, capturedMonitor)
}
