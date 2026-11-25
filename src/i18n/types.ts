export interface I18n {
	months: Array<string>;
	/** Weeks start on monday. */
	weekdays?: Array<string>;
	/** Used to describe the number of events on a day to assistive technology. */
	event?: string;
	events?: string;
}
