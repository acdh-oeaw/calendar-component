import "./calendar.css";

import { assert, isoDate, range, unique } from "@acdh-oeaw/lib";

import {
	ELEMENT_CALENDAR_YEAR,
	ELEMENT_PICKER,
	ELEMENT_ROOT,
	EVENT_CLICK_CALENDAR_EVENT,
	EVENT_SELECT_YEAR,
} from "./constants.ts";
import { createCalendar } from "./create-calendar.ts";
import { getDateRange } from "./get-date-range.ts";
import { getUniqueId } from "./get-unique-id.ts";
import labels from "./i18n/en.ts";
import type { I18n } from "./i18n/types.ts";

export interface CalendarEvent {
	date: Date;
	kind: string;
	label: string;
}

//

export interface CalendarData {
	events: Array<CalendarEvent>;
	eventsByDate: Map<number, Map<string, Array<CalendarEvent>>>;
	startYear: number | null;
	endYear: number | null;
}

export class Calendar extends HTMLElement {
	data: CalendarData;
	currentYear: number | null;

	i18n = labels;

	picker: CalendarYearSelect | null;
	calendar: CalendarYear | null;

	constructor() {
		super();

		this.data = { events: [], eventsByDate: new Map(), startYear: null, endYear: null };
		this.currentYear = null;

		this.picker = null;
		this.calendar = null;
	}

	connectedCallback() {
		this.picker = this.querySelector<CalendarYearSelect>(ELEMENT_PICKER);
		this.calendar = this.querySelector<CalendarYear>(ELEMENT_CALENDAR_YEAR);

		assert(this.picker, "Missing picker element.");
		assert(this.calendar, "Missing calendar year element.");

		this.addEventListener(EVENT_SELECT_YEAR, (event) => {
			const selectedYear = (event as CustomEvent<{ year: number }>).detail.year;
			this.currentYear = selectedYear;

			// this.update();
			this.calendar?.setData({
				currentYear: this.currentYear,
				eventsByDate: this.data.eventsByDate.get(this.currentYear)!,
			});
		});

		this.update();
	}

	setData(data: CalendarData & { currentYear?: number }) {
		const dateRange = getDateRange(data.events);
		const startYear = dateRange.min.getUTCFullYear();
		const endYear = dateRange.max.getUTCFullYear();

		const eventsByDate = new Map<number, Map<string, Array<CalendarEvent>>>();

		data.events.forEach((event) => {
			const year = event.date.getUTCFullYear();
			const date = isoDate(event.date);

			if (!eventsByDate.has(year)) {
				eventsByDate.set(year, new Map());
			}

			const byYear = eventsByDate.get(year)!;

			if (!byYear.has(date)) {
				byYear.set(date, [event]);
			} else {
				byYear.get(date)!.push(event);
			}
		});

		this.data = {
			events: data.events,
			eventsByDate,
			startYear,
			endYear,
		};

		if (data.currentYear != null && data.currentYear >= startYear && data.currentYear <= endYear) {
			this.currentYear = data.currentYear;
		} else {
			this.currentYear = startYear;
		}

		this.update();
	}

	update() {
		const { startYear, endYear, eventsByDate } = this.data;
		const currentYear = this.currentYear;
		if (startYear == null || endYear == null || currentYear == null) return;

		if (this.picker == null || this.calendar == null) return;

		this.picker.setData({ startYear, endYear, currentYear, eventsByDate });
		this.calendar.setData({
			currentYear,
			eventsByDate: eventsByDate.get(currentYear) ?? null,
		});
	}

	setI18n(i18n: I18n) {
		this.i18n = i18n;

		this.calendar?.setI18n(i18n);
	}
}

//

export interface CalendarYearPickerData {
	startYear: number;
	endYear: number;
	currentYear: number;
	eventsByDate: Map<number, Map<string, Array<CalendarEvent>>>;
}

//

export class CalendarYearSelect extends HTMLElement {
	data: CalendarYearPickerData | null;
	/** Display full range of years, or only years with events. */
	variant: "full" | "sparse" = "full";

	constructor() {
		super();

		this.data = null;
	}

	connectedCallback() {
		this.update();

		if (this.dataset["variant"] === "sparse") {
			this.variant = "sparse";
		}
	}

	setData(data: CalendarYearPickerData) {
		this.data = data;

		this.update();
	}

