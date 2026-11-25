import { EVENT_SELECT_YEAR } from "../constants.ts";
import { getUniqueId } from "../get-unique-id.ts";
import type { CalendarYearEventDetail } from "../types.ts";
import { CalendarPart } from "./calendar-part.ts";
import type { Calendar } from "./calendar.ts";

export abstract class CalendarYearPicker extends CalendarPart {
	/** The `data-variant` attribute is deprecated. */
	static readonly observedAttributes = ["data-variant", "sparse"];

	/** Only allow selecting years with events. */
	get sparse(): boolean {
		return this.hasAttribute("sparse") || this.dataset["variant"] === "sparse";
	}

	set sparse(sparse: boolean) {
		if (!sparse && this.dataset["variant"] === "sparse") {
			delete this.dataset["variant"];
		}

		this.toggleAttribute("sparse", sparse);
	}

	protected selectYear(year: number) {
		this.dispatchEvent(
			new CustomEvent<CalendarYearEventDetail>(EVENT_SELECT_YEAR, {
				bubbles: true,
				detail: { year },
			}),
		);
	}
}

export class CalendarYearRadioGroup extends CalendarYearPicker {
	#inputs = new Map<number, HTMLInputElement>();
	#name = getUniqueId();
	#radioGroup: HTMLElement | null = null;

	protected override render(calendar: Calendar, currentYear: number) {
		/** Avoid losing focus by only replacing elements when necessary. */
		if (this.#radioGroup?.parentNode !== this || !isEqual(this.#inputs, calendar.years)) {
			this.#radioGroup = this.#createRadioGroup(calendar.years);
			this.replaceChildren(this.#radioGroup);
		}

		this.#inputs.forEach((input, year) => {
			input.checked = year === currentYear;
			input.disabled = this.sparse && calendar.getEvents(year) == null;
		});
	}

	#createRadioGroup(years: Array<number>): HTMLElement {
		const radioGroup = document.createElement("div");
		radioGroup.role = "radiogroup";

		this.#inputs = new Map();

		years.forEach((year) => {
			const label = document.createElement("label");

			const input = document.createElement("input");
			input.type = "radio";
			input.name = this.#name;
			input.value = String(year);
			this.#inputs.set(year, input);

			const span = document.createElement("span");
			span.textContent = String(year);

			label.append(input, span);
			radioGroup.append(label);
		});

		radioGroup.addEventListener("change", (event) => {
			this.selectYear(Number((event.target as HTMLInputElement).value));
		});

		return radioGroup;
	}
}

export class CalendarYearSelect extends CalendarYearPicker {
	#options = new Map<number, HTMLOptionElement>();
	#select: HTMLSelectElement | null = null;

	protected override render(calendar: Calendar, currentYear: number) {
		const years = this.sparse
			? calendar.years.filter((year) => {
					/** Always include the current year, because it could not be displayed otherwise. */
					return year === currentYear || calendar.getEvents(year) != null;
				})
			: calendar.years;

		if (this.#select?.parentNode !== this) {
			this.#select = this.#createSelect();
			this.#options = new Map();
			this.replaceChildren(this.#select);
		}

		/** Avoid closing an open dropdown by only replacing elements when necessary. */
		if (!isEqual(this.#options, years)) {
			this.#options = new Map(
				years.map((year) => {
					const option = document.createElement("option");
					option.value = String(year);
					option.textContent = String(year);
					return [year, option];
				}),
			);
			this.#select.replaceChildren(...this.#options.values());
		}

		this.#select.value = String(currentYear);
	}

	#createSelect(): HTMLSelectElement {
		const select = document.createElement("select");

		select.addEventListener("change", () => {
			this.selectYear(Number(select.value));
		});

		return select;
	}
}

function isEqual(elements: Map<number, HTMLElement>, years: Array<number>): boolean {
	return (
		elements.size === years.length &&
		years.every((year) => {
			return elements.has(year);
		})
	);
}
