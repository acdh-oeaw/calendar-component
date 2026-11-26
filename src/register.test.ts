import assert from "node:assert/strict";
import { test } from "node:test";

import type { CalendarEvent } from "./calendar.ts";
import { setupDom } from "./testing/setup-dom.ts";

setupDom();

const { CalendarYear, register } = await import("./calendar.ts");

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
			<acdh-calendar-year>Loading</acdh-calendar-year>
		</acdh-calendar>
	`;

	const calendar = document.querySelector("acdh-calendar")!;

	/** Properties are set before the calendar is registered. */
	calendar.events = events;
	calendar.year = 2024;
	calendar.i18n = { months: ["Jänner"] };

	/** Parts are registered before the calendar. */
	customElements.define("acdh-calendar-year", CalendarYear);

	assert.equal(document.querySelector("acdh-calendar-year")!.textContent, "Loading");

	register();
	await Promise.resolve();
	await Promise.resolve();

	assert.equal(calendar.year, 2024);
	assert.equal(Object.hasOwn(calendar, "events"), false);
	assert.equal(calendar.querySelectorAll("table").length, 12);
	assert.equal(document.querySelector("caption")!.textContent, "Jänner");

	assert.equal(document.querySelector("select")!.value, "2024");
	assert.equal(document.querySelectorAll("input").length, 4);

	assert.doesNotThrow(() => {
		register();
		register();
	});
});
