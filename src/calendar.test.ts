import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";

import { JSDOM } from "jsdom";

import type { Calendar, CalendarData, CalendarEvent, CalendarYear } from "./calendar.ts";
import type { I18n } from "./i18n/types.ts";

/** Custom elements extend `HTMLElement`, so globals must exist before the module is evaluated. */
const { window } = new JSDOM();
Object.assign(globalThis, {
	customElements: window.customElements,
	CustomEvent: window.CustomEvent,
	document: window.document,
	Event: window.Event,
	HTMLElement: window.HTMLElement,
});

const { CalendarYearSelect, register } = await import("./calendar.ts");
const { default: de } = await import("./i18n/de.ts");

register();

const template = `
	<acdh-ch-calendar>
		<acdh-ch-calendar-year-picker></acdh-ch-calendar-year-picker>
		<acdh-ch-calendar-year></acdh-ch-calendar-year>
	</acdh-ch-calendar>
`;

function createEvent(date: string, kind = "birthday", label = date): CalendarEvent {
	return { date: new Date(date), kind, label };
}

function render(html = template): Calendar {
	document.body.innerHTML = html;
	const calendar = document.querySelector<Calendar>("acdh-ch-calendar");
	assert(calendar);
	return calendar;
}

function getButtons(): Array<HTMLButtonElement> {
	return Array.from(document.querySelectorAll<HTMLButtonElement>("td > button"));
}

function getInputs(): Array<HTMLInputElement> {
	return Array.from(document.querySelectorAll<HTMLInputElement>("input[type='radio']"));
}

function getCheckedYear(): string | undefined {
	return getInputs().find((input) => {
		return input.checked;
	})?.value;
}

function getCaptions(): Array<string | null> {
	return Array.from(document.querySelectorAll("caption"), (caption) => {
		return caption.textContent;
	});
}

afterEach(() => {
	document.body.innerHTML = "";
});

void describe("calendar year", () => {
	void test("should render twelve months", () => {
		render().setData({ events: [createEvent("2024-09-26")] });

		assert.equal(document.querySelectorAll("table").length, 12);
		assert.equal(getCaptions()[0], "January");
		assert.equal(document.querySelectorAll("td > *").length, 366);
	});

	void test("should use provided month labels", () => {
		const calendar = render();
		calendar.setI18n(de);
		calendar.setData({ events: [createEvent("2024-09-26")] });

		assert.deepEqual(getCaptions(), (de satisfies I18n).months);
	});

	void test("should group events on the same day", () => {
		render().setData({
			events: [
				createEvent("2024-09-26", "birthday"),
				createEvent("2024-09-26", "big party"),
				createEvent("2024-09-26", "birthday"),
			],
		});

		const buttons = getButtons();
		assert.equal(buttons.length, 1);
		assert.equal(buttons[0]!.dataset["eventKinds"], "birthday big_party");
		assert.equal(buttons[0]!.dataset["eventKindsCount"], "2");
		assert.equal(buttons[0]!.dataset["eventsCount"], "3");
	});

	void test("should dispatch bubbling event with date and events on click", () => {
		const event = createEvent("2024-09-26");
		const calendar = render();
		calendar.setData({ events: [event] });

		const details: Array<{ date: Date; events: Array<CalendarEvent> }> = [];
		calendar.addEventListener("calendar-event-click", (event) => {
			details.push((event as CustomEvent<{ date: Date; events: Array<CalendarEvent> }>).detail);
		});

		getButtons()[0]!.click();

		assert.deepEqual(details, [{ date: new Date("2024-09-26"), events: [event] }]);
	});

	void test("should not submit surrounding form on click", () => {
		render(`<form>${template}</form>`).setData({ events: [createEvent("2024-09-26")] });

		let submitted = 0;
		document.querySelector("form")!.addEventListener("submit", (event) => {
			event.preventDefault();
			submitted++;
		});

		getButtons()[0]!.click();

		assert.equal(getButtons()[0]!.type, "button");
		assert.equal(submitted, 0);
	});

	for (const timezone of [
		"America/Los_Angeles",
		"America/New_York",
		"Asia/Tokyo",
		"Europe/Vienna",
		"Pacific/Kiritimati",
		"UTC",
	]) {
		void test(`should display events on correct dates independent of local timezone: ${timezone}`, (t) => {
			const original = process.env["TZ"];
			process.env["TZ"] = timezone;
			t.after(() => {
				if (original == null) {
					delete process.env["TZ"];
				} else {
					process.env["TZ"] = original;
				}
			});

			for (const year of [1680, 2024]) {
				const dates: Array<string> = [];
				for (let ms = Date.UTC(year, 0, 1); ms < Date.UTC(year + 1, 0, 1); ms += 86_400_000) {
					dates.push(new Date(ms).toISOString().slice(0, 10));
				}

				render().setData({
					events: dates.map((date) => {
						return createEvent(date);
					}),
				});

				const tables = Array.from(document.querySelectorAll("table"));
				const rendered = tables.flatMap((table, month) => {
					return Array.from(table.querySelectorAll<HTMLButtonElement>("td > button"), (button) => {
						const day = Number(button.textContent);
						const date = new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
						assert.equal(button.getAttribute("aria-label") ?? button.ariaLabel, date);
						return date;
					});
				});

				assert.deepEqual(rendered, dates);
			}
		});
	}
});

