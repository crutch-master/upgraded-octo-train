package core

import "github.com/crutch-master/upgraded-octo-train/backend/internal/model"

type PlayerID string

type Player struct {
	id         PlayerID
	room       *Room
	nickname   string
	gotCorrect int

	newQuestion chan model.Question
}

func (p *Player) Leave() {
	p.room.leave(p.id)
}

func (p *Player) Answer(option int) {
	p.room.answer(p.id, option)
}

func (p *Player) NewQuestion() <-chan model.Question {
	return p.newQuestion
}
