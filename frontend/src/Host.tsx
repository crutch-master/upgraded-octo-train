import { createEffect, createSignal, For, Match, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import HostClient from "./api/host";
import type { Player, Question, QuestionWithAns } from "./api/types";
import { Button, Link } from "./components";

const mockQuestions: QuestionWithAns[] = [
	{
		question: "1 + 1",
		answers: ["1", "2", "3", "4"],
		correct: 1,
	},
	{
		question: "2 + 2",
		answers: ["1", "4", "5", "1984"],
		correct: 1,
	},
];

type State =
	| { type: "connecting" }
	| { type: "connected"; roomID: string }
	| { type: "question"; question: Question }
	| { type: "results"; results: Player[] }
	| { type: "disconnected" };

const Host = () => {
	const [state, setState] = createStore<State>({ type: "connecting" });

	const [counter, setCounter] = createSignal<number | undefined>(undefined);
	let interval: number | undefined;

	const host = new HostClient({
		onConnect(roomID) {
			setState({ type: "connected", roomID });
		},

		onNewQuestion(question) {
			setState({ type: "question", question });

			clearInterval(interval);
			setCounter(30);

			interval = setInterval(() => {
				setCounter((c) => (c as number) - 1);
			}, 1000);
		},

		onEnd(results) {
			setState({
				type: "results",
				results: results.sort((a, b) => b.correct - a.correct),
			});
		},

		onDisconnect() {
			if (state.type !== "results") {
				setState({ type: "disconnected" });
			}
		},
	});

	createEffect(() => {
		if (counter() !== 0) {
			return;
		}

		host.next();
	});

	return (
		<div class="flex flex-col gap-5">
			<Switch>
				<Match when={state.type === "connecting"}>
					<div class="text-3xl text-center">Connecting...</div>
				</Match>

				<Match when={state.type === "connected"}>
					<div class="text-3xl text-center">
						Your room ID:{" "}
						{(state as Extract<State, { type: "connected" }>).roomID}
					</div>
					<Button
						onClick={() => host.loadQuestions(mockQuestions)}
						class="text-3xl w-full"
					>
						Start
					</Button>
				</Match>

				<Match when={state.type === "question"}>
					<div class="text-3xl text-center">Current question:</div>
					<div class="text-3xl text-center mb-10">
						{(state as Extract<State, { type: "question" }>).question.question}
					</div>

					<For
						each={
							(state as Extract<State, { type: "question" }>).question.answers
						}
					>
						{(item, index) => (
							<div class="border-2 rounded-lg p-5 text-3xl">
								{index() + 1}. {item}
							</div>
						)}
					</For>

					<div class="text-center text-3xl mt-10">
						Time till next question: {counter()}s
					</div>

					<Button onClick={() => host.next()} class="text-3xl w-full">
						Skip question
					</Button>
				</Match>

				<Match when={state.type === "results"}>
					<div class="text-3xl text-center mb-10">
						Game finished. <br /> Here are the results:
					</div>

					<For each={(state as Extract<State, { type: "results" }>).results}>
						{(item, index) => (
							<div class="text-3xl flex flex-row justify-between">
								<div>
									{index() + 1}. {item.nickname}
								</div>
								<div>{item.correct} points</div>
							</div>
						)}
					</For>

					<Link href="/" class="text-3xl block mt-10">
						Back home
					</Link>
				</Match>

				<Match when={state.type === "disconnected"}>
					<div class="text-3xl text-center">Game finished.</div>

					<Link href="/" class="text-3xl block">
						Back home
					</Link>
				</Match>
			</Switch>
		</div>
	);
};

export default Host;
