import type { Player, Question, QuestionWithAns } from "./types";

export default class HostClient {
	private readonly socket: WebSocket;
	private connected: boolean;

	constructor(params: {
		onConnect(roomID: string): void;
		onNewQuestion(question: Question): void;
		onEnd(results: Player[]): void;
		onDisconnect(): void;
	}) {
		this.socket = new WebSocket(`${import.meta.env.VITE_SERVER_URL}/ws/host`);
		this.connected = false;

		this.socket.addEventListener("message", (msg) => {
			const data = JSON.parse(msg.data);

			if (!this.connected) {
				params.onConnect(data);
				this.connected = true;
				return;
			}

			if (Array.isArray(data)) {
				params.onEnd(data);
				this.socket.close();
				return;
			}

			params.onNewQuestion(data);
		});

		this.socket.addEventListener("close", () => {
			params.onDisconnect();
		});
	}

	loadQuestions(questions: QuestionWithAns[]) {
		this.socket.send(JSON.stringify(questions));
	}

	next() {
		this.socket.send(JSON.stringify({}));
	}
}
