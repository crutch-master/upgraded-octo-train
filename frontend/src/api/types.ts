export type Question = {
	question: string;
	answers: string[];
};

export type QuestionWithAns = Question & {
	correct: number;
};

export type Player = {
	nickname: string;
	correct: number;
};
