import { join } from "node:path";

import { transform } from "esbuild";
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
		/** @see https://github.com/vitejs/vite/issues/4863#issuecomment-1005451468 */
		rollupOptions: {
			output: {
				assetFileNames(assetInfo) {
					if (assetInfo.name === "style.css") return "calendar.css";
					return assetInfo.name!;
				},
			},
		},
	},
	plugins: [
		/**
		 * Vite in library mode does not minify whitespace for esm builds, so we do that in a separate plugin.
		 *
		 * @see https://github.com/vitejs/vite/issues/6555#issuecomment-1342664357
		 */
		{
			name: "minify",
			renderChunk: {
				order: "post",
				async handler(code, chunk, options) {
					if (options.format === "es" && chunk.fileName.endsWith(".js")) {
						return await transform(code, { minify: true });
					}
					return code;
				},
			},
		},
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
