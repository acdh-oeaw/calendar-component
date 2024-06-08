export function getDateRange(values: Array<{ date: Date }>): { min: Date; max: Date } {
	let min = Infinity;
	let max = -Infinity;

	for (const value of values) {
		const ms = value.date.getTime();
		if (ms < min) min = ms;
		if (ms > max) max = ms;
	}

	return { min: new Date(min), max: new Date(max) };
}
