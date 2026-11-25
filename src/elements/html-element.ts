/** Custom elements can only be registered in browsers, but should be safe to import on the server. */
export const HTMLElementBase =
	typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;
