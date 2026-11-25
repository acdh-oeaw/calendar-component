export const ELEMENT_ROOT = "acdh-ch-calendar";
export const ELEMENT_CALENDAR_MONTH = "acdh-ch-calendar-month";
export const ELEMENT_CALENDAR_YEAR = "acdh-ch-calendar-year";
export const ELEMENT_YEAR_RADIO_GROUP = "acdh-ch-calendar-year-radio-group";
export const ELEMENT_YEAR_SELECT = "acdh-ch-calendar-year-select";
/** @deprecated Use `ELEMENT_YEAR_RADIO_GROUP` or `ELEMENT_YEAR_SELECT`. */
export const ELEMENT_PICKER = "acdh-ch-calendar-year-picker";

/** Dispatched by year pickers to request a different year. */
export const EVENT_SELECT_YEAR = "calendar-year-select";
/** Dispatched by the calendar after a different year has been selected by a user. */
export const EVENT_CHANGE_YEAR = "calendar-year-change";
export const EVENT_CLICK_CALENDAR_EVENT = "calendar-event-click";
