package rpcs_test

import (
	"testing"

	"connectrpc.com/connect"
	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/rpcs"
	mock_stock "github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/tests/mocks/stock"
	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
	servicesv1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/services/v1"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
)

func TestGetStock_Valid_ReturnStock(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)
	expected := []*corev1.Stock{
		{
			Id:   1,
			Name: "Stock 1",
		},
	}

	mockRepo := mock_stock.NewMockIRepository(ctrl)
	mockRepo.
		EXPECT().
		GetStock(gomock.Any()).
		Return(expected, nil)

	server := rpcs.NewStockServer(mockRepo)
	res, err := server.GetStock(ctx, nil)

	assert.NoError(t, err)
	assert.Equal(t, expected[0].Id, res.Stocks[0].Id)
	assert.Equal(t, expected[0].Name, res.Stocks[0].Name)
}

func TestGetStock_Error_AbortedReturned(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)

	mockRepo := mock_stock.NewMockIRepository(ctrl)
	mockRepo.
		EXPECT().
		GetStock(gomock.Any()).
		Return(nil, assert.AnError)

	server := rpcs.NewStockServer(mockRepo)
	_, err := server.GetStock(ctx, nil)
	assert.Error(t, err)
}

func TestAddStock_StockNil_ReturnInvalidArgument(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)
	req := &servicesv1.AddStockRequest{}

	mockRepo := mock_stock.NewMockIRepository(ctrl)

	server := rpcs.NewStockServer(mockRepo)
	_, err := server.AddStock(ctx, req)
	assert.Error(t, err)
	assert.Equal(t, connect.CodeInvalidArgument, connect.CodeOf(err))
}

func TestAddStock_Error_Returned(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)
	req := &servicesv1.AddStockRequest{
		Stock: &corev1.Stock{
			Id:   1,
			Name: "Stock 1",
		},
	}

	mockRepo := mock_stock.NewMockIRepository(ctrl)
	mockRepo.
		EXPECT().
		AddStock(gomock.Any(), req.Stock).
		Return(assert.AnError)

	server := rpcs.NewStockServer(mockRepo)
	_, err := server.AddStock(ctx, req)
	assert.Error(t, err)
	assert.Equal(t, connect.CodeAborted, connect.CodeOf(err))
}

func TestAddStock_Valid_Success(t *testing.T) {
	ctx := t.Context()
	ctrl := gomock.NewController(t)
	req := &servicesv1.AddStockRequest{
		Stock: &corev1.Stock{
			Id:   1,
			Name: "Stock 1",
		},
	}

	mockRepo := mock_stock.NewMockIRepository(ctrl)
	mockRepo.
		EXPECT().
		AddStock(gomock.Any(), req.Stock).
		Return(nil)

	server := rpcs.NewStockServer(mockRepo)
	_, err := server.AddStock(ctx, req)
	assert.NoError(t, err)
}
