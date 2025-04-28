import { createSignal, For, onMount } from "solid-js";

const NFCTest = () => {
	const [logList, setLogList] = createSignal<Array<string>>([]);

	onMount(async () => {});

	function log(type: string, message: string) {
		setLogList((prev) => [...prev, message]);
		console.log(type, message);
	}

	return (
		<div class='flex flex-col items-center h-screen bg-gray-100 gap-4'>
			<h2 class='text-2xl'>NFCTest</h2>
			<button
				class='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
				onClick={() => {
					if ("NDEFReader" in window) {
						document.getElementById("available").style.display = "block";
					} else {
						document.getElementById("not-available").style.display = "block";
					}

					setTimeout(() => {
						document.getElementById("not-available").style.display = "none";
						document.getElementById("available").style.display = "none";
					}, 3000);
				}}
			>
				Test
			</button>
			<div id='available' style={{ display: "none" }}>
				NFC is available
			</div>
			<div id='not-available' style={{ display: "none" }}>
				NFC is not available
			</div>
			<button
				class='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
				onClick={async () => {
					try {
						const ndef = new NDEFReader();
						await ndef.scan();
						log("readLog", "> Scan started");

						ndef.addEventListener("readingerror", () => {
							log(
								"readLog",
								"Argh! Cannot read data from the NFC tag. Try another one?"
							);
						});

						ndef.addEventListener("reading", ({ message, serialNumber }) => {
							log("readLog", `> Serial Number: ${serialNumber}`);
							log("readLog", `> Records: (${message.records.length})`);

							const decoder = new TextDecoder();
							for (const record of message.records) {
								switch (record.recordType) {
									case "text":
										const textDecoder = new TextDecoder(record.encoding);
										log(
											"readLog",
											`Text: ${textDecoder.decode(record.data)} (${
												record.lang
											})`
										);
										break;
									case "url":
										log("readLog", `URL: ${decoder.decode(record.data)}`);
										break;
									case "mime":
										if (record.mediaType === "application/json") {
											log(
												"readLog",
												`JSON: ${JSON.parse(decoder.decode(record.data))}`
											);
										} else {
											log("readLog", `Media not handled`);
										}
										break;
									default:
										log("readLog", `Record not handled`);
								}
							}
						});
					} catch (error) {
						log("readLog", "Argh! " + error);
					}
				}}
			>
				Start scanning
			</button>
			<ul>
				<For each={logList()}>{(item) => <li>{item}</li>}</For>
			</ul>
		</div>
	);
};

export default NFCTest;
