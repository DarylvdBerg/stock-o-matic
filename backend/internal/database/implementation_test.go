package database

import (
	"testing"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

func TestRepository_Query_Success(t *testing.T) {
	ctx := t.Context()

	// create in-memory SQLite DB
	db, err := sqlx.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	// create schema and seed data
	_, err = db.Exec("CREATE TABLE test (col TEXT);")
	if err != nil {
		t.Fatalf("failed to create table: %v", err)
	}
	_, err = db.Exec("INSERT INTO test (col) VALUES ('hello')")
	if err != nil {
		t.Fatalf("failed to insert row: %v", err)
	}

	var repo = NewImplementation[string](db)
	res, qerr := repo.Query(ctx, "SELECT col FROM test")
	if qerr != nil {
		t.Fatalf("unexpected error from Query: %v", qerr)
	}
	if res == nil {
		t.Fatalf("expected non-nil result")
	}
	if *res != "hello" {
		t.Fatalf("unexpected result value: got %v want %v", *res, "hello")
	}
}

func TestRepository_Query_QueryError(t *testing.T) {
	ctx := t.Context()

	db, err := sqlx.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	var repo = NewImplementation[string](db)
	res, qerr := repo.Query(ctx, "SELECT col FROM non_existent_table")
	if qerr == nil {
		t.Fatalf("expected error from Query, got nil")
	}
	if res != nil {
		t.Fatalf("expected nil result on error, got %v", res)
	}
}

func TestRepository_Upsert_Success(t *testing.T) {
	ctx := t.Context()
	// create in-memory SQLite DB
	db, err := sqlx.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	_, err = db.Exec("CREATE TABLE test (col TEXT);")
	if err != nil {
		t.Fatalf("failed to create table: %v", err)
	}

	repo := NewImplementation[string](db)
	res, upsertErr := repo.Upsert(ctx, "INSERT INTO test (col) VALUES ('upserted')")
	if upsertErr != nil {
		t.Fatalf("unexpected error from Upsert: %v", upsertErr)
	}
	if res != nil {
		t.Fatalf("expected nil result from Upsert, got %v", res)
	}

	// Validate row was inserted
	var val string
	err = db.Get(&val, "SELECT col FROM test WHERE col = 'upserted'")
	if err != nil {
		t.Fatalf("failed to fetch inserted row: %v", err)
	}
	if val != "upserted" {
		t.Fatalf("unexpected value in db: got %v want %v", val, "upserted")
	}
}

func TestRepository_Upsert_QueryError(t *testing.T) {
	ctx := t.Context()
	db, err := sqlx.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	repo := NewImplementation[string](db)
	res, upsertErr := repo.Upsert(ctx, "INSERT INTO non_existent_table (col) VALUES ('fail')")
	if upsertErr == nil {
		t.Fatalf("expected error from Upsert, got nil")
	}
	if res != nil {
		t.Fatalf("expected nil result on error, got %v", res)
	}
}
