import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import * as z from "zod";
import HostClient from "./api/host";
import type { Player, Question, QuestionWithAns } from "./api/types";
import { Button, Link } from "./components";
import * as s from "./util/union-store";

const QuestionsSchema = z.array(
	z.object({
		question: z.string(),
		answers: z.array(z.string()),
		correct: z.number(),
	}),
);

type State =
	| { type: "connecting" }
	| { type: "connected"; roomID: string; error?: string }
	| { type: "question"; question: Question }
	| { type: "results"; results: Player[] }
	| { type: "disconnected" };

const extract = s.extract<State>();
const extractSet = s.extractSet<State>();

const Host = () => {
	const [state, setState] = createStore<State>({ type: "connecting" });

	const [counter, setCounter] = createSignal<number | undefined>(undefined);
	let interval: number | undefined;

	let loadedQuestions: QuestionWithAns[] = [];

	const host = new HostClient({
		onConnect(roomID) {
			setState({ type: "connected", roomID });
		},

		onNewQuestion(question) {
			setState({ type: "question", question });

			clearInterval(interval);
			setCounter(10);

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
						Your room ID: {extract<"connected">(state).roomID}
					</div>

					<input
						class="border-2 border-solid border-black rounded-lg text-3xl hover:bg-gray-200 active:bg-gray-400 p-5"
						type="file"
						accept=".json"
						oninput={async (evt) => {
							try {
								const json = await (evt.target.files ?? [])[0].text();
								const parsed = JSON.parse(json);

								loadedQuestions = QuestionsSchema.parse(parsed);
								extractSet<"connected">(setState)("error", undefined);
							} catch {
								extractSet<"connected">(setState)(
									"error",
									"Unable to parse questions",
								);
							}
						}}
					/>

					<Show when={extract<"connected">(state).error !== undefined}>
						<div class="text-3xl text-center text-red-800">
							{extract<"connected">(state).error}
						</div>
					</Show>

					<Button
						onClick={() => {
							if (loadedQuestions.length === 0) {
								extractSet<"connected">(setState)(
									"error",
									"No questions loaded",
								);

								return;
							}

							host.loadQuestions(loadedQuestions);
						}}
						class="text-3xl w-full"
					>
						Start
					</Button>
				</Match>

				<Match when={state.type === "question"}>
					<div class="text-3xl text-center">Current question:</div>
					<div class="text-3xl text-center mb-10">
						{extract<"question">(state).question.question}
					</div>

					<For each={extract<"question">(state).question.answers}>
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

					<For each={extract<"results">(state).results}>
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
