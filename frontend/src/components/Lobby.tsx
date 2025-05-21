import { createSignal, Match, onMount, Show, Switch } from "solid-js";
import { gameStateData, playerData, setGameState, setPlayerData } from "../App";

const Lobby = () => {
	type State =
		| "lobby" //landing page
		| "error-nfc" //phone / browser doesn't support NFC
		| "registering" //register players to lobby by scanning the game tag
		| "sync-chip" //scan chip
		| "registered" //normal players
		| "configure" // configure game settings
		| "nickname" //set nickname
		| "start-game"; //host
	const [state, setState] = createSignal<State>("lobby");

	async function handleStartGame() {
		if ("NDEFReader" in window) {
			if (gameStateData().currentGameId.length < 8) {
				const data = await fetch(import.meta.env.VITE_WEB_URL + "open", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						playerId: 0,
					}),
				});
				const json = (await data.json()) as {
					playerId: number;
					gameId: string;
				};
				setState("sync-chip");
				setPlayerData({
					playerId: 0,
				});
				localStorage.setItem("among.gameId", json.gameId);
				localStorage.setItem("among.playerId", "0");
			} else {
				setState("registering");
			}
			try {
				const ndef = new NDEFReader();
				await ndef.scan();

				ndef.addEventListener("readingerror", () => {
					console.log(
						"readLog",
						"Argh! Cannot read data from the NFC tag. Try another one?",
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
									state() == "sync-chip" &&
									textDecoder.decode(record.data).includes("player_id: ")
								) {
									ndef
										.write("player_id: " + playerData().playerId)
										.then(() => {
											// log("readLog", "Wrote player ID to NFC tag");
											// alert("Wrote player ID to NFC tag");
											if (playerData().playerId == 0) {
												setState("configure");
											} else {
												setState("nickname");
											}
										})
										.catch((error) => {
											alert("Error writing to NFC tag: " + error);
											// log("readLog", "Error writing to NFC tag: " + error);
										});
								}
								break;
							case "url":
								// log("readLog", `URL: ${decoder.decode(record.data)}`);
								if (
									state() === "registering" &&
									decoder.decode(record.data) === import.meta.env.VITE_APP_URL
								) {
									const data = await fetch(
										import.meta.env.VITE_WEB_URL + "join",
										{
											method: "POST",
											headers: {
												"Content-Type": "application/json",
											},
											body: JSON.stringify({
												playerId: gameStateData().playersConnected.length,
											}),
										},
									);
									const playerId = parseInt(await data.text());
									setState("sync-chip");
									setPlayerData({
										playerId: playerId,
									});
									if (playerId !== -99) {
										localStorage.setItem("among.playerId", playerId.toString());
										localStorage.setItem(
											"among.gameId",
											gameStateData().currentGameId,
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
				});
			} catch (error) {
				// log("readLog", "Argh! " + error);
			}
		} else {
			setState("error-nfc");
		}
	}

	let initialSettings = {
		imposterCount: 1,
		meetingDuration: 60,
	};
	onMount(() => {
		initialSettings = {
			imposterCount: gameStateData().gameSettings.imposterCount ?? 1,
			meetingDuration: gameStateData().gameSettings.meetingDuration ?? 60,
		};
	});

	let imposterCountInput: HTMLInputElement | undefined;
	let meetingTimeInput: HTMLInputElement | undefined;
	let nicknameInput: HTMLInputElement | undefined;

	return (
		<div class="flex flex-col items-center justify-center h-full bg-gray-100 gap-4">
			<Switch>
				<Match when={state() === "lobby"}>
					<img src="/Logo.svg" alt="Among Us IRL icon" />
					<h1 class="text-4xl">Among Us IRL</h1>
					<p class="text-2xl">Welcome to Among Us IRL!</p>
					<Show
						when={gameStateData().currentGameId !== ""}
						fallback={
							<p class="px-8 text-center">
								Click the button below to join a lobby, then register at the
								base station.
							</p>
						}
					>
						<p class="px-8 text-center">
							Click the button below to start a new Lobby.
						</p>
					</Show>
					<button
						class="bg-red-500 px-8 py-4 rounded-2xl text-white font-bold"
						onClick={handleStartGame}
					>
						Start Game
					</button>
				</Match>
				<Match when={state() === "error-nfc"}>
					<img src="/PlayerTag_Sad" alt="Among Us IRL icon" />
					<h1 class="text-4xl">Error finding NFC</h1>
					<p class="px-8 text-center">
						Oh noes! Seems like NDEFReader is not available, are you on
						Android/Chrome?
					</p>
					<button
						class="bg-red-500 px-8 py-4 rounded-2xl text-white font-bold"
						onClick={() => {
							setState("lobby");
						}}
					>
						Back home
					</button>
				</Match>
				<Match when={state() === "registering"}>
					<img src="/Logo.svg" alt="Among Us IRL icon" />
					<h1 class="text-4xl">Registering</h1>
					<p class="px-8 text-center">
						Please hold your phone to the base station to register.
					</p>
				</Match>
				<Match when={state() === "sync-chip"}>
					<img src="/PlayerTag.svg" alt="Among Us IRL icon" />
					<h1 class="text-4xl">Sync Chip</h1>
					<p class="px-8 text-center">
						Please hold your phone and your life chip together to sync them.
					</p>
				</Match>
				<Match when={state() === "nickname"}>
					<img src="/Logo.svg" alt="Among Us IRL icon" />
					<h1 class="text-4xl">Settings</h1>
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							const imposterCount = parseInt(imposterCountInput?.value ?? "1");
							const meetingTime = parseInt(meetingTimeInput?.value ?? "30");
							if (isNaN(imposterCount) || isNaN(meetingTime)) {
								alert("Please enter valid numbers");
								return;
							}
							localStorage.setItem(
								"among.nickname",
								nicknameInput?.value ?? "Player " + (playerData().playerId + 1),
							);
							await fetch(import.meta.env.VITE_WEB_URL + "setNickname", {
								method: "POST",
								body: JSON.stringify({
									playerId: playerData().playerId,
									nickname:
										nicknameInput?.value ??
										"Player " + (playerData().playerId + 1),
								}),
								headers: {
									"Content-Type": "application/json",
								},
							});
							if (playerData().playerId === 0) {
								setState("start-game");
							} else {
								setState("registered");
							}
						}}
						class="flex flex-col gap-4 items-center justify-center w-full h-full"
					>
						{/* Your nickname */}
						<label class="text-2xl">
							Nickname:
							<input
								class="ml-4 border-2 border-gray-300 rounded-lg p-2"
								ref={nicknameInput}
								value={localStorage.getItem("among.nickname") ?? ""}
							/>
						</label>
						<input
							type="submit"
							class="text-2xl bg-red-500 rounded-2xl px-4 py-2"
						>
							Confirm Name
						</input>
					</form>
				</Match>
				<Match when={state() === "configure"}>
					<img src="/Logo.svg" alt="Among Us IRL icon" />
					<h1 class="text-4xl">Settings</h1>
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							const imposterCount = parseInt(imposterCountInput?.value ?? "1");
							const meetingTime = parseInt(meetingTimeInput?.value ?? "30");
							if (isNaN(imposterCount) || isNaN(meetingTime)) {
								alert("Please enter valid numbers");
								return;
							}
							await fetch(import.meta.env.VITE_WEB_URL + "setSettings", {
								method: "POST",
								body: JSON.stringify({
									imposterCount: imposterCount,
									meetingDuration: meetingTime,
								}),
								headers: {
									"Content-Type": "application/json",
								},
							});
							setState("nickname");
						}}
						class="flex flex-col gap-4 items-center justify-center w-full h-full"
					>
						{/* Imposter count 1-2 */}
						<label class="text-2xl">
							Number of imposters:
							<input
								type="number"
								min="1"
								max="2"
								class="ml-4 border-2 border-gray-300 rounded-lg p-2"
								ref={imposterCountInput}
								value={initialSettings.imposterCount}
							/>
						</label>
						{/* Meeting time seconds 30-240 */}
						<label class="text-2xl">
							Meeting time (seconds):
							<input
								type="number"
								min="30"
								max="240"
								class="ml-4 border-2 border-gray-300 rounded-lg p-2"
								ref={meetingTimeInput}
								value={initialSettings.meetingDuration}
							/>
						</label>
						<input
							type="submit"
							class="text-2xl bg-red-500 rounded-2xl px-4 py-2"
						>
							Confirm Settings
						</input>
					</form>
				</Match>
				<Match when={state() === "start-game"}>
					<p class="text-8xl">
						{gameStateData()?.playersConnected.length ?? "??"}
					</p>
					<p class="text-4xl">Players in Lobby</p>
					<img
						// src="/Among_Us_Crewmate.webp"
						src={"/" + playerData().playerId + "_alive.webp"}
						alt="Among Us IRL icon"
						class="h-[30vh]"
					/>
					<p class="text-4xl">You are player {playerData().playerId + 1}</p>
					<Show
						when={
							gameStateData()?.playersConnected.length <
							import.meta.env.VITE_PLAYER_COUNT
						}
						fallback={
							<button
								class="bg-red-500 px-8 py-4 rounded-2xl text-white font-bold text-3xl"
								onClick={() => {
									if (
										gameStateData().playersConnected.length >=
										import.meta.env.VITE_PLAYER_COUNT
									) {
										setGameState("game");
										fetch(import.meta.env.VITE_WEB_URL + "start", {
											method: "POST",
										});
									} else {
										alert(
											`Not enough players! Please wait for at least ${
												import.meta.env.VITE_PLAYER_COUNT
											} players to join.`,
										);
									}
								}}
							>
								Start Game
							</button>
						}
					>
						<p class="px-8 text-center">
							{`Waiting for at least ${
								import.meta.env.VITE_PLAYER_COUNT
							} players to join...`}
						</p>
					</Show>
				</Match>
				<Match when={state() === "registered"}>
					<p class="text-8xl">
						{gameStateData()?.playersConnected.length ?? "??"}
					</p>
					<p class="text-4xl">Players in Lobby</p>
					<img
						// src="/Among_Us_Crewmate.webp"
						src={"/" + playerData().playerId + "_alive.webp"}
						alt="Among Us IRL icon"
						class="h-[30vh]"
					/>
					<p class="text-4xl">You are player {playerData().playerId + 1}</p>
					<p class="px-8 text-center">Waiting for host...</p>
				</Match>
			</Switch>
		</div>
	);
};

export default Lobby;
