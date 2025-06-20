import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		solidPlugin(),
		tailwindcss(),
		VitePWA({
			registerType: "prompt",
			injectRegister: "inline",
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
			},
			includeAssets: [
				"favicon.ico",
				"apple-touch-icon.png",
				"maskable-icon-512x512.png",
			],
			manifest: {
				name: "Among Us IRL",
				short_name: "Among Us IRL",
				description: "Game companion app for Among Us IRL",
				theme_color: "#ffffff",
				icons: [
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
				display: "standalone",
			},
			devOptions: {
				enabled: true,
			},
		}),
	],
	server: {
		port: 3001,
		allowedHosts: [
			"stationery-background-mother-virus.trycloudflare.com",
			"among-us.mcdle.net",
			"among-us-irl.mcdle.net",
		],
	},
	build: {
		target: "esnext",
	},
});
