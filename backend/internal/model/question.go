package model

type Question struct {
	Quesiton string    `json:"question"`
	Answers  [4]string `json:"answers"`
}

type QuestionWithAnswer struct {
	Question
	Correct int `json:"correct"`
}

type QuestionSet = []QuestionWithAnswer
