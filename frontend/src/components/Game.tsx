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
import { gameStateData, playerData } from "../App";
import Meeting from "./GameStates/Meeting";
import BaseStation from "./GameStates/Stations/BaseStation";
import ScannedPlayer from "./GameStates/ScannedPlayer";

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
					(p) => p.playerId === playerData()?.playerId
				) === -1
			) {
				setPlayState("dead");
			} else {
				setPlayState("game");
			}
		})
	);

	const [showRoleInfo, setShowRoleInfo] = createSignal();

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
					"Argh! Cannot read data from the NFC tag. Try another one?"
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
				when={!showRoleInfo()}
				fallback={
					<div class='flex flex-col items-center justify-center gap-4'>
						<p>
							You are{" "}
							{(gameStateData().imposterPlayerId as any).playerId ===
							playerData().playerId
								? "an imposter!"
								: "a crewmate!"}
						</p>
						<button
							class='bg-green-400 p-4 rounded-2xl'
							onClick={() => {
								setShowRoleInfo(false);
							}}
						>
							Let's play!
						</button>
					</div>
				}
			>
				<h1>Game</h1>
				<p>Progress: {gameStateData().stations.length} Stations completed</p>
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
		</div>
	);
};

export default Game;

export async function handleReading(event: Event) {
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
								(x) => x.playerId === playerId
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
								}
							);
							alert(await response.text());
						}
					} else {
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
							}
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
