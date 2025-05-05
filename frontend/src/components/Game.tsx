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

type PlayState = "station" | "game" | "emergency";
export const [playState, setPlayState] = createSignal<PlayState>("game");

const Game = () => {
	createEffect(
		on(gameStateData, () => {
			const state = gameStateData();

			if (gameStateData().emergencyButtonPressed) {
				setPlayState("emergency");
			} else if (
				state.stations.findIndex((x) => x[1] === playerData()?.playerId) !== -1
			) {
				setPlayState("station");
			} else {
				setPlayState("game");
			}
		})
	);

	const ndef = new NDEFReader();
	onMount(async () => {
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
	});

	onCleanup(() => {
		ndef.removeEventListener("reading", handleReading);
	});

	return (
		<div>
			<h1>Game {gameStateData().stations.length}</h1>
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
			</Switch>
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
