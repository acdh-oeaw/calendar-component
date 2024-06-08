import "./calendar.css";

import { assert, groupByToMap, isoDate, range, unique } from "@acdh-oeaw/lib";

import {
	ELEMENT_CALENDAR_YEAR,
	ELEMENT_PICKER,
	ELEMENT_ROOT,
	EVENT_CLICK_CALENDAR_EVENT,
	EVENT_SELECT_YEAR,
} from "./constants.ts";
import { createCalendar } from "./create-calendar.ts";
import { getDateRange } from "./get-date-range.ts";
import labels from "./i18n/en.json";
import type { I18n } from "./i18n/types.ts";

export interface CalendarEvent {
	date: Date;
	kind: string;
	label: string;
}

//

export interface CalendarData {
	events: Array<CalendarEvent>;
	eventsByDate: Map<string, Array<CalendarEvent>>;
	startYear: number | null;
	endYear: number | null;
}

export class Calendar extends HTMLElement {
	data: CalendarData;
	currentYear: number | null;

	i18n = labels;

	picker: CalendarYearPicker | null;
	calendar: CalendarYear | null;

	constructor() {
		super();

		this.data = { events: [], eventsByDate: new Map(), startYear: null, endYear: null };
		this.currentYear = null;

		this.picker = null;
		this.calendar = null;
	}

	connectedCallback() {
		this.picker = this.querySelector<CalendarYearPicker>(ELEMENT_PICKER);
		this.calendar = this.querySelector<CalendarYear>(ELEMENT_CALENDAR_YEAR);

		assert(this.picker, "Missing picker element.");
		assert(this.calendar, "Missing calendar year element.");

		this.addEventListener(EVENT_SELECT_YEAR, (event) => {
			const selectedYear = (event as CustomEvent<{ year: number }>).detail.year;
			this.currentYear = selectedYear;

			// this.update();
			this.calendar?.setData({
				currentYear: this.currentYear,
				eventsByDate: this.data.eventsByDate,
			});
		});

		this.update();
	}

	setData(data: CalendarData) {
		const dateRange = getDateRange(data.events);
		const startYear = dateRange.min.getUTCFullYear();
		const endYear = dateRange.max.getUTCFullYear();

		this.data = {
			events: data.events,
			eventsByDate: groupByToMap(data.events, (event) => {
				return isoDate(event.date);
			}),
			startYear,
			endYear,
		};
		this.currentYear = startYear;

		this.update();
	}

	update() {
		const { startYear, endYear, eventsByDate } = this.data;
		const currentYear = this.currentYear;
		if (startYear == null || endYear == null || currentYear == null) return;

		if (this.picker == null || this.calendar == null) return;

		this.picker.setData({ startYear, endYear, currentYear });
		this.calendar.setData({ currentYear, eventsByDate });
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
}

export class CalendarYearPicker extends HTMLElement {
	data: CalendarYearPickerData | null;

	constructor() {
		super();

		this.data = null;
	}

	connectedCallback() {
		this.update();
	}

	setData(data: CalendarYearPickerData) {
		this.data = data;

		this.update();
	}

	update() {
		if (this.data == null) return;
		const { startYear, endYear, currentYear } = this.data;

		const select = document.createElement("select");

		range(startYear, endYear).forEach((year) => {
			const option = document.createElement("option");
			option.value = String(year);
			option.textContent = String(year);
			option.selected = year === currentYear;
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

export interface CalendarYearData {
	currentYear: number;
	eventsByDate: Map<string, Array<CalendarEvent>>;
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

						// td.dataset["date"] = formattedDate;

						if (eventsByDate.has(formattedDate)) {
							const events = eventsByDate.get(formattedDate)!;

							td.dataset["eventKinds"] = unique(
								events.map((event) => {
									return event.kind;
								}),
							).join(" ");

							const button = document.createElement("button");
							button.textContent = String(day);
							button.ariaLabel = formattedDate;

							button.addEventListener("click", () => {
								this.dispatchEvent(
									new CustomEvent(EVENT_CLICK_CALENDAR_EVENT, {
										detail: { date, events },
										bubbles: true,
									}),
								);
							});

							td.append(button);
						} else {
							td.textContent = String(day);
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

export function register() {
	customElements.define(ELEMENT_ROOT, Calendar);
	customElements.define(ELEMENT_PICKER, CalendarYearPicker);
	customElements.define(ELEMENT_CALENDAR_YEAR, CalendarYear);
}
