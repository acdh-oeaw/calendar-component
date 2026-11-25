import assert from "node:assert/strict";
import { test } from "node:test";

import { getDateRange } from "./get-date-range.ts";

void test("should return earliest and latest date of unsorted values", () => {
	const range = getDateRange([
		{ date: new Date("1701-04-16") },
		{ date: new Date("1677-01-25") },
		{ date: new Date("1716-12-31") },
	]);

	assert.equal(range.min.toISOString(), "1677-01-25T00:00:00.000Z");
	assert.equal(range.max.toISOString(), "1716-12-31T00:00:00.000Z");
});

void test("should return same date for single value", () => {
	const range = getDateRange([{ date: new Date("1701-04-16") }]);

	assert.deepEqual(range.min, range.max);
});
