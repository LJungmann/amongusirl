import { Accessor, Show } from "solid-js";
import { lastScannedPlayer } from "../Game";
import { gameStateData, playerData } from "../../App";
import { isPlayerAlive, isPlayerImposter } from "../../utils";

const ScannedPlayer = (props: { time: Accessor<number> }) => {
	function attemptKill() {
		if (isPlayerImposter()) {
			alert("Killing player " + lastScannedPlayer()?.playerId);
			fetch("https://among-us-irl.mcdle.net/kill", {
				method: "POST",
				body: JSON.stringify({
					playerId: lastScannedPlayer()?.playerId,
				}),
				headers: {
					"Content-Type": "application/json",
				},
			});
		} else {
			alert(
				"You are not the imposter! " +
					JSON.stringify(gameStateData().imposterPlayerId),
			);
		}
	}

	return (
		<div>
			<div>
				Recently scanned player: {lastScannedPlayer()?.playerId ?? "none"} (
				{new Date(lastScannedPlayer()?.timeStamp ?? -1).toLocaleTimeString()}{" "}
				greater than {new Date(props.time()).toLocaleTimeString()})
			</div>
			<Show
				when={isPlayerAlive(lastScannedPlayer()?.playerId)}
				fallback={
					<div>
						<p>Player is dead!</p>
						<button class="bg-red-500 px-2 py-4 m-2 rounded-2xl text-white min-w-32">
							Report
						</button>
					</div>
				}
			>
				<div>
					<p>Player is alive!</p>
					<button
						class="bg-red-500 px-2 py-4 m-2 rounded-2xl text-white min-w-32"
						onClick={attemptKill}
					>
						Kill
					</button>
				</div>
			</Show>
		</div>
	);
};

export default ScannedPlayer;
