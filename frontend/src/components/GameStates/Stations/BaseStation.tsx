import { Match, Switch } from "solid-js";
import { gameStateData, playerData } from "../../../App";
import { setPlayState } from "../../Game";
import Wires from "./Wires";

export function getStationData() {
	try {
		const index = gameStateData().stations.findIndex(
			(x) => x[1] == playerData().playerId
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
		<div>
			<p>In station: {getStationData().name}</p>
			<div class='flex flex-col gap-4'>
				<Switch>
					<Match when={getStationData().name == "station_wires"}>
						<Wires />
					</Match>
				</Switch>

				<button
					class='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
					onClick={async () => {
						const index = gameStateData().stations.findIndex(
							(station) => station[1] === playerData()?.playerId
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
				</button>
			</div>
		</div>
	);
};

export default BaseStation;