	update() {
		if (this.data == null) return;
		const { startYear, endYear, currentYear, eventsByDate } = this.data;

		const select = document.createElement("select");

		range(startYear, endYear).forEach((year) => {
			if (this.variant === "sparse" && !eventsByDate.has(year)) return;

			const option = document.createElement("option");
			option.value = String(year);
			option.append(document.createTextNode(String(year)));

			const selected = year === currentYear;
			option.selected = selected;

			select.append(option);
		});

		select.addEventListener("change", (event) => {
			const element = event.currentTarget as HTMLSelectElement;
			const year = Number(element.value);
			this.dispatchEvent(new CustomEvent(EVENT_SELECT_YEAR, { detail: { year }, bubbles: true }));
		});

		this.innerHTML = "";
		this.append(select);
	}
}

//

export class CalendarYearRadioGroup extends HTMLElement {
	data: CalendarYearPickerData | null;
	/** Display full range of years, or only years with events. */
	variant: "full" | "sparse" = "full";
	id: string;

	constructor() {
		super();

		this.data = null;
		this.id = getUniqueId();
	}

	connectedCallback() {
		this.update();

		if (this.dataset["variant"] === "sparse") {
			this.variant = "sparse";
		}
	}

	setData(data: CalendarYearPickerData) {
		this.data = data;

		this.update();
	}

	update() {
		if (this.data == null) return;
		const { startYear, endYear, currentYear, eventsByDate } = this.data;

		const radioGroup = document.createElement("div");
		radioGroup.role = "radiogroup";

		range(startYear, endYear).forEach((year) => {
			const label = document.createElement("label");

			const input = document.createElement("input");
			input.type = "radio";
			input.name = this.id;
			input.value = String(year);

			if (this.variant === "sparse" && !eventsByDate.has(year)) {
				input.disabled = true;
			}

			const selected = year === currentYear;
			input.checked = selected;

			const span = document.createElement("span");
			span.append(document.createTextNode(String(year)));

			label.append(input);
			label.append(span);

			radioGroup.append(label);
		});

		radioGroup.addEventListener("change", (event) => {
			const element = event.target as HTMLInputElement;
			const year = Number(element.value);
			this.dispatchEvent(new CustomEvent(EVENT_SELECT_YEAR, { detail: { year }, bubbles: true }));
		});

		this.innerHTML = "";
		this.append(radioGroup);
	}
}

//

export interface CalendarYearData {
	currentYear: number;
	eventsByDate: Map<string, Array<CalendarEvent>> | null;
}

export class CalendarYear extends HTMLElement {
	data: CalendarYearData | null;
	i18n = labels;

	constructor() {
		super();

		this.data = null;
	}

	connectedCallback() {
		this.update();
	}

	setData(data: CalendarYearData) {
		this.data = data;

		this.update();
	}

	update() {
		if (this.data == null) return;
		const { currentYear, eventsByDate } = this.data;

		const calendar = createCalendar(currentYear);

		const tables = calendar.map((month, index) => {
			const table = document.createElement("table");

			const caption = document.createElement("caption");
			caption.textContent = this.i18n.months[index]!;
			table.append(caption);

			const date = new Date(Date.UTC(currentYear, index, 1));

			month.forEach((week) => {
				const tr = document.createElement("tr");

				week.forEach((day) => {
					const td = document.createElement("td");

					if (day != null) {
						date.setDate(day);
						const formattedDate = isoDate(date);

						if (eventsByDate?.has(formattedDate)) {
							const events = eventsByDate.get(formattedDate)!;

							const kinds = unique(
								events.map((event) => {
									return event.kind.replace(/\s+/g, "_");
								}),
							);

							const button = document.createElement("button");
							button.ariaLabel = formattedDate;
							button.append(document.createTextNode(String(day)));

							button.dataset["eventKinds"] = kinds.join(" ");
							button.dataset["eventKindsCount"] = String(kinds.length);
							button.dataset["eventsCount"] = String(events.length);
							// button.dataset["date"] = formattedDate;

							button.addEventListener("click", () => {
								this.dispatchEvent(
									new CustomEvent(EVENT_CLICK_CALENDAR_EVENT, {
										detail: { date: new Date(formattedDate), events },
										bubbles: true,
									}),
								);
							});

							td.append(button);
						} else {
							const div = document.createElement("div");
							div.append(document.createTextNode(String(day)));
							td.append(div);
						}
					}

					tr.append(td);
				});

				table.append(tr);
			});

			return table;
		});

		this.innerHTML = "";
		this.append(...tables);
	}

	setI18n(i18n: I18n) {
		this.i18n = i18n;
	}
}

//

interface CalendarRegisterOptions {
	picker?: "radio-group" | "select";
}

export function register(options?: CalendarRegisterOptions) {
	const picker = options?.picker === "select" ? CalendarYearSelect : CalendarYearRadioGroup;

	customElements.define(ELEMENT_ROOT, Calendar);
	customElements.define(ELEMENT_PICKER, picker);
	customElements.define(ELEMENT_CALENDAR_YEAR, CalendarYear);
}

//

export { getDateRange };