void describe("calendar", () => {
	const events = [createEvent("2021-09-26"), createEvent("2024-09-26")];

	void test("should display first year by default", () => {
		const calendar = render();
		calendar.setData({ events });

		assert.equal(calendar.currentYear, 2021);
		assert.equal(getCheckedYear(), "2021");
	});

	void test("should display provided year", () => {
		const calendar = render();
		calendar.setData({ events, currentYear: 2024 });

		assert.equal(calendar.currentYear, 2024);
		assert.equal(getCheckedYear(), "2024");
	});

	void test("should ignore provided year when out of range", () => {
		const calendar = render();
		calendar.setData({ events, currentYear: 1999 });

		assert.equal(calendar.currentYear, 2021);
	});

	void test("should display year without events", () => {
		render().setData({ events, currentYear: 2022 });

		assert.equal(document.querySelectorAll("table").length, 12);
		assert.equal(getButtons().length, 0);
	});

	void test("should keep fallback content until data is set", () => {
		const calendar = render(`
			<acdh-ch-calendar>
				<acdh-ch-calendar-year-picker>picker</acdh-ch-calendar-year-picker>
				<acdh-ch-calendar-year>year</acdh-ch-calendar-year>
			</acdh-ch-calendar>
		`);

		assert.equal(document.querySelector("acdh-ch-calendar-year")!.textContent, "year");
		assert.equal(document.querySelector("acdh-ch-calendar-year-picker")!.textContent, "picker");

		calendar.setData({ events });

		assert.doesNotMatch(document.querySelector("acdh-ch-calendar-year")!.textContent, /year/);
	});

	void test("should handle empty events", () => {
		const calendar = render();
		calendar.setData({ events: [] });

		assert.equal(calendar.currentYear, null);
		assert.equal(document.querySelectorAll("table").length, 0);
		assert.equal(getInputs().length, 0);
	});

	void test("should clear previous data when setting empty events", () => {
		const calendar = render();
		calendar.setData({ events });
		assert.equal(document.querySelectorAll("table").length, 12);

		calendar.setData({ events: [] });
		assert.equal(document.querySelectorAll("table").length, 0);
		assert.equal(getInputs().length, 0);

		calendar.setData({ events });
		assert.equal(document.querySelectorAll("table").length, 12);
		assert.equal(getInputs().length, 4);
	});

	void test("should not restore cleared data when reconnecting", () => {
		const calendar = render();
		calendar.setData({ events });
		calendar.setData({ events: [] });

		calendar.remove();
		document.body.append(calendar);

		assert.equal(document.querySelectorAll("table").length, 0);
	});

	void test("should only require events", () => {
		const calendar = render();
		const data: CalendarData = {
			events,
			eventsByDate: new Map(),
			startYear: null,
			endYear: null,
		};

		/** Derived properties are optional, and ignored. */
		calendar.setData(data);
		assert.equal(calendar.currentYear, 2021);

		assert.throws(() => {
			// @ts-expect-error Events are required.
			calendar.setData({ currentYear: 2024 });
		});
	});
});

