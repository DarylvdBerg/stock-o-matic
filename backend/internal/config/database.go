package config

import (
	"context"

	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"github.com/joho/godotenv"
)

type DatabaseConfig struct {
	Host     string
	User     string
	Password string
	Name     string
	Port     int
}

// LoadDatabaseConfig loads the database configuration from environment variables.
func LoadDatabaseConfig(ctx context.Context) *DatabaseConfig {
	if err := godotenv.Load(); err != nil {
		logging.Error(ctx, ErrorLoadingDotEnv)
	}

	return &DatabaseConfig{
		Host:     MustEnv(ctx, "DB_HOST"),
		User:     MustEnv(ctx, "DB_USER"),
		Password: MustEnv(ctx, "DB_PASSWORD"),
		Name:     MustEnv(ctx, "DB_NAME"),
		Port:     GetEnvOrDefault(ctx, "DB_PORT", 5432).(int),
	}
}
