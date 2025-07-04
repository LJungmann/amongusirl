import { createSignal, For, Show } from "solid-js";
import { gameStateData } from "../App";
import { getPlayerName, isPlayerAlive, isPlayerImposter } from "../utils";
import PlayerRow from "./PlayerRow";

const DebugPage = () => {
	const [showImposters, setShowImposters] = createSignal(false);
	return (
		<div class="flex flex-col items-center justify-center bg-gray-100 gap-4">
			<h2 class="text-4xl mb-4 text-center">All players:</h2>
			<PlayerRow players={gameStateData().playersConnected} />
			<h2 class="text-4xl mb-4 text-center">Game Progress</h2>
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
				(
				<span>
					{gameStateData().gamesCompleted.length} /{" "}
					{gameStateData().playersConnected.length *
						gameStateData().gameSettings.tasksPerPlayer}
				</span>
				)
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
				(
				<span>
					{gameStateData().scansCompleted.reduce(
						(acc, scan) => acc + scan[1],
						0,
					) + " "}
					/
					{" " +
						gameStateData().playersConnected.length *
							gameStateData().gameSettings.scansPerPlayer}
				</span>
				)
			</div>
			<h2 class="text-4xl mb-4 text-center">Imposters:</h2>
			<Show when={showImposters()} fallback={<span>hidden!</span>}>
				<PlayerRow
					players={gameStateData().playersConnected.filter((p) =>
						isPlayerImposter(p.playerId),
					)}
				/>
			</Show>
			<button
				class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				onClick={() => setShowImposters(!showImposters())}
			>
				Toggle Imposters
			</button>
			<h2 class="text-4xl mb-4 text-center">Game Settings:</h2>

			<ul>
				<li>Imposter Count: {gameStateData().gameSettings.imposterCount}</li>
				<li>Scans Per Player: {gameStateData().gameSettings.scansPerPlayer}</li>
				<li>Tasks Per Player: {gameStateData().gameSettings.tasksPerPlayer}</li>
				<li>
					Kill Window Time: {gameStateData().gameSettings.killWindowTime}{" "}
					seconds
				</li>
				<li>
					Scan Cooldown Time: {gameStateData().gameSettings.scanCooldownTime}{" "}
					seconds
				</li>
			</ul>
			<h2 class="text-4xl mb-4 text-center">Players at stations:</h2>

			<ul>
				<For
					each={gameStateData().stations}
					fallback={<p>No players at stations?</p>}
				>
					{(x) => (
						<li class="flex flex-row items-center gap-2">
							<img
								src={`/${x[1]}_${isPlayerAlive(x[1]) ? "alive" : "dead"}.webp`}
								alt="User Icon"
								class="w-8 h-fit"
							/>
							<span>
								Player {getPlayerName(x[1])} is currently at station {x[0]}
							</span>
						</li>
					)}
				</For>
			</ul>
		</div>
	);
};

export default DebugPage;
