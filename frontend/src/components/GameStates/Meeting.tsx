import { For, Show } from "solid-js";
import { gameStateData, playerData } from "../../App";
import { isPlayerAlive, isPlayerRegisteredForVoting } from "../../utils";

function getMeetingEndTime() {
	const seconds =
		(gameStateData().meetingEndTime - new Date().getTime()) / 1000;
	if (seconds < 0) {
		return "";
	} else if (seconds > 60) {
		return Math.floor(seconds / 60) + "m " + Math.floor(seconds % 60) + "s";
	}
	return Math.floor(seconds) + "s";
}

const Meeting = () => {
	return (
		<div>
			<Show
				when={isPlayerRegisteredForVoting()}
				fallback={
					<p class="text-red-800">You are not yet registered for voting!</p>
				}
			>
				<p class="text-green-800">You are registered for voting!</p>
			</Show>
			<p class="text-red-800">Emergency Meeting!</p>
			<p>Meeting over in: {getMeetingEndTime()}</p>
			<ul>
				<For
					each={gameStateData().alivePlayers}
					fallback={<p>No players to vote for</p>}
				>
					{(x) => (
						<li>
							<button
								class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
								onClick={async () => {
									if (!isPlayerAlive()) {
										alert("You are dead! You cannot vote!");
										return;
									}
									alert(
										"Voted for " +
											x.playerId +
											" successfully! as " +
											typeof x.playerId,
									);
									const response = await fetch(
										"https://among-us-irl.mcdle.net/voteFor",
										{
											method: "POST",
											//"" + x.playerId,
											body: JSON.stringify({
												playerId: x.playerId,
											}),
											headers: {
												"Content-Type": "application/json",
											},
										},
									);
									alert(
										(await response.text()) === "false" ? "Failed" : "Success",
									);
								}}
							>
								Vote for {x.playerId}{" "}
								{x.playerId === playerData().playerId ? "(You)" : ""}
							</button>
						</li>
					)}
				</For>
			</ul>
		</div>
	);
};

export default Meeting;
