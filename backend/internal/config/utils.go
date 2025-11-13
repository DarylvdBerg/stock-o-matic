package config

import (
	"context"
	"os"

	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"go.uber.org/zap"
)

// MustEnv retrieves the value of the environment variable named by the key.
// This environment value is required for the application to behave properly.
func MustEnv(ctx context.Context, key string) string {
	value := os.Getenv(key)
	if value == "" {
		logging.Fatal(ctx, "Environment variable is not set or empty", zap.String("env_val", key))
	}

	return value
}

// GetEnvOrDefault retrieves the value of the environment variable named by the key.
// If the environment variable is not set or empty, it returns the provided default value.
func GetEnvOrDefault(ctx context.Context, key string, defaultValue any) any {
	value := os.Getenv(key)
	if value == "" {
		logging.Info(ctx, "Environment variable is not set or empty, using default value", zap.String("env_val", key))
		return defaultValue
	}

	return value
}
