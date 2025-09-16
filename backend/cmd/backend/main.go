package main

import (
	"log/slog"
	"os"

	"github.com/crutch-master/upgraded-octo-train/backend/internal/app"
)

func main() {
	app, err := app.Setup()
	if err != nil {
		slog.Error("error setting up", "err", err)
		os.Exit(1)
	}

	if err := app.Serve(); err != nil {
		slog.Error("error serving", "err", err)
		os.Exit(1)
	}
}
