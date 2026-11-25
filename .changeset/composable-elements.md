---
"@acdh-oeaw/calendar-component": minor
---

make elements composable: pickers and views can be nested anywhere inside `<acdh-ch-calendar>`, in
any number, and can be added, moved, and removed at any time.

- add `events`, `i18n`, and `year` properties, and a `year` attribute
- add `calendar-year-change` event
- add `<acdh-ch-calendar-year-radio-group>`, `<acdh-ch-calendar-year-select>`, and
  `<acdh-ch-calendar-month>` elements
- add `sparse` and `weekdays` attributes
- add types for elements and events
- keep focus when events are refreshed
- add number of events to accessible labels
- allow calling `register` multiple times, and importing on the server

`setData`, `setI18n`, `currentYear`, `<acdh-ch-calendar-year-picker>`, `data-variant`, and the
`picker` option of `register` are deprecated, but still work. the `data`, `picker`, and `calendar`
properties of `<acdh-ch-calendar>`, and the `data`, `variant`, `setData`, `setI18n`, and `update`
members of pickers and views have been removed.
