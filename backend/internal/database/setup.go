package database

import (
	"context"
	"fmt"

	"github.com/DarylvdBerg/stock-o-matic/internal/config"
	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// InitializeDatabase initializes the database connection and stores it in the context.
// We'll return both the database handle and the connection object so we can shut it down properly later.
//func InitializeDatabase(ctx context.Context, dbConfig *config.DatabaseConfig) (*sqlx.DB, *sql.Conn) {
//	// Initialize the database connection
//	db, err := sqlx.Open(
//		"postgres",
//		fmt.Sprintf("user=%s password=%s host=%s port=%d dbname=%s sslmode=disable",
//			dbConfig.User, dbConfig.Password, dbConfig.Host, dbConfig.Port, dbConfig.Name))
//
//	if err != nil {
//		logging.Fatal(ctx, "Failed to connect to database", zap.Error(err))
//	}
//
//	// Initialize the connection
//	conn, err := db.Conn(ctx)
//	if err != nil {
//		logging.Fatal(ctx, "Failed to initialize database connection", zap.Error(err))
//	}
//
//	return db, conn
//}

// InitializeDatabase initializes the database connection using GORM and returns the DB handle.
func InitializeDatabase(ctx context.Context, dbConfig *config.DatabaseConfig) *gorm.DB {
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", dbConfig.Host, dbConfig.Port, dbConfig.User, dbConfig.Password, dbConfig.Name)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logging.Fatal(ctx, "Failed to connect to database.", zap.Error(err))
	}

	return db
}
