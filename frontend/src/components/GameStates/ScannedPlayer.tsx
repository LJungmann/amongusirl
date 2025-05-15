import { Accessor, Show } from "solid-js";
import { lastScannedPlayer } from "../Game";
import { gameStateData, playerData } from "../../App";
import { getPlayerName, isPlayerAlive, isPlayerImposter } from "../../utils";

const ScannedPlayer = (props: { time: Accessor<number> }) => {
	function attemptKill() {
		if (isPlayerImposter()) {
			// alert("Killing player " + lastScannedPlayer()?.playerId);
			fetch(import.meta.env.VITE_WEB_URL + "kill", {
				method: "POST",
				body: JSON.stringify({
					playerId: lastScannedPlayer()?.playerId,
				}),
				headers: {
					"Content-Type": "application/json",
				},
			});
		} else {
			alert("You are not the imposter!");
		}
	}

	return (
		<div>
			<Show
				when={isPlayerAlive(lastScannedPlayer()?.playerId)}
				fallback={
					<div>
						<img
							src={"/" + lastScannedPlayer()?.playerId + "_dead.webp"}
							alt=""
							class="w-fit h-[30vh]"
						/>
						<p>{getPlayerName(lastScannedPlayer()?.playerId)} is dead!</p>
						<button class="bg-red-500 px-2 py-4 m-2 rounded-2xl text-white min-w-32">
							Report
						</button>
					</div>
				}
			>
				<div>
					<img
						src={"/" + lastScannedPlayer()?.playerId + "_alive.webp"}
						alt=""
						class="w-fit h-[30vh]"
					/>
					<p>{getPlayerName(lastScannedPlayer()?.playerId)} is alive!</p>
					<button
						class="bg-red-500 px-2 py-4 m-2 rounded-2xl text-white min-w-32"
						onClick={attemptKill}
					>
						Kill
					</button>
				</div>
			</Show>
			<p>
				Closing in{" "}
				{Math.floor(
					(new Date(lastScannedPlayer()?.timeStamp ?? -1).getTime() -
						new Date(props.time()).getTime()) /
						1000,
				)}
				s
			</p>
		</div>
	);
};

export default ScannedPlayer;
