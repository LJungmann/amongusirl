import {
	createEffect,
	createSignal,
	Match,
	onMount,
	Switch,
	type Component,
} from "solid-js";

import ReloadPrompt from "./components/ReloadPromp";
import NFCTest from "./components/NFCTest";
import Lobby from "./components/Lobby";
import Game from "./components/Game";

type State = "lobby" | "game";

export const [gameState, setGameState] = createSignal<State>("lobby");
const App: Component = () => {
	onMount(async () => {
		setsignal("querying...");
		const response = await fetch("https://among-us-irl.mcdle.net/gameState");
		setsignal("querying done");

		setsignal(await response.json());
	});

	const [signal, setsignal] = createSignal<string>("not queried yet");

	return (
		<div>
			<Switch>
				<Match when={gameState() === "lobby"}>
					<Lobby />
				</Match>
				<Match when={gameState() === "game"}>
					<Game />
				</Match>
			</Switch>
			{/* <NFCTest /> */}
			<ReloadPrompt />
			<p>
				data:
				{JSON.stringify(signal(), null, 2)}
			</p>
		</div>
	);
};

export default App;
