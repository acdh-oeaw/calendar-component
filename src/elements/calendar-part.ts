import { ELEMENT_ROOT } from "../constants.ts";
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

		if (customElements.get(ELEMENT_ROOT) != null) {
			this.#connect(signal);
		} else {
			void customElements.whenDefined(ELEMENT_ROOT).then(() => {
				this.#connect(signal);
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

	#connect(signal: AbortSignal) {
		if (signal.aborted) return;

		this.#calendar = this.closest<Calendar>(ELEMENT_ROOT);
		this.#calendar?.subscribe(() => {
			this.update();
		}, signal);
	}
}
