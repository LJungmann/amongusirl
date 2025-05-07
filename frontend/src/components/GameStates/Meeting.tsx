import { For, onMount, Show } from "solid-js";
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
	onMount(() => {
		if (navigator.vibrate) {
			navigator.vibrate(500);
		} else {
			alert("Vibration not supported on this device.");
		}
	});

	return (
		<div>
			<Show
				when={isPlayerRegisteredForVoting()}
				fallback={
					<div class="h-full items-center justify-center flex">
						<p class="text-red-800">You are not yet registered for voting!</p>
					</div>
				}
			>
				<div class="flex flex-col gap-2 mx-4">
					<h2
						class="text-red-800 text-5xl text-center pt-4"
						style={{ "font-family": "VCR_OSD_MONO" }}
					>
						Emergency Meeting!
					</h2>
					<div class="relative">
						<span class="absolute top-1/2 left-1/2 text-xl font-bold -translate-1/2">
							Meeting over in: {getMeetingEndTime()}
						</span>
						<progress
							//meeting start time causes issues because it is already too long ago when players have registered for voting
							max={
								(gameStateData().meetingEndTime -
									gameStateData().meetingStartTime) /
								1000
							}
							value={
								(gameStateData().meetingEndTime - new Date().getTime()) / 1000
							}
							// meeting endet um 10 Uhr
							// es ist gerade 9:55 Uhr
							// meeting dauert noch 5 min
							//um 9:57 dauert das meeting noch 3 min
							class="w-full h-12 progressbar"
						/>{" "}
					</div>
					<Show when={!isPlayerAlive()}>
						<p class="text-red-800 w-full text-center py-2">
							You are dead and cannot vote!
						</p>
					</Show>
					<ul class="flex flex-row flex-wrap gap-2 py-4 items-center justify-center rounded bg-gray-200">
						<For
							// each={gameStateData().alivePlayers}
							each={[
								{ playerId: 0 },
								{ playerId: 1 },
								{ playerId: 2 },
								{ playerId: 3 },
								{ playerId: 4 },
								{ playerId: 5 },
								{ playerId: 6 },
								{ playerId: 7 },
								{ playerId: 8 },
								{ playerId: 9 },
							]}
							fallback={<p>No players to vote for</p>}
						>
							{(x) => (
								<li class="w-[45%] bg-red-500 hover:bg-red-700 flex flex-row py-4 gap-2 rounded justify-center">
									<img
										// src="/Among_Us_Crewmate.webp"
										src={
											"/" +
											x.playerId +
											"_" +
											(isPlayerAlive(x.playerId) ? "alive" : "dead") +
											".webp"
										} // TODO change to make dead players not clickable
										class="w-8 h-fit"
									/>

									<button
										class="text-white font-bold w-fit"
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
												(await response.text()) === "false"
													? "Failed"
													: "Success",
											);
										}}
									>
										Vote for {x.playerId + 1}
										{x.playerId === playerData().playerId ? "(You)" : ""}
									</button>
								</li>
							)}
						</For>
						<li class="w-[45%] bg-red-500 hover:bg-red-700 flex flex-row py-4 gap-2 rounded justify-center">
							<button
								class="text-white font-bold w-fit"
								onClick={async () => {
									const response = await fetch(
										"https://among-us-irl.mcdle.net/voteFor",
										{
											method: "POST",
											//"" + x.playerId,
											body: JSON.stringify({
												playerId: -1,
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
								Skip
							</button>
						</li>
					</ul>
				</div>
			</Show>
		</div>
	);
};

export default Meeting;
