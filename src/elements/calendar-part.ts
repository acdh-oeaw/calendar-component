import { SELECTOR_ROOT } from "../constants.ts";
import type { Calendar } from "./calendar.ts";
import { HTMLElementBase } from "./html-element.ts";

/** Base class for elements which display the state of the closest calendar. */
export abstract class CalendarPart extends HTMLElementBase {
	#calendar: Calendar | null = null;
	#controller: AbortController | null = null;
	#isRendered = false;

	connectedCallback() {
		this.#controller?.abort();
		this.#controller = new AbortController();

		const { signal } = this.#controller;

		const calendar = this.closest<Calendar>(SELECTOR_ROOT);
		if (calendar == null) return;

		if (customElements.get(calendar.localName) != null) {
			this.#connect(calendar, signal);
		} else {
			void customElements.whenDefined(calendar.localName).then(() => {
				this.#connect(calendar, signal);
			});
		}
	}

	disconnectedCallback() {
		this.#controller?.abort();
		this.#controller = null;
		this.#calendar = null;
	}

	attributeChangedCallback() {
		this.update();
	}

	get calendar(): Calendar | null {
		return this.#calendar;
	}

	protected update() {
		const calendar = this.#calendar;
		if (calendar == null) return;

		if (calendar.year != null) {
			this.render(calendar, calendar.year);
			this.#isRendered = true;
		} else if (this.#isRendered) {
			/** Only remove rendered content, but keep fallback content. */
			this.replaceChildren();
			this.#isRendered = false;
		}
	}

	protected abstract render(calendar: Calendar, year: number): void;

	#connect(calendar: Calendar, signal: AbortSignal) {
		if (signal.aborted) return;

		this.#calendar = calendar;
		calendar.subscribe(() => {
			this.update();
		}, signal);
	}
}
