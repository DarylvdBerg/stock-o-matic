package config

import (
	"context"

	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"github.com/joho/godotenv"
)

type ApplicationConfig struct {
	ServerAddr string
}

// LoadApplicationConfig loads the application configuration from environment variables.
func LoadApplicationConfig(ctx context.Context) *ApplicationConfig {
	if err := godotenv.Load(); err != nil {
		logging.Error(ctx, ErrorLoadingDotEnv)
	}

	return &ApplicationConfig{
		ServerAddr: MustEnv(ctx, "SERVER_ADDR"),
	}
}
