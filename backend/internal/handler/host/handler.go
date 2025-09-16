package host

import (
	"log/slog"
	"net/http"

	"github.com/crutch-master/upgraded-octo-train/backend/internal/core"
	"github.com/crutch-master/upgraded-octo-train/backend/internal/model"
	"github.com/gorilla/websocket"
)

type Handler struct {
	store *core.Store
}

var _ http.Handler = (*Handler)(nil)

func New(store *core.Store) *Handler {
	return &Handler{
		store: store,
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	conn, err := upgrader.Upgrade(w, req, nil)
	if err != nil {
		slog.Error("failed to upgrade to ws", "err", err)
		return
	}

	defer conn.Close()

	room := h.store.Create()
	defer room.Done()

	if err := conn.WriteJSON(room.GetId()); err != nil {
		slog.Error("failed to write room id", "err", err)
		return
	}

	var questions model.QuestionSet

	if err := conn.ReadJSON(&questions); err != nil {
		slog.Error("failed to read questions", "err", err)
		return
	}

	for {
		if err := conn.WriteJSON(room.GetCurrentQuestion()); err != nil {
			slog.Error("faield to write current question", "err", err)
			return
		}

		var msg struct{}
		if err := conn.ReadJSON(&msg); err != nil {
			slog.Error("failed to read message", "err", err)
			return
		}

		if hasNext := room.Next(); !hasNext {
			break
		}
	}

	if err := conn.WriteJSON(room.GetResults()); err != nil {
		slog.Error("failed to write results", "err", err)
		return
	}
}
