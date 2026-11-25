import { isoDate, unique } from "@acdh-oeaw/lib";

import { EVENT_CLICK_CALENDAR_EVENT } from "../constants.ts";
import { createCalendar } from "../create-calendar.ts";
import en from "../i18n/en.ts";
import type { I18n } from "../i18n/types.ts";
import type { CalendarClickEventDetail, CalendarEvent } from "../types.ts";
import { CalendarPart } from "./calendar-part.ts";
import type { Calendar } from "./calendar.ts";

abstract class CalendarView extends CalendarPart {
	#details = new Map<string, CalendarClickEventDetail>();

	constructor() {
		super();

		this.addEventListener("click", (event) => {
			const button = (event.target as Element).closest<HTMLElement>("button[data-date]");
			const detail = this.#details.get(button?.dataset["date"] ?? "");
			if (detail == null) return;

			this.dispatchEvent(
				new CustomEvent<CalendarClickEventDetail>(EVENT_CLICK_CALENDAR_EVENT, {
					bubbles: true,
					detail: { ...detail, date: new Date(detail.date) },
				}),
			);
		});
	}

	/** Display names of weekdays. */
	get weekdays(): boolean {
		return this.hasAttribute("weekdays");
	}

	set weekdays(weekdays: boolean) {
		this.toggleAttribute("weekdays", weekdays);
	}

	/** @param months Zero-based, as in `Date`. */
	protected renderMonths(calendar: Calendar, year: number, months: Array<number>) {
		const focused = this.querySelector<HTMLElement>("button[data-date]:focus")?.dataset["date"];

		const weeksByMonth = createCalendar(year);
		const eventsByDate = calendar.getEvents(year);

		this.#details = new Map();

		this.replaceChildren(
			...months.map((month) => {
				const table = document.createElement("table");

				const caption = document.createElement("caption");
				caption.textContent = calendar.i18n.months[month] ?? "";
				table.append(caption);

				if (this.weekdays) {
					table.append(createWeekdays(calendar.i18n.weekdays ?? en.weekdays));
				}

				weeksByMonth[month]?.forEach((week) => {
					const tr = document.createElement("tr");

					week.forEach((day) => {
						const td = document.createElement("td");

						if (day != null) {
							const date = new Date(Date.UTC(year, month, day));
							const key = isoDate(date);
							const events = eventsByDate?.get(key);

							if (events != null) {
								this.#details.set(key, { date, events });
								td.append(createButton(day, key, events, calendar.i18n));
							} else {
								td.append(createDay(day));
							}
						}

						tr.append(td);
					});

					table.append(tr);
				});

				return table;
			}),
		);

		if (focused != null) {
			this.querySelector<HTMLElement>(`button[data-date="${focused}"]`)?.focus();
		}
	}
}

const months = Array.from({ length: 12 }, (_, month) => {
	return month;
});

export class CalendarYear extends CalendarView {
	static readonly observedAttributes = ["weekdays"];

	protected override render(calendar: Calendar, year: number) {
		this.renderMonths(calendar, year, months);
	}
}

export class CalendarMonth extends CalendarView {
	static readonly observedAttributes = ["month", "weekdays"];

	/** Month of the year, from 1 to 12. */
	get month(): number {
		const month = Number(this.getAttribute("month"));

		return Number.isInteger(month) && month >= 1 && month <= 12 ? month : 1;
	}

	set month(month: number) {
		this.setAttribute("month", String(month));
	}

	protected override render(calendar: Calendar, year: number) {
		this.renderMonths(calendar, year, [this.month - 1]);
	}
}

function createWeekdays(weekdays: Array<string>): HTMLElement {
	const thead = document.createElement("thead");
	const tr = document.createElement("tr");

	weekdays.forEach((weekday) => {
		const th = document.createElement("th");
		th.scope = "col";
		th.textContent = weekday;
		tr.append(th);
	});

	thead.append(tr);

	return thead;
}

function createDay(day: number): HTMLElement {
	const div = document.createElement("div");
	div.textContent = String(day);

	return div;
}

function createButton(
	day: number,
	date: string,
	events: Array<CalendarEvent>,
	i18n: I18n,
): HTMLElement {
	const kinds = unique(
		events.map((event) => {
			return event.kind.replace(/\s+/g, "_");
		}),
	);

	const button = document.createElement("button");
	button.type = "button";
	button.ariaLabel = createLabel(date, events.length, i18n);
	button.textContent = String(day);

	button.dataset["date"] = date;
	button.dataset["eventKinds"] = kinds.join(" ");
	button.dataset["eventKindsCount"] = String(kinds.length);
	button.dataset["eventsCount"] = String(events.length);

	return button;
}

function createLabel(date: string, count: number, i18n: I18n): string {
	const unit = count === 1 ? i18n.event : i18n.events;

	return unit != null ? `${date}, ${String(count)} ${unit}` : `${date} (${String(count)})`;
}
