package config

import (
	"context"
	"os"

	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

type ApplicationConfig struct {
	DatabaseUrl string
}

func LoadApplicationConfig(ctx context.Context) ApplicationConfig {
	if err := godotenv.Load(); err != nil {
		logging.Debug(ctx, "No .env file found, proceeding with environment variables only")
	}

	return ApplicationConfig{
		DatabaseUrl: MustEnv(ctx, "DATABASE_URL"),
	}
}

func MustEnv(ctx context.Context, key string) string {
	value := os.Getenv(key)
	if value == "" {
		logging.Fatal(ctx, "Environment variable is not set or empty", zap.String("env_val", key))
	}

	return value
}
