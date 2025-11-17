package main

import (
	"context"
	"database/sql"
	"os/signal"
	"syscall"
	"time"

	"connectrpc.com/grpcreflect"
	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/rpcs"
	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/stock"
	"github.com/DarylvdBerg/stock-o-matic/internal/config"
	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"github.com/DarylvdBerg/stock-o-matic/internal/proto/stock/v1/stockv1connect"
	"github.com/DarylvdBerg/stock-o-matic/internal/server"
	"go.uber.org/zap"
)

const (
	timeoutDuration = 15 * time.Second
)

func main() {
	logging.Setup()
	// Create an application context that is cancelled on SIGINT or SIGTERM
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Initialize the database connection
	dbCfg := config.LoadDatabaseConfig(ctx)
	db, conn := database.InitializeDatabase(ctx, dbCfg)

	ctx = database.With(ctx, conn)

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

	sRepository := stock.NewRepository(conn)
	stockServer := rpcs.NewStockServer(*sRepository)
	grpcServer := server.NewServer(appCfg.ServerAddr)

	// Enable server reflection.
	reflector := grpcreflect.NewStaticReflector(
		rpcs.StockServerName,
	)

	grpcServer.Mux.Handle(grpcreflect.NewHandlerV1(reflector))
	grpcServer.Mux.Handle(grpcreflect.NewHandlerV1Alpha(reflector))
	grpcServer.Mux.Handle(stockv1connect.NewStockServiceHandler(stockServer))

	go func() {
		if serr := grpcServer.Start(ctx); serr != nil {
			zap.L().Fatal("unable to start server", zap.Error(serr))
		}
	}()

	// listen for the context to be done (SIGINT or SIGTERM)
	<-ctx.Done()

	// Create new context to shut down the server
	shutdownCtx, cancel := context.WithTimeout(context.Background(), timeoutDuration)
	defer cancel()

	// Shutdown server gracefully after context is done
	zap.L().Sugar().Info("Shutting down server...")
	go func() {
		if serr := grpcServer.Shutdown(shutdownCtx); serr != nil {
			zap.L().Fatal("unable to shutdown server", zap.Error(serr))
		}
	}()

	grpcServer.WaitForShutdown(shutdownCtx)
}
