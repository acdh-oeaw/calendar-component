import { join } from "node:path";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
	build: {
		lib: {
			entry: join(process.cwd(), "src", "main.ts"),
			name: "Calendar",
			fileName: "calendar",
			formats: ["es", "umd"],
		},
	},
	plugins: [
		dts({
			include: ["src"],
		}),
		viteStaticCopy({
			targets: [
				{
					src: "./src/i18n/*.json",
					dest: "./i18n/",
				},
			],
		}),
	],
	server: {
		port: 3000,
	},
});
