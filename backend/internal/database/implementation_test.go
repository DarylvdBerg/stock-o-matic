package database

import (
	"context"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type testModel struct {
	ID  uint   `gorm:"primaryKey"`
	Col string `gorm:"column:col"`
}

func TestRepository_QueryAll_Success(t *testing.T) {
	ctx := context.Background()
	// create in-memory SQLite DB
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		Logger: logger.Discard,
	})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	// create schema and seed data
	err = db.AutoMigrate(&testModel{})
	if err != nil {
		t.Fatalf("failed to migrate schema: %v", err)
	}
	if cerr := db.Create(&testModel{Col: "hello"}).Error; cerr != nil {
		t.Fatalf("failed to insert row: %v", err)
	}

	repo := NewImplementation[testModel](db)
	res, qerr := repo.QueryAll(ctx)
	if qerr != nil {
		t.Fatalf("unexpected error from QueryAll: %v", qerr)
	}
	if len(res) != 1 {
		t.Fatalf("expected 1 result, got %d", len(res))
	}
	if res[0].Col != "hello" {
		t.Fatalf("unexpected result value: got %v want %v", res[0].Col, "hello")
	}
}

func TestRepository_QueryAll_Empty(t *testing.T) {
	ctx := context.Background()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		Logger: logger.Discard,
	})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	err = db.AutoMigrate(&testModel{})
	if err != nil {
		t.Fatalf("failed to migrate schema: %v", err)
	}

	repo := NewImplementation[testModel](db)
	res, qerr := repo.QueryAll(ctx)
	if qerr != nil {
		t.Fatalf("unexpected error from QueryAll: %v", qerr)
	}
	if len(res) != 0 {
		t.Fatalf("expected 0 results, got %d", len(res))
	}
}

func TestRepository_Upsert_Success(t *testing.T) {
	ctx := context.Background()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		Logger: logger.Discard,
	})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	err = db.AutoMigrate(&testModel{})
	if err != nil {
		t.Fatalf("failed to migrate schema: %v", err)
	}

	repo := NewImplementation[testModel](db)
	row := testModel{Col: "upserted"}
	res, upsertErr := repo.Upsert(ctx, row)
	if upsertErr != nil {
		t.Fatalf("unexpected error from Upsert: %v", upsertErr)
	}
	if res == nil {
		t.Fatalf("expected non-nil result from Upsert")
	}
	if res.Col != "upserted" {
		t.Fatalf("unexpected value in db: got %v want %v", res.Col, "upserted")
	}

	// Validate row was inserted
	var val testModel
	err = db.First(&val, "col = ?", "upserted").Error
	if err != nil {
		t.Fatalf("failed to fetch inserted row: %v", err)
	}
	if val.Col != "upserted" {
		t.Fatalf("unexpected value in db: got %v want %v", val.Col, "upserted")
	}
}

func TestRepository_Upsert_Error(t *testing.T) {
	ctx := context.Background()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		Logger: logger.Discard,
	})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	// Do not migrate schema, so upsert will fail
	repo := NewImplementation[testModel](db)
	row := testModel{Col: "fail"}
	res, upsertErr := repo.Upsert(ctx, row)
	if upsertErr == nil {
		t.Fatalf("expected error from Upsert, got nil")
	}
	if res != nil {
		t.Fatalf("expected nil result on error, got %v", res)
	}
}
