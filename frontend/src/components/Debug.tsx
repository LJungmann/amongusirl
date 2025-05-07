import {
	gameStateData,
	playerData,
	setDebug,
	setGameState,
	setPlayerData,
} from "../App";

const Debug = () => {
	return (
		<div class="w-full overflow-scroll absolute top-0 left-0 bg-gray-200 h-screen p-2">
			<pre>
				data:
				{JSON.stringify(gameStateData(), null, 2)}
			</pre>
			<pre>
				playerdata:
				{JSON.stringify(playerData(), null, 2)}
			</pre>
			<button
				class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
				onClick={async () => {
					await fetch("https://among-us-irl.mcdle.net/reset", {
						method: "POST",
					});
					setGameState("lobby");
					setPlayerData({
						playerId: -1,
					});
					setDebug(false);
					localStorage.removeItem("among.gameId");
					localStorage.removeItem("among.playerId");
				}}
			>
				Reset Game
			</button>
		</div>
	);
};

export default Debug;
