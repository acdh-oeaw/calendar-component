import {
	ELEMENT_CALENDAR_MONTH,
	ELEMENT_CALENDAR_YEAR,
	ELEMENT_ROOT,
	ELEMENT_YEAR_RADIO_GROUP,
	ELEMENT_YEAR_SELECT,
} from "./constants.ts";
import { CalendarMonth, CalendarYear } from "./elements/calendar-view.ts";
import { CalendarYearRadioGroup, CalendarYearSelect } from "./elements/calendar-year-picker.ts";
import { Calendar } from "./elements/calendar.ts";

/** Can safely be called multiple times. Does nothing on the server. */
export function register() {
	if (typeof customElements === "undefined") return;

	define(ELEMENT_ROOT, Calendar);
	define(ELEMENT_CALENDAR_MONTH, CalendarMonth);
	define(ELEMENT_CALENDAR_YEAR, CalendarYear);
	define(ELEMENT_YEAR_RADIO_GROUP, CalendarYearRadioGroup);
	define(ELEMENT_YEAR_SELECT, CalendarYearSelect);
}

function define(name: string, element: CustomElementConstructor) {
	if (customElements.get(name) == null) {
		customElements.define(name, element);
	}
}
