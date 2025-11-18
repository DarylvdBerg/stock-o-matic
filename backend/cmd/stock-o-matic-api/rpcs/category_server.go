package rpcs

import (
	"context"

	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/category"
	v1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/services/v1"
	"github.com/DarylvdBerg/stock-o-matic/internal/proto/services/v1/servicesv1connect"
)

const (
	CategoryServerName = servicesv1connect.CategoryServiceName
)

type CategoryServer struct {
	repository category.Repository
}

var _ servicesv1connect.CategoryServiceHandler = (*CategoryServer)(nil)

func NewCategoryServer(r category.Repository) *CategoryServer {
	return &CategoryServer{
		repository: r,
	}
}

func (c CategoryServer) AddCategory(ctx context.Context, request *v1.AddCategoryRequest) (*v1.AddCategoryResponse, error) {
	// TODO implement me
	panic("implement me")
}

func (c CategoryServer) UpdateCategory(ctx context.Context, request *v1.UpdateCategoryRequest) (*v1.UpdateCategoryResponse, error) {
	// TODO implement me
	panic("implement me")
}
