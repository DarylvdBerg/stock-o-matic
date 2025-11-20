package rpcs

import (
	"errors"

	"connectrpc.com/connect"
)

var (
	AddCategoryCategoryNilError = connect.NewError(connect.CodeInvalidArgument, errors.New("missing category from request"))
	AddCategoryNameEmptyError   = connect.NewError(connect.CodeInvalidArgument, errors.New("name cannot be nil or empty"))
)
