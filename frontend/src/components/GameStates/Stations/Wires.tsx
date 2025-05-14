import { createSignal, onMount, Show } from "solid-js";
import { gameStateData, playerData } from "../../../App";
import { getStationData } from "./BaseStation";

const Wires = () => {
	const [wireData, setWireData] = createSignal<{
		wiring: [
			[number, string],
			[number, string],
			[number, string],
			[number, string],
		];
	} | null>(null);
	onMount(async () => {
		const response = await fetch(import.meta.env.VITE_WEB_URL + "wires", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		const data: {
			wiring: [
				[number, string],
				[number, string],
				[number, string],
				[number, string],
			];
		} = await response.json();
		setWireData(data);
	});
	return (
		<Show
			when={!wireData()}
			fallback={
				<div>
					<h2 class="text-4xl text-center mt-4">🔌Connect Wires🔌</h2>
					{/* <pre>{JSON.stringify(wireData(), null, 2)}</pre> */}
					<div class="flex flex-row flex-wrap gap-x-12 gap-y-20 justify-center items-center my-12">
						<div class="flex flex-row gap-4">
							<p
								class="text-4xl block"
								style={{ "font-family": "Arial, sans-serif" }}
							>
								1️⃣
							</p>
							<p class="text-4xl block">
								{wireData()!.wiring[0][1] === "0"
									? "🔴"
									: wireData()!.wiring[0][1] === "1"
									? "♥️"
									: wireData()!.wiring[0][1] === "2"
									? "🟥"
									: "♦️"}
							</p>
						</div>
						<div class="flex flex-row gap-4">
							<p
								class="text-4xl block"
								style={{ "font-family": "Arial, sans-serif" }}
							>
								2️⃣
							</p>
							<p class="text-4xl block">
								{wireData()!.wiring[1][1] === "0"
									? "🔴"
									: wireData()!.wiring[1][1] === "1"
									? "♥️"
									: wireData()!.wiring[1][1] === "2"
									? "🟥"
									: "♦️"}
							</p>
						</div>
						<div class="flex flex-row gap-4">
							<p
								class="text-4xl block"
								style={{ "font-family": "Arial, sans-serif" }}
							>
								3️⃣
							</p>
							<p class="text-4xl block">
								{wireData()!.wiring[2][1] === "0"
									? "🔴"
									: wireData()!.wiring[2][1] === "1"
									? "♥️"
									: wireData()!.wiring[2][1] === "2"
									? "🟥"
									: "♦️"}
							</p>
						</div>
						<div class="flex flex-row gap-4">
							<p
								class="text-4xl block"
								style={{ "font-family": "Arial, sans-serif" }}
							>
								4️⃣
							</p>
							<p class="text-4xl block">
								{wireData()!.wiring[3][1] === "0"
									? "🔴"
									: wireData()!.wiring[3][1] === "1"
									? "♥️"
									: wireData()!.wiring[3][1] === "2"
									? "🟥"
									: "♦️"}
							</p>
						</div>
					</div>
					<p class="text-2xl text-center">Connect the correct wires!</p>
				</div>
			}
		>
			<p>Loading data...</p>
		</Show>
	);
};

export default Wires;
