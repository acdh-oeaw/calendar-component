import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";

import type { CalendarEvent } from "./calendar.ts";
import { setupDom } from "./testing/setup-dom.ts";

setupDom();

const { register } = await import("./calendar.ts");
const { default: de } = await import("./i18n/de.ts");

register();

function createEvent(date: string): CalendarEvent {
	return { date: new Date(date), kind: "birthday", label: date };
}

const events = [createEvent("2021-09-26"), createEvent("2024-09-26")];

function render(html: string) {
	document.body.innerHTML = html;
	const calendar = document.querySelector("acdh-calendar");
	assert(calendar);
	return calendar;
}

function count(selector: string) {
	return document.querySelectorAll(selector).length;
}

function getCheckedYear() {
	return Array.from(document.querySelectorAll<HTMLInputElement>("input")).find((input) => {
		return input.checked;
	})?.value;
}

function getOptions() {
	return Array.from(document.querySelectorAll("option"), (option) => {
		return option.value;
	});
}

function selectRadio(year: number) {
	const input = document.querySelector<HTMLInputElement>(`input[value="${String(year)}"]`);
	assert(input);
	input.checked = true;
	input.dispatchEvent(new Event("change", { bubbles: true }));
}

/** Updates are batched in a microtask. */
async function update() {
	await Promise.resolve();
}

afterEach(() => {
	document.body.innerHTML = "";
});

const radioGroup = "<acdh-calendar-year-radio-group></acdh-calendar-year-radio-group>";
const select = "<acdh-calendar-year-select></acdh-calendar-year-select>";
const year = "<acdh-calendar-year></acdh-calendar-year>";

function calendar(...children: Array<string>) {
	return `<acdh-calendar>${children.join("")}</acdh-calendar>`;
}

void describe("composition", () => {
	void test("should not require a picker", async () => {
		render(calendar(year)).events = events;
		await update();

		assert.equal(count("table"), 12);
	});

	void test("should not require a view", async () => {
		render(calendar(radioGroup)).events = events;
		await update();

		assert.equal(count("input"), 4);
	});

	void test("should support multiple views", async () => {
		render(calendar(radioGroup, year, year)).events = events;
		await update();

		assert.equal(count("table"), 24);
	});

	void test("should support parts nested in other elements", async () => {
		render(
			calendar(`<fieldset><legend>Year</legend><div>${radioGroup}</div></fieldset>`, year),
		).events = events;
		await update();

		assert.equal(count("input"), 4);
		assert.equal(count("table"), 12);
	});

	void test("should keep multiple pickers in sync", async () => {
		const element = render(calendar(radioGroup, select, year));
		element.events = events;
		await update();

		selectRadio(2024);

		assert.equal(document.querySelector("select")!.value, "2024");

		const selectElement = document.querySelector("select")!;
		selectElement.value = "2021";
		selectElement.dispatchEvent(new Event("change", { bubbles: true }));

		assert.equal(getCheckedYear(), "2021");
		assert.equal(element.year, 2021);
	});

	void test("should support adding parts after the calendar has been connected", () => {
		const element = document.createElement("acdh-calendar");
		document.body.append(element);
		element.setData({ events });
		element.append(document.createElement("acdh-calendar-year-radio-group"));
		element.append(document.createElement("acdh-calendar-year"));

		assert.equal(count("input"), 4);
		assert.equal(count("table"), 12);
	});

	void test("should support replacing parts", () => {
		render(calendar(radioGroup, year)).setData({ events });

		document
			.querySelector("acdh-calendar-year-radio-group")!
			.replaceWith(document.createElement("acdh-calendar-year-select"));

		assert.deepEqual(getOptions(), ["2021", "2022", "2023", "2024"]);
	});

	void test("should support moving parts to a different calendar", () => {
		document.body.innerHTML = calendar(year) + calendar();
		const [first, second] = document.querySelectorAll("acdh-calendar");
		first!.setData({ events: [createEvent("2021-01-01")] });
		second!.setData({ events: [createEvent("2024-02-02")] });

		second!.append(first!.firstElementChild!);
		assert.equal(document.querySelector("button")!.dataset["date"], "2024-02-02");

		first!.setData({ events: [createEvent("2022-03-03")] });
		assert.equal(document.querySelector("button")!.dataset["date"], "2024-02-02");
	});

	void test("should not update removed parts", () => {
		const element = render(calendar(year));
		element.setData({ events });

		const part = element.firstElementChild!;
		part.remove();
		element.setData({ events: [createEvent("1999-01-01")] });

		assert.equal(part.querySelector("button")!.dataset["date"], "2021-09-26");
	});

	void test("should only update once after moving the calendar", async () => {
		const element = render(calendar(radioGroup, year));
		element.setData({ events });

		for (let i = 0; i < 3; i++) {
			element.remove();
			document.body.append(element);
		}

		const changes: Array<number> = [];
		element.addEventListener("calendar-year-change", (event) => {
			changes.push(event.detail.year);
		});

		let updates = 0;
		const controller = new AbortController();
		element.subscribe(() => {
			updates++;
		}, controller.signal);
		updates = 0;

		selectRadio(2024);
		await update();

		assert.deepEqual(changes, [2024]);
		assert.equal(updates, 1);

		controller.abort();
		selectRadio(2021);
		assert.equal(updates, 1);
	});

	void test("should support mixing deprecated and current element names", () => {
		document.body.innerHTML = `
			<acdh-ch-calendar>${radioGroup}${year}</acdh-ch-calendar>
			${calendar("<acdh-ch-calendar-year></acdh-ch-calendar-year>")}
		`;
		document.querySelector("acdh-ch-calendar")!.setData({ events });
		document.querySelector("acdh-calendar")!.setData({ events });

		assert.equal(count("acdh-ch-calendar acdh-calendar-year table"), 12);
		assert.equal(count("acdh-calendar acdh-ch-calendar-year table"), 12);

		selectRadio(2024);

		assert.equal(document.querySelector("acdh-ch-calendar")!.year, 2024);
		assert.equal(document.querySelector("acdh-calendar")!.year, 2021);
	});

	void test("should isolate calendars nested in deprecated calendars", () => {
		document.body.innerHTML = `<acdh-ch-calendar>${calendar(radioGroup)}</acdh-ch-calendar>`;
		const outer = document.querySelector("acdh-ch-calendar")!;
		const inner = document.querySelector("acdh-calendar")!;
		outer.setData({ events });
		inner.setData({ events });

		selectRadio(2024);

		assert.equal(inner.year, 2024);
		assert.equal(outer.year, 2021);
	});

	void test("should ignore parts outside of a calendar", () => {
		document.body.innerHTML = year + radioGroup;

		assert.equal(count("table"), 0);
	});

	void test("should isolate nested calendars", () => {
		document.body.innerHTML = calendar(year, calendar(radioGroup));
		const [outer, inner] = document.querySelectorAll("acdh-calendar");
		outer!.setData({ events });
		inner!.setData({ events });

		selectRadio(2024);

		assert.equal(inner!.year, 2024);
		assert.equal(outer!.year, 2021);
	});

	void test("should support custom pickers", () => {
		const element = render(calendar("<button id='custom'></button>", year));
		element.setData({ events });

		document
			.querySelector("#custom")!
			.dispatchEvent(
				new CustomEvent("calendar-year-select", { bubbles: true, detail: { year: 2024 } }),
			);

		assert.equal(element.year, 2024);
		assert.equal(document.querySelector("td button")!.getAttribute("data-date"), "2024-09-26");
	});
});

