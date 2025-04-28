import type { Component } from "solid-js";

import ReloadPrompt from "./components/ReloadPromp";
import NFCTest from "./components/NFCTest";

const App: Component = () => {
	return (
		<div>
			<NFCTest />
			<ReloadPrompt />
		</div>
	);
};

export default App;
