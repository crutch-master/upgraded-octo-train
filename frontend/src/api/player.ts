import type { Question } from "./types";

export default class PlayerClient {
	private readonly socket: WebSocket;

	constructor(params: {
		roomID: string;
		nickname: string;

		onNewQuestion(question: Question): void;
		onEnd(): void;
	}) {
		this.socket = new WebSocket(`${import.meta.env.VITE_SERVER_URL}/ws/join`);

		this.socket.addEventListener("open", () => {
			this.socket.send(
				JSON.stringify({
					roomID: params.roomID,
					nickname: params.nickname,
				}),
			);
		});

		this.socket.addEventListener("message", (msg) => {
			const question: Question = JSON.parse(msg.data);
			params.onNewQuestion(question);
		});

		this.socket.addEventListener("close", () => {
			params.onEnd();
		});
	}

	answer(option: number) {
		this.socket.send(JSON.stringify(option));
	}
}
