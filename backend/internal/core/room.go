package core

import (
	"sync"

	"github.com/crutch-master/upgraded-octo-train/backend/internal/model"
	"github.com/crutch-master/upgraded-octo-train/backend/internal/util"
)

type Room struct {
	mutex sync.RWMutex

	id    string
	store *Store

	questions    model.QuestionSet
	currQuestion int
	players      map[PlayerID]*Player
	currAnswers  map[PlayerID]int
}

func (r *Room) GetId() string {
	return r.id
}

func (r *Room) GetCurrentQuestion() model.Question {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	return r.questions[r.currQuestion].Question
}

func (r *Room) Join(nickname string) *Player {
	var (
		id = PlayerID(util.RandomBase64(1))
		p  = &Player{
			id:       id,
			room:     r,
			nickname: nickname,

			// Buffered so that writing in r.Next doesn't block.
			//
			// Also helps avoid a possible deadlock.
			// Let's imagine that r.mutex is locked by a call to
			// r.Next. But writing to the channel inside it is blocked
			// since the player has already stopped reading it. Once
			// player has stopped reading the channel he's trying to
			// call r.leave which also blocks due to r.mutex.
			newQuestion: make(chan model.Question, 1),
		}
	)

	r.mutex.Lock()
	defer r.mutex.Unlock()

	r.players[p.id] = p

	return p
}

func (r *Room) Done() {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	for _, p := range r.players {
		close(p.newQuestion)
	}
}

func (r *Room) GetResults() model.Results {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	res := make(model.Results, 0, len(r.players))

	for _, p := range r.players {
		res = append(res, model.Player{
			Nickname: p.nickname,
			Correct:  p.gotCorrect,
		})
	}

	return res
}

func (r *Room) LoadQuestions(q model.QuestionSet) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	r.questions = q
	r.store.delete(r.id)
}

func (r *Room) Next() (hasNext bool) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	for id, ans := range r.currAnswers {
		if ans != r.questions[r.currQuestion].Correct {
			continue
		}

		p, ok := r.players[id]
		if !ok || p == nil {
			continue
		}

		p.gotCorrect += 1
	}

	r.currAnswers = make(map[PlayerID]int)
	r.currQuestion += 1

	if r.currQuestion < len(r.questions) {
		for _, p := range r.players {
			p.newQuestion <- r.questions[r.currQuestion].Question
		}

		hasNext = true
	}

	return
}

func (r *Room) leave(id PlayerID) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	delete(r.players, id)
}

func (r *Room) answer(id PlayerID, option int) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	r.currAnswers[id] = option
}
