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
