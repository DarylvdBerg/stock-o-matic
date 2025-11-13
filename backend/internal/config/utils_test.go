package config_test

import (
	"os"
	"os/exec"
	"testing"

	"github.com/DarylvdBerg/stock-o-matic/internal/config"
	"github.com/stretchr/testify/require"
)

func TestMustEnv_ValueNotExists_Fatal(t *testing.T) {
	if os.Getenv("TEST_MUSTENV_FATAL") == "1" {
		// In subprocess: this should call os.Exit
		_ = config.MustEnv(t.Context(), "MISSING_ENV_VAR")
		return
	}

	cmd := exec.Command(os.Args[0], "-test.run=TestMustEnv_ValueNotExists_Fatal")
	cmd.Env = append(os.Environ(), "TEST_MUSTENV_FATAL=1")
	err := cmd.Run()

	if exitErr, ok := err.(*exec.ExitError); ok && !exitErr.Success() {
		// os.Exit was called as expected
		return
	}
	t.Fatalf("expected os.Exit to be called, but it was not")
}

func TestMustEnv_ValueExists_ReturnsValue(t *testing.T) {
	envName := "TEST_ENV_VAR"
	expectedValue := "test_value"
	t.Setenv(envName, expectedValue)
	result := config.MustEnv(t.Context(), envName)

	require.Equal(t, expectedValue, result)
	if result != expectedValue {
		t.Errorf("Expected %s, got %s", expectedValue, result)
	}
}

func TestMustEnv_ValueExists_ReturnsDefault(t *testing.T) {
	envName := "TEST_ENV_VAR"
	result := config.GetEnvOrDefault(t.Context(), envName, "default_value").(string)

	require.Equal(t, "default_value", result)
}

func TestGetEnvOrDefault_ValueExists_ReturnsValue(t *testing.T) {
	envName := "TEST_ENV_VAR"
	expectedValue := "test_value"
	t.Setenv(envName, expectedValue)
	result := config.GetEnvOrDefault(t.Context(), envName, "default_value").(string)

	require.Equal(t, expectedValue, result)
}
