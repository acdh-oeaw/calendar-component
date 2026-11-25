import { JSDOM } from "jsdom";

export function setupDom() {
	const { window } = new JSDOM();

	Object.assign(globalThis, {
		customElements: window.customElements,
		CustomEvent: window.CustomEvent,
		document: window.document,
		Event: window.Event,
		HTMLElement: window.HTMLElement,
	});
}
