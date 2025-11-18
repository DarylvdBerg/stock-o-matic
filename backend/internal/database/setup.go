package database

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/DarylvdBerg/stock-o-matic/internal/config"
	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Database struct {
	DB  *gorm.DB
	sql *sql.DB
}

// InitializeDatabase initializes the database connection using GORM and returns the DB handle.
func InitializeDatabase(ctx context.Context, dbConfig *config.DatabaseConfig) *Database {
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", dbConfig.Host, dbConfig.Port, dbConfig.User, dbConfig.Password, dbConfig.Name)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logging.Fatal(ctx, "Failed to connect to database.", zap.Error(err))
	}

	sqlDb, err := db.DB()
	if err != nil {
		logging.Fatal(ctx, "Failed to get sql.DB from gorm DB.", zap.Error(err))
	}

	return &Database{
		DB:  db,
		sql: sqlDb,
	}
}

// Close closes the database connection.
func (db *Database) Close(ctx context.Context) {
	if err := db.sql.Close(); err != nil {
		logging.Error(ctx, "failed to close database connection.", zap.Error(err))
	}
}
