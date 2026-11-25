export interface CalendarEvent {
	date: Date;
	kind: string;
	label: string;
}

export interface CalendarYearEventDetail {
	year: number;
}

export interface CalendarClickEventDetail {
	date: Date;
	events: Array<CalendarEvent>;
}

/** @deprecated Set the `events` property instead. */
export interface CalendarData {
	events: Array<CalendarEvent>;
	eventsByDate: Map<number, Map<string, Array<CalendarEvent>>>;
	startYear: number | null;
	endYear: number | null;
}

/**
 * Only `events` and `currentYear` are used, everything else is derived from `events`.
 *
 * @deprecated Set the `events` and `year` properties instead.
 */
export interface CalendarInput
	extends Pick<CalendarData, "events">, Partial<Omit<CalendarData, "events">> {
	currentYear?: number;
}
