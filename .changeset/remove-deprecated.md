---
"@acdh-oeaw/calendar-component": minor
---

remove deprecated api:

- `<acdh-ch-calendar>` and `<acdh-ch-calendar-year>`: use `<acdh-calendar>` and
  `<acdh-calendar-year>`, also in css selectors
- `<acdh-ch-calendar-year-picker>` and `register({ picker })`: use
  `<acdh-calendar-year-radio-group>` or `<acdh-calendar-year-select>`
- `setData`, `currentYear`, and the `CalendarData` and `CalendarInput` types: use `events` and
  `year`
- `setI18n`: use `i18n`
- `data-variant="sparse"`: use `sparse`
