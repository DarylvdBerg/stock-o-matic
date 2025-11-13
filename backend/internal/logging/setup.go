package logging

import "go.uber.org/zap"

// Setup will install a basic production logger as the global logger.
func Setup() {
	logger := zap.Must(zap.NewProduction())
	zap.ReplaceGlobals(logger)
}
