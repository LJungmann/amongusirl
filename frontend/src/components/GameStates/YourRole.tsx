import { onMount, Setter, Show } from "solid-js";
import { gameStateData, playerData } from "../../App";
import { isPlayerImposter } from "../../utils";

const YourRole = (props: { setShowRoleInfo: Setter<boolean> }) => {
	onMount(() => {
		setTimeout(() => {
			props.setShowRoleInfo(false);
		}, 5000);
	});
	return (
		<div class="flex flex-col items-center justify-center gap-4 h-full relative">
			<Show
				when={isPlayerImposter()}
				fallback={
					<>
						<div class="relative crewmate">
							<img
								src="/Among_Us_Crewmate.webp"
								alt="Among Us IRL icon"
								class="h-[30vh] relative"
							/>
						</div>
						<p
							class="text-7xl text-cyan-500 font-bold"
							style={{ "font-family": "VCR_OSD_MONO" }}
						>
							Crewmate
						</p>
						<p class="text-2xl mt-8">Game Starting...</p>
					</>
				}
			>
				<div class="relative imposter">
					<img
						src="/Among_Us_Crewmate.webp"
						alt="Among Us IRL icon"
						class="h-[30vh] relative"
					/>
				</div>
				<p
					class="text-7xl text-red-500 font-bold"
					style={{ "font-family": "VCR_OSD_MONO" }}
				>
					Imposter
				</p>
				<p class="text-2xl mt-8">Game Starting...</p>
			</Show>
		</div>
	);
};

export default YourRole;
