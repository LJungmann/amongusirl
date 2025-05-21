import {
	createEffect,
	createSignal,
	Match,
	onMount,
	Show,
	Switch,
	type Component,
} from "solid-js";

import ReloadPrompt from "./components/ReloadPromp";
import Lobby from "./components/Lobby";
import Game from "./components/Game";
import Debug from "./components/Debug";
import { getPlayerName } from "./utils";
import { io } from "socket.io-client";

type State = "lobby" | "game";
type GameState = {
	currentGameId: string;
	playersConnected: Array<{ playerId: number }>;
	gamesCompleted: number[];
	alivePlayers: Array<{ playerId: number }>;
	imposterPlayerId: Array<{ playerId: number }>;
	isGameStarted: boolean;
	isVotingActive: boolean;
	emergencyButtonPressed: boolean;
	meetingEndTime: number; // timestamp in ms
	meetingStartTime: number; // timestamp in ms
	gameOver: "CREWMATES_WIN" | "IMPOSTER_WIN" | "IN_PROGRESS";
	killsEnabled: boolean;
	bodyFound: boolean;
	playersRegisteredForVoting: number[];
	nicknames: [{ playerId: number }, string][]; // tuple, player has name
	votes: [number, number][]; // tuple, player has x votes
	scansCompleted: [number, number][]; // tuple, player has x scans of other players
	stations: [string, number, any][];
	playersNeededStations: PlayerToStations[];
	lastMeetingResult: string; // result of the last meeting
	gameSettings: {
		imposterCount: number;
		meetingDuration: number; // in seconds
	};
};

type PlayerToStations = {
	playerId: number;
	stationIds: string[];
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
	meetingStartTime: -1,
	gameOver: "IN_PROGRESS",
	gamesCompleted: [],
	imposterPlayerId: [],
	isGameStarted: false,
	isVotingActive: false,
	killsEnabled: false,
	playersConnected: [],
	playersRegisteredForVoting: [],
	nicknames: [],
	votes: [],
	scansCompleted: [],
	stations: [],
	playersNeededStations: [],
	lastMeetingResult: "",
	gameSettings: {
		imposterCount: 1,
		meetingDuration: 60,
	},
});
export const [playerData, setPlayerData] = createSignal<PlayerData>({
	playerId: -99,
});
export const [debug, setDebug] = createSignal(false);
const App: Component = () => {
	onMount(() => {
		// setInterval(async () => {
		// 	const response = await fetch(import.meta.env.VITE_WEB_URL + "gameState");
		// 	setGameStateData((await response.json()) as GameState);
		// 	const gameId = localStorage.getItem("among.gameId");
		// 	const playerId = localStorage.getItem("among.playerId");
		// 	if (playerData().playerId === -99 && gameId && playerId) {
		// 		if (gameId == gameStateData().currentGameId && playerId) {
		// 			setPlayerData({
		// 				playerId: parseInt(playerId),
		// 			});
		// 		}
		// 	}
		// }, 1000);
		console.log("Creating socket...");
		const socket = io(import.meta.env.VITE_WEB_URL); // change address if needed

		console.log("Connecting to server...");
		socket.on("connect", () => {
			console.log("Connected to server");
		});

		socket.on("gameStateChanged", (data) => {
			console.log("Received update:", data);
			setGameStateData(data as GameState);
			const gameId = localStorage.getItem("among.gameId");
			const playerId = localStorage.getItem("among.playerId");
			if (playerData().playerId === -99 && gameId && playerId) {
				if (gameId == gameStateData().currentGameId && playerId) {
					setPlayerData({
						playerId: parseInt(playerId),
					});
				}
			}
		});
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
		<div class="w-screen h-screen relative overflow-hidden flex flex-col items-stretch">
			<header class="flex flex-row items-center justify-between bg-gray-200 p-4 shadow-md">
				<span class="flex flex-row items-center">
					<img
						class="ml-2"
						width={35}
						src="/Logo.svg"
						alt="Among Us IRL icon"
					/>
					<p class="text-3xl ml-2" style={{ "font-family": "Amatic SC" }}>
						<b>Among Us IRL</b>
					</p>
				</span>
				<Show
					when={gameStateData().isGameStarted && playerData().playerId >= 0}
				>
					<span class="flex flex-row items-center gap-2 text-2xl">
						{getPlayerName()}
						<img
							src={"/" + playerData().playerId + "_alive.webp"}
							alt="Player icon"
							class="w-8 h-fit"
						/>
					</span>
				</Show>
			</header>
			{/* <div class="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-4">
				<PlayerRow
					players={[
						{ playerId: 0 },
						{ playerId: 1 },
						{ playerId: 2 },
						{ playerId: 3 },
						{ playerId: 4 },
						{ playerId: 5 },
						{ playerId: 6 },
						{ playerId: 7 },
						{ playerId: 8 },
						{ playerId: 9 },
					]}
				/>
			</div> */}
			{/* <MeetingResult /> */}
			<Switch>
				<Match when={gameState() === "game" && playerData().playerId < 0}>
					<div class="flex flex-col items-center justify-center h-full bg-gray-100 gap-4">
						<img src="/Logo.svg" alt="Among Us IRL icon" />
						<div class="p-8">
							<p class="text-2xl">Welcome to Among Us IRL!</p>
							<p>
								There is currently a game going on, please wait for it to
								complete
							</p>
						</div>
					</div>
				</Match>
				<Match when={gameState() === "lobby"}>
					<Lobby />
				</Match>
				<Match when={gameState() === "game"}>
					<Game />
				</Match>
			</Switch>
			<Show when={import.meta.env.MODE === "development"}>
				<Show when={debug()}>
					<Debug />
				</Show>
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
