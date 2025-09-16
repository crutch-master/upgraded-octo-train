package join

import (
	"log/slog"
	"net/http"

	"github.com/crutch-master/upgraded-octo-train/backend/internal/core"
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

	var joinParams struct {
		RoomID   string `json:"roomID"`
		Nickname string `json:"nickname"`
	}
	if err := conn.ReadJSON(&joinParams); err != nil {
		slog.Error("failed to join params", "err", err)
		return
	}

	room := h.store.Find(joinParams.RoomID)
	if room == nil {
		slog.Error("room with id not found", "id", joinParams.RoomID)
		return
	}

	player := room.Join(joinParams.Nickname)
	defer player.Leave()

	answers := make(chan int)

	go func() {
		defer close(answers)

		for {
			var answer int
			if err := conn.ReadJSON(&answer); err != nil {
				slog.Error("failed to read answer", "err", err)
				return
			}

			answers <- answer
		}
	}()

	for {
		select {
		case ans, ok := <-answers:
			if !ok {
				return
			}

			player.Answer(ans)

		case q, ok := <-player.NewQuestion():
			if !ok {
				return
			}

			if err := conn.WriteJSON(q); err != nil {
				slog.Error("failed to write new question", "err", err)
				return
			}
		}
	}
}
