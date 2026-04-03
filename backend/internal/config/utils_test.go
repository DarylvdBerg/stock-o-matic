package config_test

import (
	"os"
	"os/exec"
	"testing"

	"github.com/DarylvdBerg/stock-o-matic/internal/config"
	"github.com/stretchr/testify/assert"
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
}

func TestGetEnvOrDefault_NotSet_ReturnsDefault(t *testing.T) {
	result := config.GetEnvOrDefault(t.Context(), "UNSET_VAR", "default_value")

	assert.Equal(t, "default_value", result)
}

func TestGetEnvOrDefault_Set_ReturnsValue(t *testing.T) {
	t.Setenv("TEST_ENV_VAR", "test_value")
	result := config.GetEnvOrDefault(t.Context(), "TEST_ENV_VAR", "default_value")

	assert.Equal(t, "test_value", result)
}

func TestGetEnvOrDefaultInt_NotSet_ReturnsDefault(t *testing.T) {
	result := config.GetEnvOrDefaultInt(t.Context(), "UNSET_VAR", 5432)

	assert.Equal(t, 5432, result)
}

func TestGetEnvOrDefaultInt_Set_ReturnsParsedValue(t *testing.T) {
	t.Setenv("TEST_PORT", "3000")
	result := config.GetEnvOrDefaultInt(t.Context(), "TEST_PORT", 5432)

	assert.Equal(t, 3000, result)
}

func TestGetEnvOrDefaultInt_InvalidInt_ReturnsDefault(t *testing.T) {
	t.Setenv("TEST_PORT", "not_a_number")
	result := config.GetEnvOrDefaultInt(t.Context(), "TEST_PORT", 5432)

	assert.Equal(t, 5432, result)
}
