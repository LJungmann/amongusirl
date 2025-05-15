import { For } from "solid-js";
import { gameStateData, playerData } from "../App";
import { getPlayerName, isPlayerAlive } from "../utils";

const PlayerRow = (props: { players: Array<{ playerId: number }> }) => {
	return (
		<ul class="relative">
			<For
				each={props.players.sort((x, y) => {
					//bring your player to the front
					if (x.playerId === playerData().playerId) {
						return -1;
					} else if (y.playerId === playerData().playerId) {
						return 1;
					} else {
						return x.playerId - y.playerId;
					}
				})}
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
						<span class="absolute left-1/2 -translate-x-1/2 text-cyan-500 font-bold text-2xl w-max">
							{getPlayerName(x.playerId)}
						</span>
						<img
							src={
								"/" +
								x.playerId +
								"_" +
								(isPlayerAlive(x.playerId) ? "alive" : "dead") +
								".webp"
							}
							alt="Imposter"
						/>
					</li>
				)}
			</For>
		</ul>
	);
};

export default PlayerRow;
