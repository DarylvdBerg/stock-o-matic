package main

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/rpcs"
	"github.com/DarylvdBerg/stock-o-matic/internal/config"
	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"github.com/DarylvdBerg/stock-o-matic/internal/proto/stock/v1/stockv1connect"
	"go.uber.org/zap"
)

func main() {
	logging.Setup()
	// Create an application context that is cancelled on SIGINT or SIGTERM
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Initialize the database connection
	dbCfg := config.LoadDatabaseConfig(ctx)
	db, conn := database.InitializeDatabase(ctx, dbCfg)

	defer func(db *sql.DB) {
		err := db.Close()
		if err != nil {
			zap.L().Error("Error closing db", zap.Error(err))
		}
	}(db)

	defer func(conn *sql.Conn) {
		err := conn.Close()
		if err != nil {
			zap.L().Error("unable to close database", zap.Error(err))
		}
	}(conn)

	// Setup GRPC server.
	appCfg := config.LoadApplicationConfig(ctx)

	stockServer := &rpcs.StockServer{}
	mux := http.NewServeMux()
	path, handler := stockv1connect.NewStockServiceHandler(stockServer)
	mux.Handle(path, handler)

	p := new(http.Protocols)
	p.SetHTTP1(true)
	p.SetUnencryptedHTTP2(true)

	server := &http.Server{
		Addr:      appCfg.ServerAddr,
		Handler:   mux,
		Protocols: p,
	}

	go func() {
		zap.L().Sugar().Infof("Starting server on addr: %s", appCfg.ServerAddr)
		if err := server.ListenAndServe(); err != nil {
			if !errors.Is(err, http.ErrServerClosed) {
				zap.L().Error("Error starting server", zap.Error(err))
			}
		}
	}()
	// listen for the context to be done (SIGINT or SIGTERM)
	<-ctx.Done()

	// Create new context to shut down the server
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Shutdown server gracefully after context is done
	zap.L().Sugar().Info("Shutting down server...")
	go func() {
		if serr := server.Shutdown(shutdownCtx); serr != nil {
			if !errors.Is(serr, http.ErrServerClosed) {
				zap.L().Error("unable to shutdown server gracefully", zap.Error(serr))
			}
		}
	}()

	select {
	case <-shutdownCtx.Done():
		if errors.Is(shutdownCtx.Err(), context.DeadlineExceeded) {
			zap.L().Fatal("server shutdown timed out")
		}
	}
}
