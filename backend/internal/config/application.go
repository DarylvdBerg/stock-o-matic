package config

import (
	"context"
	"os"

	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"github.com/joho/godotenv"
)

type ApplicationConfig struct {
	ServerAddr string
	LogLevel   string // add log level to config
}

// LoadApplicationConfig loads the application configuration from environment variables.
func LoadApplicationConfig(ctx context.Context) *ApplicationConfig {
	if err := godotenv.Load(); err != nil {
		logging.Error(ctx, ErrorLoadingDotEnv)
	}

	return &ApplicationConfig{
		ServerAddr: MustEnv(ctx, "SERVER_ADDR"),
		LogLevel:   os.Getenv("LOG_LEVEL"), // not required, defaults handled in logger
	}
}
