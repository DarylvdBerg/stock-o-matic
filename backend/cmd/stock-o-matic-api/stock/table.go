package stock

import (
	"context"
	"fmt"

	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

const (
	tableName = "stocks"
)

type table struct {
	db *sqlx.DB
}

// newTable creates a new table instance for managing the stocks table.
func newTable(ctx context.Context, db *sqlx.DB) *table {
	t := &table{
		db: db,
	}

	t.initTableIfNotExists(ctx)

	return t
}

// initTableIfNotExists initializes the stocks table if it does not already exist.
func (t *table) initTableIfNotExists(ctx context.Context) {
	// Ensure the pgcrypto extension is available for gen_random_uuid()
	_, err := t.db.ExecContext(ctx, `CREATE EXTENSION IF NOT EXISTS pgcrypto`)
	if err != nil {
		logging.Fatal(ctx, "Failed to create pgcrypto extension", zap.Error(err))
	}

	q := fmt.Sprintf(`CREATE TABLE IF NOT EXISTS %s 
	(
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name TEXT NOT NULL,
	quantity INTEGER NOT NULL
	)`, tableName)

	_, err = t.db.ExecContext(ctx, q)
	if err != nil {
		logging.Fatal(ctx, "Failed to create stocks table", zap.Error(err))
	}
}
