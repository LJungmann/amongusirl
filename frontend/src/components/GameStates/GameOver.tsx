import { For, onMount, Show } from "solid-js";
import {
	gameStateData,
	playerData,
	setGameState,
	setPlayerData,
} from "../../App";
import { isPlayerAlive, isPlayerImposter } from "../../utils";
import PlayerRow from "../PlayerRow";

const GameOver = () => {
	onMount(() => {
		if (navigator.vibrate) {
			navigator.vibrate(500);
		}
		setTimeout(async () => {
			await fetch(import.meta.env.VITE_WEB_URL + "reset", {
				method: "POST",
			});
			setGameState("lobby");
			setPlayerData({
				playerId: -1,
			});
		}, 15000);
	});
	return (
		<div class="h-full flex flex-col items-center justify-center gap-4 mt-[10vh]">
			<Show
				when={gameStateData().gameOver === "CREWMATES_WIN"}
				fallback={
					<>
						<PlayerRow players={gameStateData().playersConnected} />
						<p class="text-3xl">
							The{" "}
							<span
								class="text-red-500 text-4xl"
								style={{ "font-family": "VCR_OSD_MONO" }}
							>
								Impostor
								{gameStateData().gameSettings.imposterCount > 1 ? "s" : ""}
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
										(isPlayerAlive(x.playerId) ? "alive" : "dead") +
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
		</div>
	);
};

export default GameOver;
