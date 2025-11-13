package server

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/DarylvdBerg/stock-o-matic/internal/logging"
	"go.uber.org/zap"
)

const (
	ReadHeaderTimeout = 10 * time.Second
)

type Server struct {
	Mux    *http.ServeMux
	Server *http.Server
}

func NewServer(serverAddr string) *Server {
	mux := http.NewServeMux()

	p := new(http.Protocols)
	p.SetHTTP1(true)
	p.SetUnencryptedHTTP2(true)

	return &Server{
		Mux: mux,
		Server: &http.Server{
			Addr:              serverAddr,
			ReadHeaderTimeout: ReadHeaderTimeout,
			Handler:           mux,
			Protocols:         p,
		},
	}
}

func (s *Server) Start(ctx context.Context) error {
	logging.Infof(ctx, "Starting server on %s", s.Server.Addr)

	if err := s.Server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return err
	}

	return nil
}

func (s *Server) Shutdown(ctx context.Context) error {
	logging.Info(ctx, "Shutting down server")
	if err := s.Server.Shutdown(ctx); err != nil {
		if !errors.Is(err, http.ErrServerClosed) {
			return err
		}
	}

	return nil
}

func (s *Server) WaitForShutdown(shutdownCtx context.Context) {
	<-shutdownCtx.Done()

	if errors.Is(shutdownCtx.Err(), context.DeadlineExceeded) {
		zap.L().Fatal("server shutdown timed out")
	}
}
