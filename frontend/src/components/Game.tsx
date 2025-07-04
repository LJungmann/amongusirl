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
import Meeting, { showMeetingResult } from "./GameStates/Meeting";
import BaseStation from "./GameStates/Stations/BaseStation";
import ScannedPlayer from "./GameStates/ScannedPlayer";
import YourRole from "./GameStates/YourRole";
import {
	getTasks,
	isPlayerAlive,
	isPlayerImposter,
	isPlayerRegisteredForVoting,
	isValidStation,
} from "../utils";
import Dead from "./GameStates/Dead";
import MeetingResult from "./GameStates/MeetingResult";
import GameOver from "./GameStates/GameOver";
import PlayerRow from "./PlayerRow";

type PlayState = "station" | "game" | "emergency" | "dead";
export const [playState, setPlayState] = createSignal<PlayState>("game");
export const [lastScannedPlayer, setLastScannedPlayer] = createSignal<{
	playerId: number;
	timeStamp: number;
} | null>(null);

export const [lastSuccessfulScan, setLastSuccessfulScan] = createSignal(0);

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
			} else if (!isPlayerAlive()) {
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

	function mapTaskNames(task: string) {
		switch (task) {
			case "station_wires":
				return "Wires";
			case "station_simon":
				return "Simon Says";
			case "station_lightsout":
				return "Lights Out";
			case "station_levers":
				return "Levers";
			case "station_safecrack":
				return "Safe Cracking";
			default:
				return task;
		}
	}

	const [openInstruction, setOpenInstruction] = createSignal<
		"info" | "role" | null
	>(null);

	return (
		<div class="h-full mx-4 mt-4">
			<Switch
				fallback={
					<>
						{/* main game display */}
						{/* Progress Bars */}
						<div class="relative">
							<span class="absolute top-1/2 left-1/2 text-2xl font-bold -translate-1/2">
								Tasks Complete
							</span>
							<progress
								max={
									gameStateData().playersConnected.filter(
										(x) => !isPlayerImposter(x.playerId),
									).length * gameStateData().gameSettings.tasksPerPlayer
								}
								value={gameStateData().gamesCompleted.length}
								class="w-full h-12 progressbar"
							/>{" "}
						</div>
						<div class="relative">
							<span class="absolute top-1/2 left-1/2 text-2xl font-bold -translate-1/2">
								Players Scanned
							</span>
							<progress
								max={
									gameStateData().playersConnected.length *
									gameStateData().gameSettings.scansPerPlayer
								}
								value={gameStateData().scansCompleted.reduce(
									(acc, scan) => acc + scan[1],
									0,
								)}
								class="w-full h-12 progressbar"
							/>{" "}
						</div>
						<Switch>
							<Match when={playState() === "emergency"}>
								<Meeting />
							</Match>
							<Match when={playState() === "game"}>
								<div>
									{/* Task List */}
									<div class="bg-gray-200 p-4 rounded-lg">
										<p class="text-4xl">Tasks:</p>
										<ul class="text-2xl list-disc ml-8">
											<For each={getTasks()}>
												{(task) => <li>{mapTaskNames(task)} </li>}
											</For>
										</ul>
									</div>

									{/* Info Buttons */}
									<div class="flex flex-row mt-4 gap-2">
										<button
											class="px-4 py-2 text-xl font-bold text-white bg-red-500 rounded-2xl"
											onClick={() => {
												if (openInstruction() === "info") {
													setOpenInstruction(null);
												} else {
													setOpenInstruction("info");
												}
											}}
										>
											?
										</button>
										<button
											class="px-4 py-2 text-xl font-bold text-white bg-red-500 rounded-2xl"
											onClick={() => {
												if (openInstruction() === "role") {
													setOpenInstruction(null);
												} else {
													setOpenInstruction("role");
												}
											}}
										>
											Role
										</button>
									</div>
									{/* Foldable Infos */}
									<Switch>
										<Match when={openInstruction() === "info"}>
											<p>Instructions</p>
											<div class="flex flex-col gap-2">
												<p>
													If you get killed, please stay in the same spot until
													the next meeting or until someone finds you. Don't
													tell anyone who killed you!
												</p>
												<p>
													If you find a dead crewmate, please scan their tag to
													"report" their body. This will start an emergency
													meeting.
												</p>
												<p>
													Imposters can kill players by clicking the "Kill"
													button after scanning another player's tag.
												</p>
											</div>
										</Match>
										<Match when={openInstruction() === "role"}>
											<p>Role</p>
											<div class="flex flex-col gap-2">
												<Show
													when={isPlayerImposter()}
													fallback={
														<>
															<p>
																You are a Crewmate. Your tasks is to complete
																the tasks displayed above. You win with the
																other Crewmates when you completed all tasks or
																if the Imposter is voted out.
															</p>
															<p>
																Scan the tags at the task stations and complete
																the tasks.
															</p>
														</>
													}
												>
													<p>
														You are the Imposter. Your tasks is to discretely
														kill other players. You win when only one other
														player is left. Don't get caught!
													</p>
													<p>
														Kill Crewmates by clicking the "Kill" button after
														scanning another player's tag.
													</p>
												</Show>
											</div>
										</Match>
									</Switch>
								</div>
								{/* Scan Players info */}
								<p class="mt-8">
									Scan players' tags to fill the scan progress bar or to kill
									them.
									<Show when={(lastSuccessfulScan() ?? 0) > time()}>
										<span class="text-red-500">
											{" "}
											On cooldown for{" "}
											{Math.floor(
												((lastSuccessfulScan() ?? 0) - time()) / 1000,
											)}
											s
										</span>
									</Show>
								</p>
							</Match>
							<Match when={playState() === "station"}>
								<BaseStation />
							</Match>
							<Match when={playState() === "dead"}>
								<Dead />
							</Match>
						</Switch>
					</>
				}
			>
				{/* Covering screens */}
				<Match when={showMeetingResult()}>
					{/* <Match when={true}> */}
					<MeetingResult />
				</Match>
				<Match when={gameStateData().gameOver !== "IN_PROGRESS"}>
					<GameOver />
				</Match>
				<Match when={showRoleInfo()}>
					{/* display the players role */}
					<YourRole setShowRoleInfo={setShowRoleInfo} />
				</Match>
				<Match when={(lastScannedPlayer()?.timeStamp ?? -1) >= time()}>
					<ScannedPlayer time={time} />
				</Match>
			</Switch>
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
					if (!isValidStation(data)) {
						alert("Invalid station! You do not have a task here.");
						return;
					}
					await fetch(import.meta.env.VITE_WEB_URL + "startStation", {
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
						if (!isPlayerAlive(playerId)) {
							alert("Player " + playerId + " is dead! Reporting...");
							// Report dead players
							await fetch(import.meta.env.VITE_WEB_URL + "bodyFound", {
								method: "POST",
								body: JSON.stringify({
									playerId: playerId,
								}),
								headers: {
									"Content-Type": "application/json",
								},
							});
						} else {
							if ((lastSuccessfulScan() ?? 0) < new Date().getTime()) {
								// 1 minute
								setLastSuccessfulScan(
									new Date().getTime() +
										gameStateData().gameSettings.scanCooldownTime * 1000,
								);
								await fetch(import.meta.env.VITE_WEB_URL + "scanPlayer", {
									method: "POST",
									body: JSON.stringify({
										playerId: playerData().playerId,
										scannedId: playerId,
									}),
									headers: {
										"Content-Type": "application/json",
									},
								});
							}
							// Scan alive players
							// alert("Player " + playerId + " is alive!");
							setLastScannedPlayer({
								playerId: playerId,
								timeStamp:
									new Date().getTime() +
									gameStateData().gameSettings.killWindowTime * 1000,
							});
						}
					}
				}
				break;
			case "url":
				if (decoder.decode(record.data) === import.meta.env.VITE_APP_URL) {
					if (gameStateData().emergencyButtonPressed) {
						if (!isPlayerRegisteredForVoting()) {
							const response = await fetch(
								import.meta.env.VITE_WEB_URL + "registerVoting",
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
							// alert(await response.text());
						}
					} else {
						if (!isPlayerAlive()) {
							alert("You are dead! You cannot call an emergency meeting!");
							return;
						}
						await fetch(import.meta.env.VITE_WEB_URL + "emergency", {
							method: "POST",
						});
						const response = await fetch(
							import.meta.env.VITE_WEB_URL + "registerVoting",
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
