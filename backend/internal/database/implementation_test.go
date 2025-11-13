package database

import (
	"context"
	"fmt"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

func TestRepository_Query_Success(t *testing.T) {
	ctx := context.Background()

	// create sqlmock DB (use regex matcher so ExpectQuery("^SELECT 1$") works)
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	// get a *sql.Conn from the mock DB
	conn, err := db.Conn(ctx)
	if err != nil {
		t.Fatalf("failed to get conn from db: %v", err)
	}
	defer conn.Close()

	// put the connection into context using package helper
	ctx = with(ctx, conn)

	// prepare mock rows and expectation
	rows := sqlmock.NewRows([]string{"col"}).AddRow("hello")
	mock.ExpectQuery("^SELECT 1$").WillReturnRows(rows)

	var repo Repository[string]
	res, qerr := repo.Query(ctx, "SELECT 1")
	if qerr != nil {
		t.Fatalf("unexpected error from Query: %v", qerr)
	}
	if res == nil {
		t.Fatalf("expected non-nil result")
	}
	if *res != "hello" {
		t.Fatalf("unexpected result value: got %v want %v", *res, "hello")
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet sqlmock expectations: %v", err)
	}
}

func TestRepository_Query_QueryError(t *testing.T) {
	ctx := context.Background()

	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	conn, err := db.Conn(ctx)
	if err != nil {
		t.Fatalf("failed to get conn from db: %v", err)
	}
	defer conn.Close()

	ctx = with(ctx, conn)

	// make the query return an error
	mock.ExpectQuery("^SELECT 1$").WillReturnError(fmt.Errorf("boom"))

	var repo Repository[string]
	res, qerr := repo.Query(ctx, "SELECT 1")
	if qerr == nil {
		t.Fatalf("expected error from Query, got nil")
	}
	if res != nil {
		t.Fatalf("expected nil result on error, got %v", res)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet sqlmock expectations: %v", err)
	}
}
