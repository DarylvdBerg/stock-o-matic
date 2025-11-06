package rpcs

import (
	"context"

	stockv1 "github.com/DarylvdBerg/stock-o-matic/pkg/proto/stock/v1"
	"github.com/DarylvdBerg/stock-o-matic/pkg/proto/stock/v1/stockv1connect"
	connect "github.com/bufbuild/connect-go"
)

type StockServer struct{}

var _ stockv1connect.StockServiceHandler = (*StockServer)(nil)

func NewStockServer() *StockServer {
	return &StockServer{}
}

// GetStock implements stockv1connect.StockServiceHandler.
func (s *StockServer) GetStock(context.Context, *connect.Request[stockv1.GetStockRequest]) (*connect.Response[stockv1.GetStockResponse], error) {
	panic("unimplemented")
}
