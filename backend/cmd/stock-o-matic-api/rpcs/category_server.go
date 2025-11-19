package rpcs

import (
	"context"
	"errors"
	"fmt"

	"connectrpc.com/connect"
	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/category"
	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	v1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/services/v1"
	"github.com/DarylvdBerg/stock-o-matic/internal/proto/services/v1/servicesv1connect"
	"github.com/DarylvdBerg/stock-o-matic/internal/strings"
	"go.uber.org/zap"
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
	if request.Category == nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("missing category from request"))
	}

	if strings.IsEmptyOrWhiteSpace(request.Category.Name) {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("name cannot be nil or empty"))
	}

	err := c.repository.AddCategory(ctx, request.Category)
	if err != nil {
		logging.Error(ctx, "failed to add category", zap.Error(err))
		return nil, connect.NewError(connect.CodeAborted, fmt.Errorf("failed to add category with error: %w", err))
	}

	return &v1.AddCategoryResponse{}, nil
}

func (c CategoryServer) UpdateCategory(ctx context.Context, request *v1.UpdateCategoryRequest) (*v1.UpdateCategoryResponse, error) {
	if request.Id == 0 {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("missing id"))
	}

	if strings.IsEmptyOrWhiteSpace(request.Name) {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("name cannot be nil or empty"))
	}

	_, err := c.repository.UpdateCategory(ctx, request.Id, request.Name)
	if err != nil {
		logging.Error(ctx, "failed to update category", zap.Error(err))
		return nil, connect.NewError(connect.CodeAborted, fmt.Errorf("failed to update category with error: %w", err))
	}

	return &v1.UpdateCategoryResponse{}, nil
}
