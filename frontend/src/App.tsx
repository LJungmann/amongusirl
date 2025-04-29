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
type GameState = {
	currentGameId: string;
	playersConnected: number[];
	gamesCompleted: number[];
	alivePlayers: number[];
	imposterPlayerId: number;
	isGameStarted: boolean;
	isVotingActive: boolean;
	emergencyButtonPressed: boolean;
	killsEnabled: boolean;
	bodyFound: boolean;
	playersRegisteredForVoting: number[];
	votes: [number, number][]; // tuple, player has x votes
};

type PlayerData = {
	playerId: number;
};

export const [gameState, setGameState] = createSignal<State>("lobby");
export const [gameStateData, setGameStateData] = createSignal<GameState>({
	alivePlayers: [],
	bodyFound: false,
	currentGameId: "",
	emergencyButtonPressed: false,
	gamesCompleted: [],
	imposterPlayerId: -1,
	isGameStarted: false,
	isVotingActive: false,
	killsEnabled: false,
	playersConnected: [],
	playersRegisteredForVoting: [],
	votes: [],
});
export const [playerData, setPlayerData] = createSignal<PlayerData>({
	playerId: -1,
});
const App: Component = () => {
	onMount(() => {
		setInterval(async () => {
			const response = await fetch("https://among-us-irl.mcdle.net/gameState");
			setGameStateData((await response.json()) as GameState);
		}, 1000);
	});

	createEffect((prev) => {
		const state = gameStateData();
		if (!prev && state.isGameStarted && playerData()?.playerId !== undefined) {
			setGameState("game");
		} else if (prev && !state.isGameStarted) {
			setGameState("lobby");
			setPlayerData({
				playerId: -1,
			});
		}

		return state.isGameStarted;
	});

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
				{JSON.stringify(gameStateData(), null, 2)}
			</p>
			<p>
				playerdata:
				{JSON.stringify(playerData(), null, 2)}
			</p>
			<button
				class='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
				onClick={async () => {
					await fetch("https://among-us-irl.mcdle.net/reset", {
						method: "POST",
					});
					setGameState("lobby");
					setPlayerData({
						playerId: -1,
					});
				}}
			>
				Reset Game
			</button>
		</div>
	);
};

export default App;
