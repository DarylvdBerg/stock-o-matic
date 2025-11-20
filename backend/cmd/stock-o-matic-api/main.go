package main

import (
	"context"
	"os/signal"
	"syscall"
	"time"

	"connectrpc.com/grpcreflect"
	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/category"
	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/rpcs"
	"github.com/DarylvdBerg/stock-o-matic/cmd/stock-o-matic-api/stock"
	"github.com/DarylvdBerg/stock-o-matic/internal/config"
	"github.com/DarylvdBerg/stock-o-matic/internal/database"
	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"github.com/DarylvdBerg/stock-o-matic/internal/proto/services/v1/servicesv1connect"
	"github.com/DarylvdBerg/stock-o-matic/internal/server"
	"go.uber.org/zap"
)

const (
	timeoutDuration = 15 * time.Second
)

func main() {
	// Create an application context that is cancelled on SIGINT or SIGTERM
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Load application config (includes log level)
	appCfg := config.LoadApplicationConfig(ctx)
	logging.Setup(appCfg.LogLevel)

	// Initialize the database connection
	dbCfg := config.LoadDatabaseConfig(ctx)
	db := database.InitializeDatabase(ctx, dbCfg)
	defer db.Close(ctx)

	// Setup GRPC server.
	sRepository := stock.NewRepository(ctx, db.DB)
	stockServer := rpcs.NewStockServer(*sRepository)

	cRepository := category.NewRepository(ctx, db.DB)
	categoryServer := rpcs.NewCategoryServer(*cRepository)

	grpcServer := server.NewServer(appCfg.ServerAddr)

	// Enable server reflection.
	reflector := grpcreflect.NewStaticReflector(
		rpcs.StockServerName,
		rpcs.CategoryServerName,
	)

	grpcServer.Mux.Handle(grpcreflect.NewHandlerV1(reflector))
	grpcServer.Mux.Handle(grpcreflect.NewHandlerV1Alpha(reflector))
	grpcServer.Mux.Handle(servicesv1connect.NewStockServiceHandler(stockServer))
	grpcServer.Mux.Handle(servicesv1connect.NewCategoryServiceHandler(categoryServer))

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
	if serr := grpcServer.Shutdown(shutdownCtx); serr != nil {
		zap.L().Fatal("unable to shutdown server", zap.Error(serr))
	}
}
