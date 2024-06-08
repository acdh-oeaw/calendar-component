export function createCalendar(year: number): Array<Array<Array<number | null>>> {
	const months: Array<Array<Array<number | null>>> = [];

	for (let month = 0; month <= 11; month++) {
		const weeks: Array<Array<number | null>> = [];

		const date = new Date(Date.UTC(year, month + 1, 0));
		const days = date.getDate();

		date.setMonth(month);

		let week: Array<number | null> = [];

		for (let day = 1; day <= days; day++) {
			date.setDate(day);

			const weekDay = date.getDay();

			if (weekDay === /** monday */ 1) {
				if (week.length > 0) {
					if (week.length < 7) {
						week = [...Array<null>(7 - week.length).fill(null), ...week];
					}

					weeks.push(week);
				}

				week = [];
			}

			week.push(day);
		}

		if (week.length > 0) {
			if (week.length < 7) {
				week = [...week, ...Array<null>(7 - week.length).fill(null)];
			}

			weeks.push(week);
		}

		months.push(weeks);
	}

	return months;
}
