import {
	createEffect,
	createSignal,
	For,
	Match,
	on,
	onCleanup,
	onMount,
	Show,
	Switch,
} from "solid-js";
import { gameStateData, playerData, setGameState, setPlayerData } from "../App";
import Meeting from "./GameStates/Meeting";
import BaseStation from "./GameStates/Stations/BaseStation";
import ScannedPlayer from "./GameStates/ScannedPlayer";
import YourRole from "./GameStates/YourRole";

type PlayState = "station" | "game" | "emergency" | "dead";
export const [playState, setPlayState] = createSignal<PlayState>("game");
export const [lastScannedPlayer, setLastScannedPlayer] = createSignal<{
	playerId: number;
	timeStamp: number;
} | null>(null);

const [time, setTime] = createSignal(-1);

const Game = () => {
	createEffect(
		on([gameStateData, playerData], () => {
			const state = gameStateData();

			if (gameStateData().emergencyButtonPressed) {
				setPlayState("emergency");
			} else if (
				state.stations.findIndex((x) => x[1] === playerData()?.playerId) !== -1
			) {
				setPlayState("station");
			} else if (
				gameStateData().alivePlayers.findIndex(
					(p) => p.playerId === playerData()?.playerId,
				) === -1
			) {
				setPlayState("dead");
			} else {
				setPlayState("game");
			}
		}),
	);

	const [showRoleInfo, setShowRoleInfo] = createSignal(false);

	const ndef = new NDEFReader();
	onMount(async () => {
		setInterval(() => {
			setTime(new Date().getTime());
		}, 1000);
		try {
			await ndef.scan();

			ndef.addEventListener("readingerror", () => {
				console.log(
					"readLog",
					"Argh! Cannot read data from the NFC tag. Try another one?",
				);
			});

			ndef.addEventListener("reading", handleReading);
		} catch (error) {
			// log("readLog", "Argh! " + error);
		}
		setShowRoleInfo(true);
	});

	onCleanup(() => {
		ndef.removeEventListener("reading", handleReading);
	});

	return (
		<div>
			<Show
				when={gameStateData().gameOver === "IN_PROGRESS"}
				fallback={
					<div>
						<p>Game over! {gameStateData().gameOver}</p>
						<button
							class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
							Back to menu
						</button>
					</div>
				}
			>
				<Show
					when={!showRoleInfo()}
					fallback={
						<>
							{/* display the players role */}
							<YourRole setShowRoleInfo={setShowRoleInfo} />
						</>
					}
				>
					{/* main game display */}
					<h1>Game</h1>
					<p>
						Stations completed:
						<progress
							max={gameStateData().playersConnected.length * 3}
							value={gameStateData().gamesCompleted.length}
						/>{" "}
						{gameStateData().gamesCompleted.length}/
						{gameStateData().playersConnected.length * 3}
					</p>
					<Show when={(lastScannedPlayer()?.timeStamp ?? -1) >= time()}>
						<ScannedPlayer time={time} />
					</Show>
					<Switch>
						<Match when={playState() === "emergency"}>
							<Meeting />
						</Match>
						<Match when={playState() === "game"}>
							<p>In game!</p>
						</Match>
						<Match when={playState() === "station"}>
							<BaseStation />
						</Match>
						<Match when={playState() === "dead"}>
							<p>You have been killed!</p>
						</Match>
					</Switch>
				</Show>
			</Show>
		</div>
	);
};

export default Game;

export async function handleReading(event: Event) {
	if (gameStateData().gameOver !== "IN_PROGRESS") {
		return;
	}
	const { message, serialNumber } = event as NDEFReadingEvent;
	const decoder = new TextDecoder();
	for (const record of message.records) {
		switch (record.recordType) {
			case "text":
				const textDecoder = new TextDecoder(record.encoding);
				const data = textDecoder.decode(record.data);
				if (data.startsWith("station_")) {
					await fetch("https://among-us-irl.mcdle.net/startStation", {
						method: "POST",
						body: JSON.stringify({
							stationId: data,
							playerId: playerData().playerId,
						}),
						headers: {
							"Content-Type": "application/json",
						},
					});
					setPlayState("station");
				} else if (data.startsWith("player_id: ")) {
					const playerId = parseInt(data.split("player_id: ")[1]);
					if (playerData().playerId !== playerId) {
						// Other player ID
						if (
							gameStateData().alivePlayers.findIndex(
								(x) => x.playerId === playerId,
							) === -1
						) {
							alert("Player " + playerId + " is dead! Reporting...");
							// Report dead players
							await fetch("https://among-us-irl.mcdle.net/bodyFound", {
								method: "POST",
								body: JSON.stringify({
									playerId: playerId,
								}),
								headers: {
									"Content-Type": "application/json",
								},
							});
						} else {
							// Scan alive players
							// alert("Player " + playerId + " is alive!");
							setLastScannedPlayer({
								playerId: playerId,
								timeStamp: new Date().getTime() + 5000,
							});
						}
					}
				}
				break;
			case "url":
				if (decoder.decode(record.data) === import.meta.env.VITE_APP_URL) {
					if (gameStateData().emergencyButtonPressed) {
						if (
							gameStateData().playersRegisteredForVoting.findIndex((x) => {
								if (x === playerData().playerId) {
									return true;
								}
								return false;
							}) === -1
						) {
							const response = await fetch(
								"https://among-us-irl.mcdle.net/registerVoting",
								{
									method: "POST",
									body: JSON.stringify({
										playerId: playerData().playerId,
									}),
									headers: {
										"Content-Type": "application/json",
									},
								},
							);
							alert(await response.text());
						}
					} else {
						if (
							gameStateData().alivePlayers.findIndex(
								(x) => x.playerId === playerData().playerId,
							) === -1
						) {
							alert("You are dead! You cannot call an emergency meeting!");
							return;
						}
						alert("Emergency Meeting called!");
						await fetch("https://among-us-irl.mcdle.net/emergency", {
							method: "POST",
						});
						const response = await fetch(
							"https://among-us-irl.mcdle.net/registerVoting",
							{
								method: "POST",
								body: JSON.stringify({
									playerId: playerData().playerId,
								}),
								headers: {
									"Content-Type": "application/json",
								},
							},
						);
					}
				}
				break;
			case "mime":
				if (record.mediaType === "application/json") {
					// log(
					//     "readLog",
					//     `JSON: ${JSON.parse(decoder.decode(record.data))}`
					// );
				} else {
					// log("readLog", `Media not handled`);
				}
				break;
			default:
			// log("readLog", `Record not handled`);
		}
	}
}
