package logging

import (
	"context"

	"go.uber.org/zap"
)

// Debug logs a debug message using the logger from the context.
func Debug(ctx context.Context, msg string, fields ...zap.Field) {
	From(ctx).Debug(msg, fields...)
}

// Info logs an info message using the logger from the context.
func Info(ctx context.Context, msg string, fields ...zap.Field) {
	From(ctx).Info(msg, fields...)
}

// Warn logs a warning message using the logger from the context.
func Warn(ctx context.Context, msg string, fields ...zap.Field) {
	From(ctx).Warn(msg, fields...)
}

// Error logs an error message using the logger from the context.
func Error(ctx context.Context, msg string, fields ...zap.Field) {
	From(ctx).Error(msg, fields...)
}
