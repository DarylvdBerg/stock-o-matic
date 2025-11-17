package rpcs

import (
	"context"

	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"github.com/DarylvdBerg/stock-o-matic/internal/proto/stock/core"
	stockv1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/stock/v1"
	"github.com/DarylvdBerg/stock-o-matic/internal/proto/stock/v1/stockv1connect"
)

const (
	StockServerName = stockv1connect.StockServiceName
)

type StockServer struct{}

var _ stockv1connect.StockServiceHandler = (*StockServer)(nil)

func NewStockServer() *StockServer {
	return &StockServer{}
}

func (s StockServer) GetStock(ctx context.Context, request *stockv1.GetStockRequest) (*stockv1.GetStockResponse, error) {
	logging.Debug(ctx, "Stock service, getStock called.")

	return &stockv1.GetStockResponse{
		Stocks: []*core.Stock{
			{
				Id:       "1",
				Name:     "Sample Stock Item",
				Quantity: 100,
			},
		},
	}, nil
}
