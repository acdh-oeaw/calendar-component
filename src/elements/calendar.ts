import { isoDate, range } from "@acdh-oeaw/lib";

import { EVENT_CHANGE_YEAR, EVENT_SELECT_YEAR, SELECTOR_ROOT } from "../constants.ts";
import { getDateRange } from "../get-date-range.ts";
import en from "../i18n/en.ts";
import type { I18n } from "../i18n/types.ts";
import type { CalendarEvent, CalendarInput, CalendarYearEventDetail } from "../types.ts";
import { HTMLElementBase } from "./html-element.ts";

type EventsByDate = Map<string, Array<CalendarEvent>>;

/**
 * Holds the state. Elements nested anywhere inside the calendar subscribe to changes, so they can be
 * added, moved, and removed at any time.
 */
export class Calendar extends HTMLElementBase {
	static readonly observedAttributes = ["year"];

	#events: Array<CalendarEvent> = [];
	#eventsByYear = new Map<number, EventsByDate>();
	#i18n: I18n = en;
	#isUpdateScheduled = false;
	#requestedYear: number | null = null;
	#subscribers = new Set<() => void>();
	#years: Array<number> = [];

	constructor() {
		super();

		this.addEventListener(EVENT_SELECT_YEAR, (event) => {
			/** Ignore events from nested calendars. */
			if ((event.target as Element).closest(SELECTOR_ROOT) !== this) return;

			this.#selectYear(event.detail.year);
		});

		/** Properties can be set before the element is registered. */
		this.#upgradeProperty("events");
		this.#upgradeProperty("i18n");
		this.#upgradeProperty("year");
	}

	attributeChangedCallback(_name: string, _oldValue: string | null, newValue: string | null) {
		const year = newValue == null || newValue.trim() === "" ? Number.NaN : Number(newValue);

		this.year = Number.isInteger(year) ? year : null;
	}

	get events(): Array<CalendarEvent> {
		return this.#events;
	}

	set events(events: Array<CalendarEvent>) {
		this.#events = events;
		this.#eventsByYear = new Map();

		for (const event of events) {
			const year = event.date.getUTCFullYear();
			const date = isoDate(event.date);

			let eventsByDate = this.#eventsByYear.get(year);
			if (eventsByDate == null) {
				eventsByDate = new Map();
				this.#eventsByYear.set(year, eventsByDate);
			}

			const eventsOnDate = eventsByDate.get(date);
			if (eventsOnDate == null) {
				eventsByDate.set(date, [event]);
			} else {
				eventsOnDate.push(event);
			}
		}

		const { min, max } = getDateRange(events);
		const startYear = min.getUTCFullYear();
		const endYear = max.getUTCFullYear();

		this.#years = Number.isNaN(startYear) ? [] : range(startYear, endYear);

		this.#scheduleUpdate();
	}

	get i18n(): I18n {
		return this.#i18n;
	}

	set i18n(i18n: I18n) {
		this.#i18n = i18n;

		this.#scheduleUpdate();
	}

	/**
	 * Currently displayed year. Defaults to the first year when no year has been set, or when it is
	 * not in the range of the events. Always `null` when there are no events.
	 */
	get year(): number | null {
		if (this.#requestedYear != null && this.#years.includes(this.#requestedYear)) {
			return this.#requestedYear;
		}

		return this.#years[0] ?? null;
	}

	set year(year: number | null) {
		if (year === this.#requestedYear) return;

		this.#requestedYear = year;

		this.#scheduleUpdate();
	}

	/** All years in the range of the events, including years without events. */
	get years(): Array<number> {
		return this.#years;
	}

	getEvents(year: number): ReadonlyMap<string, Array<CalendarEvent>> | null {
		return this.#eventsByYear.get(year) ?? null;
	}

	/** Calls back immediately, and whenever the calendar changes, until the signal is aborted. */
	subscribe(callback: () => void, signal: AbortSignal) {
		if (signal.aborted) return;

		/** Ensure the same callback can be subscribed multiple times. */
		const subscriber = () => {
			callback();
		};

		this.#subscribers.add(subscriber);
		signal.addEventListener(
			"abort",
			() => {
				this.#subscribers.delete(subscriber);
			},
			{ once: true },
		);

		subscriber();
	}

	/** @deprecated Use the `year` property instead. */
	get currentYear(): number | null {
		return this.year;
	}

	set currentYear(year: number | null) {
		this.year = year;
	}

	/** @deprecated Set the `events` and `year` properties instead. */
	setData(data: CalendarInput) {
		this.events = data.events;
		this.year = data.currentYear ?? null;

		this.#update();
	}

	/** @deprecated Set the `i18n` property instead. */
	setI18n(i18n: I18n) {
		this.i18n = i18n;

		this.#update();
	}

	#selectYear(year: number) {
		if (year === this.year) return;

		this.year = year;
		this.#update();

		this.dispatchEvent(
			new CustomEvent<CalendarYearEventDetail>(EVENT_CHANGE_YEAR, {
				bubbles: true,
				detail: { year },
			}),
		);
	}

	/** Batches updates, when multiple properties are set. */
	#scheduleUpdate() {
		if (this.#isUpdateScheduled) return;

		this.#isUpdateScheduled = true;

		queueMicrotask(() => {
			if (this.#isUpdateScheduled) this.#update();
		});
	}

	#update() {
		this.#isUpdateScheduled = false;

		for (const subscriber of Array.from(this.#subscribers)) {
			/** Could have been removed by a previous subscriber. */
			if (this.#subscribers.has(subscriber)) subscriber();
		}
	}

	#upgradeProperty<TKey extends "events" | "i18n" | "year">(key: TKey) {
		if (!Object.hasOwn(this, key)) return;

		const value = this[key];
		delete (this as Partial<Pick<this, TKey>>)[key];
		(this as Pick<Calendar, TKey>)[key] = value;
	}
}
