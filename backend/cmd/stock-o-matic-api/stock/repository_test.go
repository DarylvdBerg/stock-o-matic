package stock

import (
	"context"
	"testing"

	corev1 "github.com/DarylvdBerg/stock-o-matic/internal/proto/core/v1"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// newTestRepository creates a repository backed by an in-memory SQLite database.
func newTestRepository(t *testing.T) *Repository {
	t.Helper()

	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		Logger: logger.Discard,
	})
	require.NoError(t, err)

	return NewRepository(context.Background(), db)
}

func TestUpdateStock_QuantityToZero_Persists(t *testing.T) {
	ctx := context.Background()
	repo := newTestRepository(t)

	added, err := repo.AddStock(ctx, &corev1.Stock{Name: "Milk", Quantity: 1})
	require.NoError(t, err)
	require.NotNil(t, added.Id)

	_, err = repo.UpdateStock(ctx, *added.Id, &corev1.Stock{Name: "Milk", Quantity: 0})
	require.NoError(t, err)

	stored, err := repo.GetStock(ctx)
	require.NoError(t, err)
	require.Len(t, stored, 1)
	assert.Equal(t, int32(0), stored[0].Quantity)
}

func TestUpdateStock_ImageURLCleared_Persists(t *testing.T) {
	ctx := context.Background()
	repo := newTestRepository(t)

	added, err := repo.AddStock(ctx, &corev1.Stock{Name: "Milk", Quantity: 2, ImageUrl: "https://example.com/milk.png"})
	require.NoError(t, err)
	require.NotNil(t, added.Id)

	_, err = repo.UpdateStock(ctx, *added.Id, &corev1.Stock{Name: "Milk", Quantity: 2, ImageUrl: ""})
	require.NoError(t, err)

	stored, err := repo.GetStock(ctx)
	require.NoError(t, err)
	require.Len(t, stored, 1)
	assert.Empty(t, stored[0].ImageUrl)
}

func TestUpdateStock_QuantityIncrease_Persists(t *testing.T) {
	ctx := context.Background()
	repo := newTestRepository(t)

	added, err := repo.AddStock(ctx, &corev1.Stock{Name: "Milk", Quantity: 1})
	require.NoError(t, err)
	require.NotNil(t, added.Id)

	_, err = repo.UpdateStock(ctx, *added.Id, &corev1.Stock{Name: "Milk Semi-Skimmed", Quantity: 5})
	require.NoError(t, err)

	stored, err := repo.GetStock(ctx)
	require.NoError(t, err)
	require.Len(t, stored, 1)
	assert.Equal(t, int32(5), stored[0].Quantity)
	assert.Equal(t, "Milk Semi-Skimmed", stored[0].Name)
}
