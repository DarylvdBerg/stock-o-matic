package rpcs

import (
	"context"

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
		return nil, err
	}

	return &stockv1.GetStockResponse{
		Stocks: stocks,
	}, nil
}

func (s StockServer) AddStock(ctx context.Context, request *stockv1.AddStockRequest) (*stockv1.AddStockResponse, error) {
	//TODO implement me
	panic("implement me")
}
