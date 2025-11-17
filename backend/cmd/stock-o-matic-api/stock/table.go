package stock

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"go.uber.org/zap"
)

const (
	tableName = "stocks"
)

type table struct {
	conn *sql.Conn
}

// newTable creates a new table instance for managing the stocks table.
func newTable(ctx context.Context, conn *sql.Conn) *table {
	t := &table{
		conn: conn,
	}

	t.initTableIfNotExists(ctx)

	return t
}

// initTableIfNotExists initializes the stocks table if it does not already exist.
func (t *table) initTableIfNotExists(ctx context.Context) {
	// Ensure the pgcrypto extension is available for gen_random_uuid()
	_, err := t.conn.ExecContext(ctx, `CREATE EXTENSION IF NOT EXISTS pgcrypto`)
	if err != nil {
		logging.Fatal(ctx, "Failed to create pgcrypto extension", zap.Error(err))
	}

	q := fmt.Sprintf(`CREATE TABLE IF NOT EXISTS %s 
	(
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name TEXT NOT NULL,
	quantity INTEGER NOT NULL
	)`, tableName)

	_, err = t.conn.ExecContext(ctx, q)
	if err != nil {
		logging.Fatal(ctx, "Failed to create stocks table", zap.Error(err))
	}
}
