import { Index, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import PlayerClient from "./api/player";
import type { Question } from "./api/types";
import { Button, Link } from "./components";
import * as s from "./util/union-store";

type State =
	| { type: "idle"; nickname: string; roomID: string; error?: string }
	| { type: "connected"; player: PlayerClient }
	| { type: "question"; player: PlayerClient; question: Question }
	| { type: "finished" };

const extract = s.extract<State>();

const extractSet = s.extractSet<State>();

const Join = () => {
	const [state, setState] = createStore<State>({
		type: "idle",
		nickname: "",
		roomID: "",
	});

	const connect = () => {
		if (state.type !== "idle") return;

		if (state.roomID.length === 0) {
			extractSet<"idle">(setState)("error", "Enter room ID");
			return;
		}

		if (state.nickname.length === 0) {
			extractSet<"idle">(setState)("error", "Enter nickname");
			return;
		}

		setState({
			type: "connected",
			player: new PlayerClient({
				roomID: state.roomID,
				nickname: state.nickname,

				onNewQuestion(question) {
					setState((state) => ({
						type: "question",
						player: extract<"connected" | "question">(state).player,
						question,
					}));
				},

				onEnd() {
					setState({ type: "finished" });
				},
			}),
		});
	};

	const answer = (option: number) => () => {
		if (state.type !== "question") return;

		state.player.answer(option);
	};

	return (
		<div class="flex flex-col gap-5">
			<Switch>
				<Match when={state.type === "idle"}>
					<input
						class="border-2 border-solid rounded-lg text-3xl p-5 w-full"
						placeholder="Room ID"
						value={extract<"idle">(state).roomID}
						onChange={(event) =>
							extractSet<"idle">(setState)("roomID", event.target.value)
						}
					/>

					<input
						class="border-2 border-solid rounded-lg text-3xl p-5 w-full"
						placeholder="Nickname"
						value={extract<"idle">(state).nickname}
						onChange={(event) =>
							extractSet<"idle">(setState)("nickname", event.target.value)
						}
					/>

					<Show when={extract<"idle">(state).error !== undefined}>
						<div class="text-3xl text-center text-red-800">
							{extract<"idle">(state).error}
						</div>
					</Show>

					<Button onClick={connect} class="w-full text-3xl">
						Connect
					</Button>
				</Match>

				<Match when={state.type === "connected"}>
					<div class="text-3xl text-center">Starting soon...</div>
				</Match>

				<Match when={state.type === "question"}>
					<div class="text-3xl text-center">Current question:</div>
					<div class="text-3xl text-center mb-10">
						{extract<"question">(state).question.question}
					</div>

					<Index each={extract<"question">(state).question.answers}>
						{(item, index) => (
							<Button onClick={answer(index)} class="text-3xl">
								{item()}
							</Button>
						)}
					</Index>
				</Match>

				<Match when={state.type === "finished"}>
					<div class="text-3xl text-center">Game finished.</div>

					<Link href="/" class="text-3xl block">
						Back home
					</Link>
				</Match>
			</Switch>
		</div>
	);
};

export default Join;