void describe("radio group picker", () => {
	const events = [createEvent("2021-09-26"), createEvent("2024-09-26")];

	function select(value: string) {
		const input = getInputs().find((input) => {
			return input.value === value;
		});
		assert(input);
		input.checked = true;
		input.dispatchEvent(new Event("change", { bubbles: true }));
	}

	void test("should display all years in range", () => {
		render().setData({ events });

		assert.deepEqual(
			getInputs().map((input) => {
				return [input.value, input.disabled];
			}),
			[
				["2021", false],
				["2022", false],
				["2023", false],
				["2024", false],
			],
		);
	});

	void test("should disable years without events in sparse variant", () => {
		render(template.replace("year-picker>", 'year-picker data-variant="sparse">')).setData({
			events,
		});

		assert.deepEqual(
			getInputs()
				.filter((input) => {
					return input.disabled;
				})
				.map((input) => {
					return input.value;
				}),
			["2022", "2023"],
		);
	});

	void test("should display selected year", () => {
		const calendar = render();
		calendar.setData({ events });

		const years: Array<number> = [];
		calendar.addEventListener("calendar-year-select", (event) => {
			years.push((event as CustomEvent<{ year: number }>).detail.year);
		});

		select("2024");

		assert.deepEqual(years, [2024]);
		assert.equal(calendar.currentYear, 2024);
		assert.equal(getButtons()[0]!.ariaLabel, "2024-09-26");
	});

	void test("should use distinct names for multiple calendars", () => {
		document.body.innerHTML = template + template;
		document.querySelectorAll<Calendar>("acdh-ch-calendar").forEach((calendar) => {
			calendar.setData({ events });
		});

		const names = new Set(
			getInputs().map((input) => {
				return input.name;
			}),
		);
		assert.equal(names.size, 2);
	});
});

void describe("select picker", () => {
	/** Elements can only be registered once, so use a different name than the default picker. */
	customElements.define("test-calendar-year-select", CalendarYearSelect);

	const data = {
		startYear: 2021,
		endYear: 2024,
		currentYear: 2024,
		eventsByDate: new Map([
			[2021, new Map<string, Array<CalendarEvent>>()],
			[2024, new Map<string, Array<CalendarEvent>>()],
		]),
	};

	function renderPicker(html: string) {
		document.body.innerHTML = html;
		const picker = document.querySelector<InstanceType<typeof CalendarYearSelect>>(
			"test-calendar-year-select",
		);
		assert(picker);
		picker.setData(data);
		const select = picker.querySelector("select");
		assert(select);
		return { picker, select };
	}

	function getValues(select: HTMLSelectElement) {
		return Array.from(select.options, (option) => {
			return option.value;
		});
	}

	void test("should display all years in range", () => {
		const { select } = renderPicker("<test-calendar-year-select></test-calendar-year-select>");

		assert.deepEqual(getValues(select), ["2021", "2022", "2023", "2024"]);
		assert.equal(select.value, "2024");
	});

	void test("should omit years without events in sparse variant", () => {
		const { select } = renderPicker(
			'<test-calendar-year-select data-variant="sparse"></test-calendar-year-select>',
		);

		assert.deepEqual(getValues(select), ["2021", "2024"]);
	});

	void test("should dispatch bubbling event on change", () => {
		const { select } = renderPicker("<test-calendar-year-select></test-calendar-year-select>");

		const years: Array<number> = [];
		document.body.addEventListener(
			"calendar-year-select",
			(event) => {
				years.push((event as CustomEvent<{ year: number }>).detail.year);
			},
			{ once: true },
		);

		select.value = "2021";
		select.dispatchEvent(new Event("change", { bubbles: true }));

		assert.deepEqual(years, [2021]);
	});

	void test("should clear picker when data is removed", () => {
		const { picker } = renderPicker("<test-calendar-year-select></test-calendar-year-select>");

		picker.setData(null);

		assert.equal(picker.childElementCount, 0);
	});
});

void test("should clear calendar year when data is removed", () => {
	render().setData({ events: [createEvent("2024-09-26")] });
	const year = document.querySelector<CalendarYear>("acdh-ch-calendar-year");
	assert(year);

	year.setData(null);

	assert.equal(year.childElementCount, 0);
});
