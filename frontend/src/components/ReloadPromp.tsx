import type { Component } from "solid-js";
import { Show } from "solid-js";
import { useRegisterSW } from "virtual:pwa-register/solid";
import styles from "./ReloadPrompt.module.css";
import { registerSW } from "virtual:pwa-register";

const ReloadPrompt: Component = () => {
	const {
		offlineReady: [offlineReady, setOfflineReady],
		needRefresh: [needRefresh, setNeedRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegistered(r) {
			// eslint-disable-next-line prefer-template
			console.log("SW Registered: ", r);
		},
		onRegisterError(error) {
			console.log("SW registration error", error);
		},
	});

	const close = () => {
		setOfflineReady(false);
		setNeedRefresh(false);
	};

	const intervalMS = 1000 * 61; //60 * 60 *
	const updateSW = registerSW({
		onRegistered(r) {
			r &&
				setInterval(() => {
					r.update();
				}, intervalMS);
		},
	});

	return (
		<div class={styles.Container}>
			<Show when={offlineReady() || needRefresh()}>
				<div class={styles.Toast}>
					<div class={styles.Message}>
						<Show
							fallback={<span>New content available, click on reload button to update.</span>}
							when={offlineReady()}
						>
							<span>App ready to work offline!</span>
						</Show>
					</div>
					<Show when={needRefresh()}>
						<button class={styles.ToastButton} onClick={() => updateServiceWorker(true)}>
							Reload
						</button>
					</Show>
					<button class={styles.ToastButton} onClick={() => close()}>
						Close
					</button>
				</div>
			</Show>
		</div>
	);
};

export default ReloadPrompt;
