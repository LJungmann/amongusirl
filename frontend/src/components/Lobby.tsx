import { createSignal, Match, Switch } from "solid-js";
import { gameStateData, playerData, setGameState, setPlayerData } from "../App";

const Lobby = () => {
	type State =
		| "lobby"
		| "error-nfc"
		| "registering"
		| "sync-chip"
		| "registered"
		| "start-game";
	const [state, setState] = createSignal<State>("lobby");
	return (
		<div class='flex flex-col items-center justify-center h-screen bg-gray-100 gap-4'>
			<Switch>
				<Match when={state() === "lobby"}>
					<img src='/Logo.svg' alt='Among Us IRL icon' />
					<h1 class='text-4xl'>Among Us IRL</h1>
					<p class='text-2xl'>Welcome to the Among Us IRL</p>
					<p class='px-8 text-center'>
						Click the button below to launch, then register at the base station.
					</p>
					<button
						class='bg-red-500 px-8 py-4 rounded-2xl text-white font-bold'
						onClick={async () => {
							if ("NDEFReader" in window) {
								if (gameStateData().currentGameId.length < 8) {
									const data = await fetch(
										"https://among-us-irl.mcdle.net/open",
										{
											method: "POST",
											headers: {
												"Content-Type": "application/json",
											},
											body: JSON.stringify({
												playerId: 0,
											}),
										}
									);
									const json = (await data.json()) as {
										playerId: number;
										gameId: string;
									};
									setState("sync-chip");
									setPlayerData({
										playerId: 0,
									});
								} else {
									setState("registering");
								}
								try {
									const ndef = new NDEFReader();
									await ndef.scan();

									ndef.addEventListener("readingerror", () => {
										console.log(
											"readLog",
											"Argh! Cannot read data from the NFC tag. Try another one?"
										);
									});

									ndef.addEventListener("reading", async (event) => {
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
													if (
														textDecoder
															.decode(record.data)
															.includes("player_id: ")
													) {
														ndef.write("player_id: " + playerData().playerId);
														if (playerData().playerId == 0) {
															setState("start-game");
														} else {
															setState("registered");
														}
													}
													break;
												case "url":
													// log("readLog", `URL: ${decoder.decode(record.data)}`);
													if (
														state() === "registering" &&
														decoder.decode(record.data) ===
															import.meta.env.VITE_APP_URL
													) {
														const data = await fetch(
															"https://among-us-irl.mcdle.net/join",
															{
																method: "POST",
																headers: {
																	"Content-Type": "application/json",
																},
																body: JSON.stringify({
																	playerId:
																		gameStateData().playersConnected.length,
																}),
															}
														);
														const json = (await data.json()) as {
															playerId: number;
														};
														setState("sync-chip");
														setPlayerData({
															playerId: json.playerId,
														});
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
									});
								} catch (error) {
									// log("readLog", "Argh! " + error);
								}
							} else {
								setState("error-nfc");
							}
						}}
					>
						Start Game
					</button>
				</Match>
				<Match when={state() === "error-nfc"}>
					<img src='/Logo_sad.svg' alt='Among Us IRL icon' />
					<h1 class='text-4xl'>Error finding NFC</h1>
					<p class='px-8 text-center'>
						Oh noes! Seems like NDEFReader is not available, are you on
						Android/Chrome?
					</p>
					<button
						class='bg-red-500 px-8 py-4 rounded-2xl text-white font-bold'
						onClick={() => {
							setState("lobby");
						}}
					>
						Back home
					</button>
				</Match>
				<Match when={state() === "registering"}>
					<img src='/Logo.svg' alt='Among Us IRL icon' />
					<h1 class='text-4xl'>Registering</h1>
					<p class='px-8 text-center'>
						Please hold your phone to the base station to register.
					</p>
				</Match>
				<Match when={state() === "sync-chip"}>
					<img src='/Logo_sync.svg' alt='Among Us IRL icon' />
					<h1 class='text-4xl'>Sync Chip</h1>
					<p class='px-8 text-center'>
						Please hold your phone and your life chip together to sync them.
					</p>
				</Match>
				<Match when={state() === "start-game"}>
					<img src='/Logo_done.svg' alt='Among Us IRL icon' />
					<h1 class='text-4xl'>Registered</h1>
					<p>
						{gameStateData()?.playersConnected.length ?? "??"} players have
						joined.
					</p>
					<p class='px-8 text-center'>
						Press start when at least 5 players have joined and all players are
						ready.
					</p>
					<button
						class='bg-red-500 px-8 py-4 rounded-2xl text-white font-bold'
						onClick={() => {
							if (
								gameStateData().playersConnected.length >=
								import.meta.env.VITE_PLAYER_COUNT
							) {
								setGameState("game");
								fetch("https://among-us-irl.mcdle.net/start", {
									method: "POST",
								});
							} else {
								alert(
									`Not enough players! Please wait for at least ${
										import.meta.env.VITE_PLAYER_COUNT
									} players to join.`
								);
							}
						}}
					>
						Start
					</button>
				</Match>
				<Match when={state() === "registered"}>
					<img src='/Logo_done.svg' alt='Among Us IRL icon' />
					<h1 class='text-4xl'>Registered</h1>
					<p class='px-8 text-center'>
						You are now all set! Please wait for the game to start.
					</p>
				</Match>
			</Switch>
		</div>
	);
};

export default Lobby;
