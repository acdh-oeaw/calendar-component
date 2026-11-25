import assert from "node:assert/strict";
import { test } from "node:test";

import type { CalendarEvent } from "./calendar.ts";
import { setupDom } from "./testing/setup-dom.ts";

setupDom();

const { CalendarYear, CalendarYearRadioGroup, CalendarYearSelect, register } =
	await import("./calendar.ts");

const events: Array<CalendarEvent> = [
	{ date: new Date("2021-09-26"), kind: "birthday", label: "" },
	{ date: new Date("2024-09-26"), kind: "birthday", label: "" },
];

/** Elements can only be registered once, so registration is tested in a single sequence. */
void test("should register elements in any order", async () => {
	document.body.innerHTML = `
		<acdh-calendar>
			<acdh-calendar-year-radio-group></acdh-calendar-year-radio-group>
			<acdh-calendar-year-select></acdh-calendar-year-select>
			<acdh-ch-calendar-year-picker></acdh-ch-calendar-year-picker>
			<acdh-calendar-year>Loading</acdh-calendar-year>
		</acdh-calendar>
		<acdh-ch-calendar>
			<acdh-ch-calendar-year></acdh-ch-calendar-year>
		</acdh-ch-calendar>
	`;

	const calendar = document.querySelector("acdh-calendar")!;

	/** Properties are set before the calendar is registered. */
	calendar.events = events;
	calendar.year = 2024;
	calendar.i18n = { months: ["Jänner"] };

	const deprecated = document.querySelector("acdh-ch-calendar")!;
	deprecated.events = events;

	/** Parts are registered before the calendar. */
	customElements.define("acdh-calendar-year", CalendarYear);

	assert.equal(document.querySelector("acdh-calendar-year")!.textContent, "Loading");

	register({ picker: "select" });
	await Promise.resolve();
	await Promise.resolve();

	assert.equal(calendar.year, 2024);
	assert.equal(Object.hasOwn(calendar, "events"), false);
	assert.equal(calendar.querySelectorAll("table").length, 12);
	assert.equal(deprecated.querySelectorAll("table").length, 12);
	assert.equal(document.querySelector("caption")!.textContent, "Jänner");

	const picker = document.querySelector("acdh-ch-calendar-year-picker")!;
	assert(picker instanceof CalendarYearSelect);
	assert(!(picker instanceof CalendarYearRadioGroup));
	assert.equal(picker.querySelector("select")!.value, "2024");

	assert.doesNotThrow(() => {
		register();
		register({ picker: "radio-group" });
	});
});
