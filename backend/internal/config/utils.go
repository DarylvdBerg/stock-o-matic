package config

import (
	"context"
	"os"
	"strconv"

	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"go.uber.org/zap"
)

// MustEnv retrieves the value of the environment variable named by the key.
// If the variable is not set or empty, the application exits with a fatal log.
func MustEnv(ctx context.Context, key string) string {
	value := os.Getenv(key)
	if value == "" {
		logging.Fatal(ctx, "Environment variable is not set or empty", zap.String("env_val", key))
	}

	return value
}

// GetEnvOrDefault retrieves the value of the environment variable named by the key.
// If the environment variable is not set or empty, it returns the provided default value.
func GetEnvOrDefault(ctx context.Context, key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		logging.Info(ctx, "Environment variable is not set or empty, using default value", zap.String("env_val", key))
		return defaultValue
	}

	return value
}

// GetEnvOrDefaultInt retrieves an integer environment variable.
// If not set or not a valid integer, returns the default value.
func GetEnvOrDefaultInt(ctx context.Context, key string, defaultValue int) int {
	value := os.Getenv(key)
	if value == "" {
		logging.Info(ctx, "Environment variable is not set or empty, using default value", zap.String("env_val", key))
		return defaultValue
	}

	parsed, err := strconv.Atoi(value)
	if err != nil {
		logging.Warn(ctx, "Environment variable is not a valid integer, using default value",
			zap.String("env_val", key), zap.Error(err))
		return defaultValue
	}

	return parsed
}
