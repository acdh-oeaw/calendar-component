import type { Calendar } from "../elements/calendar.ts";

type Properties = Partial<Pick<Calendar, "events" | "i18n" | "year">>;

/** Updates are batched in a microtask. */
export async function setProperties(calendar: Calendar, properties: Properties) {
	Object.assign(calendar, properties);
	await Promise.resolve();
}
