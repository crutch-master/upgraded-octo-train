package model

type Player struct {
	Nickname string `json:"nickname"`
	Correct  int    `json:"correct"`
}

type Results = []Player
