import { createSignal, Show } from "solid-js";
import {
	gameStateData,
	playerData,
	setDebug,
	setGameState,
	setPlayerData,
} from "../App";
import DebugPage from "./DebugPage";

const Debug = () => {
	const [debugPage, setDebugPage] = createSignal(false);

	let passwordInput: HTMLInputElement | undefined;
	return (
		<div class="w-full overflow-scroll absolute top-0 left-0 bg-gray-200 h-screen p-2">
			<input type="password" ref={passwordInput} />
			<button
				onClick={() => {
					if (passwordInput?.value === "JiO37a") {
						setDebugPage(true);
					} else {
						alert("Incorrect password");
					}
				}}
			>
				Toggle Debug Page
			</button>
			<Show
				when={debugPage()}
				fallback={
					<>
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
								await fetch(import.meta.env.VITE_WEB_URL + "reset", {
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
					</>
				}
			>
				<DebugPage />
			</Show>
		</div>
	);
};

export default Debug;
