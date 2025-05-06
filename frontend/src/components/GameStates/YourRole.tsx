import { Setter } from "solid-js";
import { gameStateData, playerData } from "../../App";

const YourRole = (props: { setShowRoleInfo: Setter<boolean> }) => {
	return (
		<div class='flex flex-col items-center justify-center gap-4'>
			<p>
				You are{" "}
				{(gameStateData().imposterPlayerId as any).playerId ===
				playerData().playerId
					? "an imposter!"
					: "a crewmate!"}
			</p>
			<button
				class='bg-green-400 p-4 rounded-2xl'
				onClick={() => {
					props.setShowRoleInfo(false);
				}}
			>
				Let's play!
			</button>
		</div>
	);
};

export default YourRole;
