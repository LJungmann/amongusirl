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
	alivePlayers: Array<{ playerId: number }>;
	imposterPlayerId: number;
	isGameStarted: boolean;
	isVotingActive: boolean;
	emergencyButtonPressed: boolean;
	meetingEndTime: number; // timestamp in ms
	gameOver: "CREWMATES_WIN" | "IMPOSTER_WIN" | "IN_PROGRESS";
	killsEnabled: boolean;
	bodyFound: boolean;
	playersRegisteredForVoting: number[];
	votes: [number, number][]; // tuple, player has x votes
	stations: [string, number, any][];
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
	meetingEndTime: -1,
	gameOver: "IN_PROGRESS",
	gamesCompleted: [],
	imposterPlayerId: -1,
	isGameStarted: false,
	isVotingActive: false,
	killsEnabled: false,
	playersConnected: [],
	playersRegisteredForVoting: [],
	votes: [],
	stations: [],
});
export const [playerData, setPlayerData] = createSignal<PlayerData>({
	playerId: -99,
});
const App: Component = () => {
	onMount(() => {
		setInterval(async () => {
			const response = await fetch("https://among-us-irl.mcdle.net/gameState");
			setGameStateData((await response.json()) as GameState);
			const gameId = localStorage.getItem("among.gameId");
			const playerId = localStorage.getItem("among.playerId");
			if (playerData().playerId === -99 && gameId && playerId) {
				if (gameId == gameStateData().currentGameId && playerId) {
					setPlayerData({
						playerId: parseInt(playerId),
					});
				}
			}
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
			<pre>
				data:
				{JSON.stringify(gameStateData(), null, 2)}
			</pre>
			<pre>
				playerdata:
				{JSON.stringify(playerData(), null, 2)}
			</pre>
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
					localStorage.removeItem("among.gameId");
					localStorage.removeItem("among.playerId");
				}}
			>
				Reset Game
			</button>
		</div>
	);
};

export default App;
