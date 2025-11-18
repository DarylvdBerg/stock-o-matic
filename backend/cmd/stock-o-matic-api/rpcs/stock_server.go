package rpcs

import (
	"context"
	"errors"

	"connectrpc.com/connect"
	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/stock"
	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	stockv1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/services/v1"
	"github.com/DarylvdBerg/stock-o-matic/internal/proto/services/v1/servicesv1connect"
	"go.uber.org/zap"
)

const (
	StockServerName = servicesv1connect.StockServiceName
)

type StockServer struct {
	repository stock.Repository
}

var _ servicesv1connect.StockServiceHandler = (*StockServer)(nil)

func NewStockServer(r stock.Repository) *StockServer {
	return &StockServer{
		repository: r,
	}
}

func (s StockServer) GetStock(ctx context.Context, _ *stockv1.GetStockRequest) (*stockv1.GetStockResponse, error) {
	logging.Debug(ctx, "Stock service, getStock called.")

	stocks, err := s.repository.GetStock(ctx)
	if err != nil {
		logging.Error(ctx, "Fetching services from repository failed.", zap.Error(err))
		return nil, connect.NewError(connect.CodeAborted, err)
	}

	return &stockv1.GetStockResponse{
		Stocks: stocks,
	}, nil
}

func (s StockServer) AddStock(ctx context.Context, request *stockv1.AddStockRequest) (*stockv1.AddStockResponse, error) {
	logging.Debug(ctx, "Stock service, addStock called.")

	if request.Stock == nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("received nil stock in request"))
	}

	err := s.repository.AddStock(ctx, request.Stock)
	if err != nil {
		logging.Error(ctx, "Adding stock to repository failed.", zap.Error(err))
		return nil, connect.NewError(connect.CodeAborted, err)
	}

	return &stockv1.AddStockResponse{}, nil
}

func (s StockServer) UpdateStock(ctx context.Context, request *stockv1.UpdateStockRequest) (*stockv1.UpdateStockResponse, error) {
	logging.Debug(ctx, "Stock service, updateStock called.")

	_, err := s.repository.UpdateStock(ctx, request.Name, request.Id, request.Quantity)
	if err != nil {
		logging.Error(ctx, "Updating stock in repository failed.", zap.Error(err))
		return nil, connect.NewError(connect.CodeAborted, err)
	}

	return &stockv1.UpdateStockResponse{}, nil
}
