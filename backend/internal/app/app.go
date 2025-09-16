package app

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/crutch-master/upgraded-octo-train/backend/internal/core"
	"github.com/crutch-master/upgraded-octo-train/backend/internal/handler/host"
	"github.com/crutch-master/upgraded-octo-train/backend/internal/handler/join"
)

type App struct {
	server *http.Server
}

func Setup() (*App, error) {
	store := core.New()

	mux := http.NewServeMux()

	mux.Handle("/ws/host", host.New(store))
	mux.Handle("/ws/join", join.New(store))
	mux.Handle("/", http.FileServer(http.Dir("./dist")))

	return &App{
		server: &http.Server{
			Addr:    ":8080",
			Handler: mux,
		},
	}, nil
}

func (a *App) Serve() error {
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		defer close(sig)
		defer signal.Stop(sig)

		<-sig

		ctx, cancel := context.WithTimeout(context.Background(), time.Second)
		defer cancel()

		if err := a.server.Shutdown(ctx); err != nil {
			slog.Error("error shutting server down", "err", err)
		}
	}()

	return a.server.ListenAndServe()
}
