import { setGameState, setPlayerData } from "../App";

const Game = () => {
	return (
		<div>
			<h1>Game</h1>
			<div class='flex flex-col items-center justify-center gap-2'>
				<button
					class='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
					onClick={() => {
						fetch("https://among-us-irl.mcdle.net/start", {
							method: "POST",
						});
					}}
				>
					Start Game
				</button>
			</div>
		</div>
	);
};

export default Game;
