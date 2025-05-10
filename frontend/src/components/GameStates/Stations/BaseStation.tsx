import { Match, Switch } from "solid-js";
import { gameStateData, playerData } from "../../../App";
import { setPlayState } from "../../Game";
import Wires from "./Wires";

export function getStationData() {
	try {
		const index = gameStateData().stations.findIndex(
			(x) => x[1] == playerData().playerId,
		);
		return {
			name: gameStateData().stations[index][0],
			player: gameStateData().stations[index][1],
			data: gameStateData().stations[index][2],
		};
	} catch (error) {
		return {
			name: "station_undefined",
			player: -1,
			data: null,
		};
	}
}

const BaseStation = () => {
	return (
		<div class="h-full w-full">
			<div class="flex flex-col gap-4 items-center justify-center h-full">
				<Switch>
					<Match when={getStationData().name == "station_wires"}>
						<Wires />
					</Match>
					<Match when={getStationData().name == "station_simon"}>
						<div class="text-center">
							<h2 class="text-4xl my-4">📱 Simon Says 📱</h2>
							<p>Press the buttons to match the shown sequence.</p>
						</div>
					</Match>
					<Match when={getStationData().name == "station_levers"}>
						<div class="text-center">
							<h2 class="text-4xl my-4">🎚️ Switch Levers 🎚️</h2>
							<p>Switch the levers correctly to complete the task.</p>
							<br />
							<p>💡 LEDs indicate how many levers are already correct.</p>
						</div>
					</Match>
					<Match when={getStationData().name == "station_lightsout"}>
						<div class="text-center">
							<h2 class="text-4xl my-4">💡 Lights Out 💡</h2>
							<p>Turn off all the lights to complete the task!</p>
						</div>
					</Match>
					<Match when={getStationData().name == "station_safecrack"}>
						<div class="text-center">
							<h2 class="text-4xl my-4">🔒 Safe Cracking 🔒</h2>
							<p>Guess the correct safe pin by rotating the dial.</p>
							<br />
							<p>
								🔊 Buzzer noise is higher the closer you are to the correct
								digit.
							</p>
							<p>💡 LEDs indicate how many digits are already correct.</p>
						</div>
					</Match>
				</Switch>

				{/* <button
					class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					onClick={async () => {
						const index = gameStateData().stations.findIndex(
							(station) => station[1] === playerData()?.playerId,
						);
						if (gameStateData().stations.length > 0 && index !== -1) {
							await fetch("https://among-us-irl.mcdle.net/completeStation", {
								method: "POST",
								body: JSON.stringify({
									stationId: gameStateData().stations[index][0],
								}),
								headers: {
									"Content-Type": "application/json",
								},
							});
							setPlayState("game");
						} else {
							alert("You are not in a station!");
						}
					}}
				>
					Complete Station (TODO Btn will be removed)
				</button> */}
			</div>
		</div>
	);
};

export default BaseStation;
