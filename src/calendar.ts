import type { CalendarMonth, CalendarYear } from "./elements/calendar-view.ts";
import type {
	CalendarYearPicker,
	CalendarYearRadioGroup,
	CalendarYearSelect,
} from "./elements/calendar-year-picker.ts";
import type { Calendar } from "./elements/calendar.ts";
import type { CalendarClickEventDetail, CalendarYearEventDetail } from "./types.ts";

declare global {
	interface HTMLElementTagNameMap {
		"acdh-ch-calendar": Calendar;
		"acdh-ch-calendar-month": CalendarMonth;
		"acdh-ch-calendar-year": CalendarYear;
		"acdh-ch-calendar-year-radio-group": CalendarYearRadioGroup;
		"acdh-ch-calendar-year-select": CalendarYearSelect;
		/** @deprecated */
		"acdh-ch-calendar-year-picker": CalendarYearPicker;
	}

	interface HTMLElementEventMap {
		"calendar-event-click": CustomEvent<CalendarClickEventDetail>;
		"calendar-year-change": CustomEvent<CalendarYearEventDetail>;
		"calendar-year-select": CustomEvent<CalendarYearEventDetail>;
	}
}

export { Calendar } from "./elements/calendar.ts";
export { CalendarMonth, CalendarYear } from "./elements/calendar-view.ts";
export {
	CalendarYearPicker,
	CalendarYearRadioGroup,
	CalendarYearSelect,
} from "./elements/calendar-year-picker.ts";
export { getDateRange } from "./get-date-range.ts";
export type { I18n } from "./i18n/types.ts";
export { type CalendarRegisterOptions, register } from "./register.ts";
export type {
	CalendarClickEventDetail,
	CalendarData,
	CalendarEvent,
	CalendarInput,
	CalendarYearEventDetail,
} from "./types.ts";
