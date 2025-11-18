package logging

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Setup will install a basic production logger as the global logger, allowing log level configuration.
func Setup(level string) {
	cfg := zap.NewProductionConfig()
	parsedLevel := zapcore.InfoLevel
	if err := parsedLevel.UnmarshalText([]byte(level)); err == nil {
		cfg.Level = zap.NewAtomicLevelAt(parsedLevel)
	}
	logger := zap.Must(cfg.Build())
	zap.ReplaceGlobals(logger)
}
