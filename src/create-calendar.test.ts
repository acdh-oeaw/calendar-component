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
