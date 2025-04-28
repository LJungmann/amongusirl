import {
	createEffect,
	createSignal,
	Match,
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
	createEffect(() => {
		try {
			// console.log("gameState", gameState());
			if (gameState() === "game") {
				screen.orientation.lock("landscape");
				setScreenOrientation("landscape");
			} else {
				screen.orientation.lock("portrait");
				setScreenOrientation("portrait");
			}
		} catch (error) {
			console.error("Error locking screen orientation:", error);
			setScreenOrientation("Error locking screen orientation: " + error);
		}
	});

	const [screenOrientation, setScreenOrientation] = createSignal("");

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
		</div>
	);
};

export default App;
