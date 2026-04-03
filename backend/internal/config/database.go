package config

import (
	"context"
)

const (
	defaultPort = 5432
)

// DatabaseConfig holds the database connection configuration.
type DatabaseConfig struct {
	Host     string
	User     string
	Password string
	Name     string
	Port     int
}

// LoadDatabaseConfig loads the database configuration from environment variables.
func LoadDatabaseConfig(ctx context.Context) *DatabaseConfig {
	return &DatabaseConfig{
		Host:     MustEnv(ctx, "DB_HOST"),
		User:     MustEnv(ctx, "DB_USER"),
		Password: MustEnv(ctx, "DB_PASSWORD"),
		Name:     MustEnv(ctx, "DB_NAME"),
		Port:     GetEnvOrDefaultInt(ctx, "DB_PORT", defaultPort),
	}
}
