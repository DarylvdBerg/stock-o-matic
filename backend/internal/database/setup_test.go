package database_test

import (
	"context"
	"os"
	"os/exec"
	"testing"
	"time"

	"github.com/DarylvdBerg/stock-o-matic/internal/config"
	"github.com/DarylvdBerg/stock-o-matic/internal/database"
)

// TestInitializeDatabase_InvalidConfig_Fatal ensures InitializeDatabase calls logging.Fatal (causing process exit)
// when it cannot establish a database connection. This uses a subprocess to detect os.Exit without terminating the test runner.
func TestInitializeDatabase_InvalidConfig_Fatal(t *testing.T) {
	if os.Getenv("TEST_DB_FATAL") == "1" {
		// Child process: provide a deliberately invalid configuration so connection fails.
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		cfg := &config.DatabaseConfig{
			User:     "invalid_user",
			Password: "invalid_pass",
			Host:     "127.0.0.1", // assuming no DB on this port
			Port:     54321,
			Name:     "nonexistent_db",
		}

		// This should trigger logging.Fatal inside InitializeDatabase on failure,
		// which should call os.Exit and terminate this process.
		_, _ = database.InitializeDatabase(ctx, cfg)

		// If we reach here, InitializeDatabase did not call logging.Fatal as expected.
		return
	}

	// Parent process: spawn child and expect non-zero exit.
	cmd := exec.Command(os.Args[0], "-test.run=TestInitializeDatabase_InvalidConfig_Fatal")
	cmd.Env = append(os.Environ(), "TEST_DB_FATAL=1")
	err := cmd.Run()

	if err == nil {
		t.Fatalf("expected child process to exit with non-zero status due to logging.Fatal, but it exited successfully")
	}

	if exitErr, ok := err.(*exec.ExitError); ok {
		// Non-zero exit: expected
		_ = exitErr // nothing else to do; success
		return
	}

	t.Fatalf("expected an *exec.ExitError, got: %v", err)
}
