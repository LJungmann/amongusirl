import { onMount } from "solid-js";
import { playerData } from "../../App";

const Dead = () => {
	onMount(() => {
		// vibrate the device for 500ms
		if (navigator.vibrate) {
			navigator.vibrate(500);
		}
	});

	return (
		<div class="w-full h-full flex flex-col items-center justify-center px-16">
			<img
				src={"/" + playerData().playerId + "_dead.webp"}
				// src="/Among_Us_Deadmate.webp"
				alt="Among Us IRL dead icon"
				class="h-[30vh]"
			/>
			<div>
				<p class="text-4xl">You died!</p>
				<p>
					Please stay in your current location until your body is reported or
					until the next emergency meeting.
				</p>
				<br />
				<p class="font-bold">Don't tell other players who killed you!</p>
			</div>
		</div>
	);
};

export default Dead;
