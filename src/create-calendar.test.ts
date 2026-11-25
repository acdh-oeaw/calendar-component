import assert from "node:assert/strict";
import { test } from "node:test";

import { createCalendar } from "./create-calendar.ts";

void test("should create calendar", () => {
	const calendar = createCalendar(2024);

	assert.deepEqual(calendar, [
		[
			[1, 2, 3, 4, 5, 6, 7],
			[8, 9, 10, 11, 12, 13, 14],
			[15, 16, 17, 18, 19, 20, 21],
			[22, 23, 24, 25, 26, 27, 28],
			[29, 30, 31, null, null, null, null],
		],
		[
			[null, null, null, 1, 2, 3, 4],
			[5, 6, 7, 8, 9, 10, 11],
			[12, 13, 14, 15, 16, 17, 18],
			[19, 20, 21, 22, 23, 24, 25],
			[26, 27, 28, 29, null, null, null],
		],
		[
			[null, null, null, null, 1, 2, 3],
			[4, 5, 6, 7, 8, 9, 10],
			[11, 12, 13, 14, 15, 16, 17],
			[18, 19, 20, 21, 22, 23, 24],
			[25, 26, 27, 28, 29, 30, 31],
		],
		[
			[1, 2, 3, 4, 5, 6, 7],
			[8, 9, 10, 11, 12, 13, 14],
			[15, 16, 17, 18, 19, 20, 21],
			[22, 23, 24, 25, 26, 27, 28],
			[29, 30, null, null, null, null, null],
		],
		[
			[null, null, 1, 2, 3, 4, 5],
			[6, 7, 8, 9, 10, 11, 12],
			[13, 14, 15, 16, 17, 18, 19],
			[20, 21, 22, 23, 24, 25, 26],
			[27, 28, 29, 30, 31, null, null],
		],
		[
			[null, null, null, null, null, 1, 2],
			[3, 4, 5, 6, 7, 8, 9],
			[10, 11, 12, 13, 14, 15, 16],
			[17, 18, 19, 20, 21, 22, 23],
			[24, 25, 26, 27, 28, 29, 30],
		],
		[
			[1, 2, 3, 4, 5, 6, 7],
			[8, 9, 10, 11, 12, 13, 14],
			[15, 16, 17, 18, 19, 20, 21],
			[22, 23, 24, 25, 26, 27, 28],
			[29, 30, 31, null, null, null, null],
		],
		[
			[null, null, null, 1, 2, 3, 4],
			[5, 6, 7, 8, 9, 10, 11],
			[12, 13, 14, 15, 16, 17, 18],
			[19, 20, 21, 22, 23, 24, 25],
			[26, 27, 28, 29, 30, 31, null],
		],
		[
			[null, null, null, null, null, null, 1],
			[2, 3, 4, 5, 6, 7, 8],
			[9, 10, 11, 12, 13, 14, 15],
			[16, 17, 18, 19, 20, 21, 22],
			[23, 24, 25, 26, 27, 28, 29],
			[30, null, null, null, null, null, null],
		],
		[
			[null, 1, 2, 3, 4, 5, 6],
			[7, 8, 9, 10, 11, 12, 13],
			[14, 15, 16, 17, 18, 19, 20],
			[21, 22, 23, 24, 25, 26, 27],
			[28, 29, 30, 31, null, null, null],
		],
		[
			[null, null, null, null, 1, 2, 3],
			[4, 5, 6, 7, 8, 9, 10],
			[11, 12, 13, 14, 15, 16, 17],
			[18, 19, 20, 21, 22, 23, 24],
			[25, 26, 27, 28, 29, 30, null],
		],
		[
			[null, null, null, null, null, null, 1],
			[2, 3, 4, 5, 6, 7, 8],
			[9, 10, 11, 12, 13, 14, 15],
			[16, 17, 18, 19, 20, 21, 22],
			[23, 24, 25, 26, 27, 28, 29],
			[30, 31, null, null, null, null, null],
		],
	]);
});

const timezones = [
	"America/Los_Angeles",
	"America/New_York",
	"America/Sao_Paulo",
	"Asia/Tokyo",
	"Europe/Vienna",
	"Pacific/Kiritimati",
	"UTC",
];

const years = [1680, 1701, 1900, 2000, 2023, 2024];

for (const timezone of timezones) {
	void test(`should create calendar independent of local timezone: ${timezone}`, (t) => {
		const original = process.env["TZ"];
		process.env["TZ"] = timezone;
		t.after(() => {
			if (original == null) {
				delete process.env["TZ"];
			} else {
				process.env["TZ"] = original;
			}
		});

		/** Ensure changing the timezone has an effect. */
		assert.equal(Intl.DateTimeFormat().resolvedOptions().timeZone, timezone);

		for (const year of years) {
			const calendar = createCalendar(year);

			assert.equal(calendar.length, 12);

			calendar.forEach((weeks, month) => {
				const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
				const days = weeks.flat().filter((day) => {
					return day != null;
				});

				assert.deepEqual(
					days,
					Array.from({ length: daysInMonth }, (_, index) => {
						return index + 1;
					}),
				);

				weeks.forEach((week) => {
					assert.equal(week.length, 7);

					week.forEach((day, index) => {
						if (day == null) return;
						/** Weeks start on monday. */
						const weekDay = (new Date(Date.UTC(year, month, day)).getUTCDay() + 6) % 7;
						assert.equal(weekDay, index);
					});
				});
			});
		}
	});
}
