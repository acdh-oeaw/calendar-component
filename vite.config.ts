import { join } from "node:path";

import { defineConfig, minify } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
	build: {
		lib: {
			entry: join(process.cwd(), "src", "index.ts"),
			name: "Calendar",
			fileName: "calendar",
			formats: ["es", "umd"],
		},
		/** @see https://github.com/vitejs/vite/issues/4863#issuecomment-1005451468 */
		rolldownOptions: {
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
			generateBundle: {
				order: "post",
				async handler(options, bundle) {
					if (options.format !== "es") return;

					for (const chunk of Object.values(bundle)) {
						if (chunk.type === "chunk" && chunk.fileName.endsWith(".js")) {
							const result = await minify(chunk.fileName, chunk.code, { module: true });
							chunk.code = result.code;
						}
					}
				},
			},
		},
		viteStaticCopy({
			targets: [
				{
					src: "./src/i18n/*.ts",
					dest: "./i18n/",
					rename(fileName, fileExtension) {
						const ext = ["de", "en"].includes(fileName) ? "js" : fileExtension;
						return { name: [fileName, ext].join("."), stripBase: true };
					},
				},
			],
		}),
	],
	server: {
		port: 3000,
	},
});
