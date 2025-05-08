import { For, onMount, Show } from "solid-js";
import { gameStateData, setGameState, setPlayerData } from "../../App";
import { isPlayerImposter } from "../../utils";

const GameOver = () => {
	onMount(() => {
		if (navigator.vibrate) {
			navigator.vibrate(500);
		}
		setTimeout(async () => {
			await fetch("https://among-us-irl.mcdle.net/reset", {
				method: "POST",
			});
			setGameState("lobby");
			setPlayerData({
				playerId: -1,
			});
		}, 5000);
	});
	return (
		<div class="h-full flex flex-col items-center justify-center gap-4 mt-[10vh]">
			<Show
				when={gameStateData().gameOver === "CREWMATES_WIN"}
				fallback={
					<>
						<img
							src={
								"/" +
								gameStateData().alivePlayers.filter((x) =>
									isPlayerImposter(x.playerId),
								)[0].playerId +
								"_alive.webp"
							}
							alt="Impostor"
							class="h-[30vh] w-fit"
						/>
						<p class="text-3xl">
							The{" "}
							<span
								class="text-red-500 text-4xl"
								style={{ "font-family": "VCR_OSD_MONO" }}
							>
								Impostor
							</span>{" "}
							won!
						</p>
					</>
				}
			>
				<ul class="relative">
					<For
						each={gameStateData().playersConnected.filter(
							(x) => !isPlayerImposter(x.playerId),
						)}
						// each={[
						// 	{ playerId: 0 },
						// 	{ playerId: 1 },
						// 	{ playerId: 2 },
						// 	{ playerId: 3 },
						// 	{ playerId: 4 },
						// 	{ playerId: 5 },
						// 	{ playerId: 6 },
						// 	{ playerId: 7 },
						// 	{ playerId: 8 },
						// 	{ playerId: 9 },
						// ]}
						fallback={<p>No players to show?</p>}
					>
						{(x, i) => (
							<li
								class="absolute w-[20vh] h-[20vh] -translate-1/2"
								style={{
									left: `${
										Math.floor((i() + 1) / 2) * (i() % 2 == 0 ? -10 : 10)
									}vw`,
									top: `${Math.floor((i() + 1) / 2) * -3 - 10}vh`,
									"z-index": 10 - i(),
								}}
							>
								<img
									src={
										"/" +
										x.playerId +
										"_" +
										(gameStateData().alivePlayers.findIndex(
											(y) => y.playerId === x.playerId,
										) === 1
											? "dead"
											: "alive") +
										".webp"
									}
									alt="Crewmate"
								/>
							</li>
						)}
					</For>
				</ul>
				<p class="text-3xl">
					The{" "}
					<span
						class="text-cyan-500 text-4xl"
						style={{ "font-family": "VCR_OSD_MONO" }}
					>
						Crewmates
					</span>{" "}
					won!
				</p>
			</Show>
			{/* <button
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
			</button> */}
		</div>
	);
};

export default GameOver;