void describe("properties", () => {
	void test("should batch updates", async () => {
		const element = render(calendar(year));
		let updates = -1;
		element.subscribe(() => {
			updates++;
		}, new AbortController().signal);

		element.events = events;
		element.year = 2024;
		element.i18n = de;

		assert.equal(updates, 0);
		await update();
		assert.equal(updates, 1);
		assert.equal(document.querySelector("caption")!.textContent, "Jänner");
	});

	void test("should set year via attribute", async () => {
		const element = render('<acdh-calendar year="2024">' + radioGroup + "</acdh-calendar>");
		element.events = events;
		await update();
		assert.equal(getCheckedYear(), "2024");

		element.setAttribute("year", "2022");
		await update();
		assert.equal(getCheckedYear(), "2022");

		for (const value of ["", "abc", "1999", "2022.5"]) {
			element.setAttribute("year", value);
			await update();
			assert.equal(getCheckedYear(), "2021");
		}
	});

	void test("should update when setting year", async () => {
		const element = render(calendar(radioGroup, year));
		element.events = events;
		await update();

		let changes = 0;
		element.addEventListener("calendar-year-change", () => {
			changes++;
		});

		element.year = 2024;
		await update();

		assert.equal(getCheckedYear(), "2024");
		assert.equal(count("td button"), 1);
		/** Only dispatched for changes by users, same as native form elements. */
		assert.equal(changes, 0);
	});

	void test("should keep selected year when events are refreshed", async () => {
		const element = render(calendar(radioGroup));
		element.events = events;
		await update();
		selectRadio(2024);

		element.events = [...events];
		await update();

		assert.equal(getCheckedYear(), "2024");
	});

	void test("should update when setting i18n after events", () => {
		const element = render(calendar(year));
		element.setData({ events });
		element.setI18n(de);

		assert.equal(document.querySelector("caption")!.textContent, "Jänner");
	});

	void test("should keep focus when events are refreshed", async () => {
		const element = render(calendar(radioGroup, year));
		element.events = events;
		await update();

		const input = document.querySelector("input")!;
		input.focus();
		element.events = [...events];
		await update();
		assert.equal(document.activeElement, input);

		document.querySelector<HTMLElement>("td button")!.focus();
		element.events = [...events];
		await update();
		assert.equal((document.activeElement as HTMLElement).dataset["date"], "2021-09-26");
	});

	void test("should clear rendered content, but keep fallback content", async () => {
		const element = render(calendar("<acdh-calendar-year>Loading</acdh-calendar-year>"));
		element.events = [];
		await update();
		assert.equal(element.textContent, "Loading");

		element.events = events;
		await update();
		assert.equal(count("table"), 12);

		element.events = [];
		await update();
		assert.equal(element.textContent, "");
		assert.equal(element.year, null);
	});

	void test("should keep requested year until events are set", async () => {
		const element = render(calendar(year));
		element.year = 2024;
		assert.equal(element.year, null);

		element.events = events;
		await update();
		assert.equal(element.year, 2024);
	});

	void test("should handle dates before year 1000", async () => {
		const element = render(calendar(year));
		element.events = [createEvent("0980-03-01")];
		await update();

		const details: Array<string> = [];
		element.addEventListener("calendar-event-click", (event) => {
			details.push(event.detail.date.toISOString());
		});
		document.querySelector<HTMLElement>("td button")!.click();

		assert.deepEqual(details, ["0980-03-01T00:00:00.000Z"]);
	});
});

