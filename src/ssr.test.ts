import assert from "node:assert/strict";
import { test } from "node:test";

void test("should be safe to import and register on the server", async () => {
	assert.equal(typeof HTMLElement, "undefined");

	const { register } = await import("./calendar.ts");

	assert.doesNotThrow(() => {
		register();
	});
});
