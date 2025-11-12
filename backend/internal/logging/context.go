package logging

import (
	"context"

	"go.uber.org/zap"
)

type loggingContextKey struct{}

// From retrieves the logger stored in the context.
// If no logger is found, it returns the global logger.
func From(ctx context.Context) *zap.Logger {
	if ctx == nil {
		return zap.L()
	}

	val := ctx.Value(loggingContextKey{})
	if val == nil {
		return zap.L()
	}

	logger, ok := val.(*zap.Logger)
	if !ok {
		return zap.L()
	}

	return logger
}

// With stores the logger in the context.
func With(ctx context.Context, logger *zap.Logger) context.Context {
	if logger == nil {
		return ctx
	}

	return context.WithValue(ctx, loggingContextKey{}, logger)
}
