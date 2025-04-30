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
import {
	gameState,
	gameStateData,
	playerData,
	setGameState,
	setPlayerData,
} from "../App";

type PlayState = "station" | "game" | "emergency";
const [playState, setPlayState] = createSignal<PlayState>("game");

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

	function getStationData() {
		try {
			const index = gameStateData().stations.findIndex(
				(x) => x[1] == playerData().playerId
			);
			return {
				name: gameStateData().stations[index][0],
				player: gameStateData().stations[index][1],
				data: gameStateData().stations[index][2],
			};
		} catch (error) {
			return {
				name: "station_undefined",
				player: -1,
				data: null,
			};
		}
	}

	return (
		<div>
			<h1>Game {gameStateData().stations.length}</h1>
			<Switch>
				<Match when={playState() === "emergency"}>
					<p class='text-red-800'>Emergency Meeting!</p>
					<ul>
						<For
							each={
								gameStateData().alivePlayers
								// 	.filter(
								// 	(x) => x.playerId !== playerData().playerId
								// )
							}
							fallback={<p>No players to vote for</p>}
						>
							{(x) => (
								<li>
									<button
										class='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
										onClick={async () => {
											await fetch("https://among-us-irl.mcdle.net/voteFor", {
												method: "POST",
												body: JSON.stringify({
													playerId: x.playerId,
												}),
											});
										}}
									>
										Vote for {x.playerId}
									</button>
								</li>
							)}
						</For>
					</ul>
				</Match>

				<Match when={playState() === "game"}>
					<p>In game!</p>
				</Match>
				<Match when={playState() === "station"}>
					<p>In station: {getStationData().name}</p>
					<div class='flex flex-col gap-4'>
						<Show when={getStationData().name == "station_wires"}>
							<Show
								when={!getStationData().data}
								fallback={
									<div>
										<p>Wire data:</p>
										<p>Player: {getStationData().player}</p>
										<pre>{JSON.stringify(getStationData().data, null, 2)}</pre>
									</div>
								}
							>
								<button
									class='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-8'
									onClick={async () => {
										const index = gameStateData().stations.findIndex(
											(station) => station[1] === playerData()?.playerId
										);
										if (gameStateData().stations.length > 0 && index !== -1) {
											await fetch(
												"https://among-us-irl.mcdle.net/setStationData",
												{
													method: "POST",
													body: JSON.stringify({
														stationId: gameStateData().stations[index][0],
														data: {
															wires: [
																{
																	color: "red",
																	status: "cut",
																},
																{
																	color: "blue",
																	status: "cut",
																},
																{
																	color: "green",
																	status: "cut",
																},
															],
														},
													}),
													headers: {
														"Content-Type": "application/json",
													},
												}
											);
										} else {
											alert("You are not in a station!");
										}
									}}
								>
									Set Wire data
								</button>
							</Show>
						</Show>
						<button
							class='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
							onClick={async () => {
								const index = gameStateData().stations.findIndex(
									(station) => station[1] === playerData()?.playerId
								);
								if (gameStateData().stations.length > 0 && index !== -1) {
									await fetch(
										"https://among-us-irl.mcdle.net/completeStation",
										{
											method: "POST",
											body: JSON.stringify({
												stationId: gameStateData().stations[index][0],
											}),
											headers: {
												"Content-Type": "application/json",
											},
										}
									);
									setPlayState("game");
								} else {
									alert("You are not in a station!");
								}
							}}
						>
							Complete Station
						</button>
					</div>
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
				// log(
				//     "readLog",
				//     `Text: ${textDecoder.decode(record.data)} (${
				//         record.lang
				//     })`
				// );
				// alert(textDecoder.decode(record.data));
				const data = textDecoder.decode(record.data);
				if (data.startsWith("station_")) {
					// alert(
					// 	"Station registered! Data: " +
					// 		data +
					// 		" Player: " +
					// 		playerData().playerId
					// );
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
				// log("readLog", `URL: ${decoder.decode(record.data)}`);
				if (decoder.decode(record.data) === import.meta.env.VITE_APP_URL) {
					if (gameStateData().emergencyButtonPressed) {
						await fetch("https://among-us-irl.mcdle.net/registerVoting", {
							method: "POST",
						});
					} else {
						alert("Emergency Meeting called!");
						await fetch("https://among-us-irl.mcdle.net/emergency", {
							method: "POST",
						});
						await fetch("https://among-us-irl.mcdle.net/registerVoting", {
							method: "POST",
						});
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
