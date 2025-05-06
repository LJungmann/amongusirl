import { createEffect, createSignal, Match, onMount, Show, Switch, type Component } from "solid-js";

import ReloadPrompt from "./components/ReloadPromp";
import Lobby from "./components/Lobby";
import Game from "./components/Game";
import Debug from "./components/Debug";

type State = "lobby" | "game";
type GameState = {
	currentGameId: string;
	playersConnected: number[];
	gamesCompleted: number[];
	alivePlayers: Array<{ playerId: number }>;
	imposterPlayerId: { playerId: number };
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
	imposterPlayerId: { playerId: -1 },
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
export const [debug, setDebug] = createSignal(false);
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

	createEffect(() => {
		const state = gameStateData();
		if (state.isGameStarted && playerData()?.playerId !== undefined) {
			setGameState("game");
		} else if (!state.isGameStarted) {
			setGameState("lobby");
		}
	});

	return (
		<div class="w-screen h-screen relative">
			<div class="flex">
				<img class="ml-2" width={35} src="/Logo.svg" alt="Among Us IRL icon" />
				<p class="text-3xl m-2">
					<b>Among Us IRL</b>
				</p>
			</div>
			<Switch>
				<Match when={gameState() === "lobby"}>
					<Lobby />
				</Match>
				<Match when={gameState() === "game"}>
					<Game />
				</Match>
			</Switch>
			<Show when={debug()}>
				<Debug />
			</Show>
			<Show when={import.meta.env.MODE === "development"}>
				<button
					class="fixed bottom-5 right-5 w-16 h-16 rounded-full bg-teal-500 text-white text-2xl font-bold"
					onClick={() => {
						setDebug(!debug());
					}}
				>
					{"</>"}
				</button>
			</Show>
			{/* <NFCTest /> */}
			<ReloadPrompt />
		</div>
	);
};

export default App;
