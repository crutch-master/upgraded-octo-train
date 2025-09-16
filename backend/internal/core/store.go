package core

import (
	"sync"

	"github.com/crutch-master/upgraded-octo-train/backend/internal/util"
)

type Store struct {
	mutex sync.RWMutex
	rooms map[string]*Room
}

func New() *Store {
	return &Store{
		rooms: make(map[string]*Room),
	}
}

func (s *Store) Find(id string) *Room {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	return s.rooms[id]
}

func (s *Store) Create() *Room {
	var (
		id   = util.RandomBase64(2)
		room = &Room{
			id:          id,
			store:       s,
			players:     make(map[PlayerID]*Player),
			currAnswers: make(map[PlayerID]int),
		}
	)

	s.mutex.Lock()
	defer s.mutex.Unlock()

	s.rooms[id] = room

	return room
}

func (s *Store) delete(id string) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	delete(s.rooms, id)
}
