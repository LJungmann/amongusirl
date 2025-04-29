import { onCleanup, onMount } from "solid-js";
import { setGameState, setPlayerData } from "../App";

const Game = () => {
	const ndef = new NDEFReader();
	onMount(async () => {
		try {
			await ndef.scan();

			ndef.addEventListener("readingerror", () => {
				console.log(
					"readLog",
					"Argh! Cannot read data from the NFC tag. Try another one?"
				);
			});

			ndef.addEventListener("reading", handleReading);
		} catch (error) {
			// log("readLog", "Argh! " + error);
		}
	});

	onCleanup(() => {
		ndef.removeEventListener("reading", handleReading);
	});

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

export async function handleReading(event: Event) {
	const { message, serialNumber } = event as NDEFReadingEvent;
	const decoder = new TextDecoder();
	for (const record of message.records) {
		switch (record.recordType) {
			case "text":
				const textDecoder = new TextDecoder(record.encoding);
				// log(
				//     "readLog",
				//     `Text: ${textDecoder.decode(record.data)} (${
				//         record.lang
				//     })`
				// );
				alert(textDecoder.decode(record.data));
				break;
			case "url":
				// log("readLog", `URL: ${decoder.decode(record.data)}`);
				if (decoder.decode(record.data) === import.meta.env.VITE_APP_URL) {
					alert("Emergency Meeting called!");
					await fetch("https://among-us-irl.mcdle.net/emergency", {
						method: "POST",
					});
				}
				break;
			case "mime":
				if (record.mediaType === "application/json") {
					// log(
					//     "readLog",
					//     `JSON: ${JSON.parse(decoder.decode(record.data))}`
					// );
				} else {
					// log("readLog", `Media not handled`);
				}
				break;
			default:
			// log("readLog", `Record not handled`);
		}
	}
}
