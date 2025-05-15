import { Match, onMount, Switch } from "solid-js";
import { gameStateData } from "../../App";
import { getPlayerName, isPlayerImposter } from "../../utils";

const MeetingResult = () => {
	onMount(() => {
		if (navigator.vibrate) {
			navigator.vibrate(500);
		}
	});

	return (
		<div class="h-full">
			<h2
				class="text-red-800 text-5xl text-center pt-4"
				style={{ "font-family": "VCR_OSD_MONO" }}
			>
				Emergency Meeting!
			</h2>{" "}
			<div class="w-full h-full flex flex-col items-center justify-center">
				<Switch>
					<Match
						when={
							// false
							gameStateData().lastMeetingResult == "no_votes" ||
							gameStateData().lastMeetingResult == "skipped" ||
							gameStateData().lastMeetingResult.startsWith("tie_")
						}
					>
						<p class="text-4xl text-center">
							No one was ejected.
							<br />
							(Skipped)
						</p>
					</Match>
					<Match
						when={
							// true
							gameStateData().lastMeetingResult.startsWith("killed_")
						}
					>
						<>
							<img
								src={
									"/" +
									// 1 +
									gameStateData().lastMeetingResult.split("_")[1] +
									"_alive.webp"
								}
								alt="Player Icon"
								class="h-[30vh] ejected"
							/>
							<p class="text-4xl text-center">
								{getPlayerName(
									parseInt(gameStateData().lastMeetingResult.split("_")[1]),
								)}
								was{" "}
								{isPlayerImposter(
									parseInt(gameStateData().lastMeetingResult.split("_")[1]),
								)
									? ""
									: "NOT"}{" "}
								the Imposter!
							</p>
						</>
					</Match>
				</Switch>
			</div>
		</div>
	);
};

export default MeetingResult;
