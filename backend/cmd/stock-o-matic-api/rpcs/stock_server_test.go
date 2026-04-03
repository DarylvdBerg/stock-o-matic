package rpcs_test

import (
	"testing"

	"connectrpc.com/connect"
	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/rpcs"
	mockstock "github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/tests/mocks/stock"
	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
	servicesv1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/services/v1"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/mock/gomock"
)

func TestGetStock_Valid_ReturnStock(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)
	id := uint32(1)
	expected := []*corev1.Stock{
		{
			Id:   &id,
			Name: "Stock 1",
		},
	}

	mockRepo := mockstock.NewMockIRepository(ctrl)
	mockRepo.
		EXPECT().
		GetStock(gomock.Any()).
		Return(expected, nil)

	server := rpcs.NewStockServer(mockRepo)
	res, err := server.GetStock(ctx, nil)

	require.NoError(t, err)
	assert.Equal(t, expected[0].Id, res.Stocks[0].Id)
	assert.Equal(t, expected[0].Name, res.Stocks[0].Name)
}

func TestGetStock_Error_AbortedReturned(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)

	mockRepo := mockstock.NewMockIRepository(ctrl)
	mockRepo.
		EXPECT().
		GetStock(gomock.Any()).
		Return(nil, assert.AnError)

	server := rpcs.NewStockServer(mockRepo)
	_, err := server.GetStock(ctx, nil)
	require.Error(t, err)
}

func TestAddStock_StockNil_ReturnInvalidArgument(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)
	req := &servicesv1.AddStockRequest{}

	mockRepo := mockstock.NewMockIRepository(ctrl)

	server := rpcs.NewStockServer(mockRepo)
	_, err := server.AddStock(ctx, req)
	require.Error(t, err)
	assert.Equal(t, connect.CodeInvalidArgument, connect.CodeOf(err))
}

func TestAddStock_Error_Returned(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)
	id := uint32(1)
	stock := &corev1.Stock{
		Id:   &id,
		Name: "Stock 1",
	}
	req := &servicesv1.AddStockRequest{
		Stock: stock,
	}

	mockRepo := mockstock.NewMockIRepository(ctrl)
	mockRepo.
		EXPECT().
		AddStock(gomock.Any(), req.Stock).
		Return(nil, assert.AnError)

	server := rpcs.NewStockServer(mockRepo)
	_, err := server.AddStock(ctx, req)
	require.Error(t, err)
	assert.Equal(t, connect.CodeAborted, connect.CodeOf(err))
}

func TestAddStock_Valid_Success(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)
	id := uint32(1)
	stock := &corev1.Stock{
		Id:   &id,
		Name: "Stock 1",
	}
	req := &servicesv1.AddStockRequest{
		Stock: stock,
	}

	mockRepo := mockstock.NewMockIRepository(ctrl)
	mockRepo.
		EXPECT().
		AddStock(gomock.Any(), req.Stock).
		Return(stock, nil)

	server := rpcs.NewStockServer(mockRepo)
	_, err := server.AddStock(ctx, req)
	require.NoError(t, err)
}

func TestUpdateStock_IdZero_ReturnInvalidArgument(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)
	req := &servicesv1.UpdateStockRequest{
		Id: 0,
	}

	mockRepo := mockstock.NewMockIRepository(ctrl)
	server := rpcs.NewStockServer(mockRepo)

	_, err := server.UpdateStock(ctx, req)
	require.Error(t, err)
	assert.Equal(t, connect.CodeInvalidArgument, connect.CodeOf(err))
}

func TestUpdateStock_NameEmpty_ReturnInvalidArgument(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)
	req := &servicesv1.UpdateStockRequest{
		Id:   1,
		Name: "",
	}

	mockRepo := mockstock.NewMockIRepository(ctrl)
	server := rpcs.NewStockServer(mockRepo)

	_, err := server.UpdateStock(ctx, req)
	require.Error(t, err)
	assert.Equal(t, connect.CodeInvalidArgument, connect.CodeOf(err))
}

func TestUpdateStock_QuantityNegative_ReturnInvalidArgument(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)
	req := &servicesv1.UpdateStockRequest{
		Id:       1,
		Name:     "Stock 1",
		Quantity: -5,
	}

	mockRepo := mockstock.NewMockIRepository(ctrl)
	server := rpcs.NewStockServer(mockRepo)

	_, err := server.UpdateStock(ctx, req)
	require.Error(t, err)
	assert.Equal(t, connect.CodeInvalidArgument, connect.CodeOf(err))
}

func TestUpdateStock_Error_ReturnAborted(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)
	req := &servicesv1.UpdateStockRequest{
		Id:       1,
		Name:     "Stock 1",
		Quantity: 10,
	}

	mockRepo := mockstock.NewMockIRepository(ctrl)
	mockRepo.
		EXPECT().
		UpdateStock(gomock.Any(), req.Id, gomock.Any()).
		Return(nil, assert.AnError)

	server := rpcs.NewStockServer(mockRepo)
	_, err := server.UpdateStock(ctx, req)
	require.Error(t, err)
	assert.Equal(t, connect.CodeAborted, connect.CodeOf(err))
}

func TestUpdateStock_Valid_Success(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)
	req := &servicesv1.UpdateStockRequest{
		Id:       1,
		Name:     "Stock 1",
		Quantity: 10,
	}

	mockRepo := mockstock.NewMockIRepository(ctrl)
	mockRepo.
		EXPECT().
		UpdateStock(gomock.Any(), req.Id, gomock.Any()).
		Return(&corev1.Stock{
			Id:       &req.Id,
			Name:     req.Name,
			Quantity: req.Quantity,
		}, nil)

	server := rpcs.NewStockServer(mockRepo)
	_, err := server.UpdateStock(ctx, req)
	require.NoError(t, err)
}
