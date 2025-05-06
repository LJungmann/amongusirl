import { Show } from "solid-js";
import { gameStateData, playerData } from "../../../App";
import { getStationData } from "./BaseStation";

const Wires = () => {
	return (
		<Show
			when={!getStationData().data}
			fallback={
				<div>
					<p>Wire data:</p>
					<p>Player: {getStationData().player}</p>
					<pre>{JSON.stringify(getStationData().data, null, 2)}</pre>
				</div>
			}
		>
			<p>TODO station loading or no data...</p>
			<button
				class='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-8'
				onClick={async () => {
					const index = gameStateData().stations.findIndex(
						(station) => station[1] === playerData()?.playerId
					);
					if (gameStateData().stations.length > 0 && index !== -1) {
						await fetch("https://among-us-irl.mcdle.net/setStationData", {
							method: "POST",
							body: JSON.stringify({
								stationId: gameStateData().stations[index][0],
								data: {
									wires: [
										{
											color: "red",
											status: "cut",
										},
										{
											color: "blue",
											status: "cut",
										},
										{
											color: "green",
											status: "cut",
										},
									],
								},
							}),
							headers: {
								"Content-Type": "application/json",
							},
						});
					} else {
						alert("You are not in a station!");
					}
				}}
			>
				Set Wire data (TODO Btn will be removed)
			</button>
		</Show>
	);
};

export default Wires;