void describe("year pickers", () => {
	for (const attribute of ["sparse", 'data-variant="sparse"']) {
		void test(`should support ${attribute}`, () => {
			const element = render(
				calendar(radioGroup, select).replaceAll(/(radio-group|select)>(?=<)/g, `$1 ${attribute}>`),
			);
			element.setData({ events });

			assert.equal(count("input:disabled"), 2);
			assert.deepEqual(getOptions(), ["2021", "2024"]);
		});
	}

	void test("should update when toggling sparse", () => {
		const element = render(calendar(radioGroup));
		element.setData({ events });
		const picker = document.querySelector("acdh-calendar-year-radio-group")!;

		picker.sparse = true;
		assert.equal(count("input:disabled"), 2);

		picker.sparse = false;
		assert.equal(count("input:disabled"), 0);

		picker.dataset["variant"] = "sparse";
		assert.equal(picker.sparse, true);
		picker.sparse = false;
		assert.equal(picker.sparse, false);
	});

	void test("should include current year without events in sparse select", () => {
		const element = render(
			calendar("<acdh-calendar-year-select sparse></acdh-calendar-year-select>"),
		);
		element.setData({ events, currentYear: 2022 });

		assert.deepEqual(getOptions(), ["2021", "2022", "2024"]);
		assert.equal(document.querySelector("select")!.value, "2022");
	});

	void test("should select initial year", () => {
		render(calendar(select)).setData({ events, currentYear: 2024 });

		assert.equal(document.querySelector("select")!.value, "2024");
	});

	void test("should keep provided id", () => {
		render(calendar(radioGroup.replace("group>", 'group id="years">'))).setData({ events });

		assert.equal(document.querySelector("acdh-calendar-year-radio-group")!.id, "years");
	});

	void test("should use distinct names", () => {
		render(calendar(radioGroup, radioGroup)).setData({ events });

		const names = Array.from(document.querySelectorAll("input"), (input) => {
			return input.name;
		});
		assert.equal(new Set(names).size, 2);
	});
});

void describe("views", () => {
	void test("should display single month", () => {
		const element = render(calendar('<acdh-calendar-month month="9"></acdh-calendar-month>'));
		element.setData({ events });

		assert.equal(count("table"), 1);
		assert.equal(document.querySelector("caption")!.textContent, "September");
		assert.equal(count("td button"), 1);

		document.querySelector("acdh-calendar-month")!.month = 2;
		assert.equal(document.querySelector("caption")!.textContent, "February");
		assert.equal(count("td > *"), 28);
	});

	void test("should optionally display weekdays", () => {
		const element = render(calendar(year));
		element.setData({ events });
		assert.equal(count("th"), 0);

		element.setI18n(de);
		document.querySelector("acdh-calendar-year")!.weekdays = true;

		assert.equal(count("thead"), 12);
		assert.equal(document.querySelector("th")!.textContent, "Mo");
		assert.equal(count("th[scope='col']"), 84);
	});

	void test("should describe events to assistive technology", () => {
		const element = render(calendar(year));
		const date = createEvent("2024-09-26");

		function getLabel() {
			return document.querySelector("td button")!.getAttribute("aria-label");
		}

		element.setData({ events: [date] });
		assert.equal(getLabel(), "2024-09-26, 1 event");

		element.setData({ events: [date, date] });
		assert.equal(getLabel(), "2024-09-26, 2 events");

		element.setI18n(de);
		assert.equal(getLabel(), "2024-09-26, 2 Ereignisse");

		/** Only month labels are required. */
		element.setI18n({ months: de.months });
		assert.equal(getLabel(), "2024-09-26 (2)");
	});

	void test("should keep rows as direct children of tables", () => {
		render(calendar(year)).setData({ events });

		assert.equal(count("tbody"), 0);
		assert.equal(count("table > tr > td > button"), 1);
	});
});
