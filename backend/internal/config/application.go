package config

import (
	"context"
	"os"
)

// ApplicationConfig holds the application-level configuration.
type ApplicationConfig struct {
	ServerAddr string
	LogLevel   string
}

// LoadApplicationConfig loads the application configuration from environment variables.
func LoadApplicationConfig(ctx context.Context) *ApplicationConfig {
	return &ApplicationConfig{
		ServerAddr: MustEnv(ctx, "SERVER_ADDR"),
		LogLevel:   os.Getenv("LOG_LEVEL"), // not required, defaults handled in logger
	}
}
