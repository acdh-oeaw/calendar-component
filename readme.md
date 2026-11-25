# calendar component

this is a simple calendar view, provided as html custom elements.

## how to use

see the [example](./example/index.html), deployed at
<https://calendar-component.acdh-ch-dev.oeaw.ac.at/>.

```html
<acdh-ch-calendar year="2024">
	<fieldset>
		<legend>Year</legend>
		<acdh-ch-calendar-year-radio-group sparse></acdh-ch-calendar-year-radio-group>
	</fieldset>
	<acdh-ch-calendar-year></acdh-ch-calendar-year>
</acdh-ch-calendar>
```

```js
import "@acdh-oeaw/calendar-component/calendar.css";

import { register } from "@acdh-oeaw/calendar-component";
import de from "@acdh-oeaw/calendar-component/i18n/de";

register();

const calendar = document.querySelector("acdh-ch-calendar");

calendar.i18n = de;
calendar.events = [{ date: new Date("2024-09-26"), kind: "birthday", label: "Birthday" }];

calendar.addEventListener("calendar-event-click", (event) => {
	const { date, events } = event.detail;
});
```

dates are interpreted as utc.

## elements

all elements can be nested anywhere inside `<acdh-ch-calendar>`, in any number, and can be added and
removed at any time.

| element                               | attributes          | description                                       |
| ------------------------------------- | ------------------- | ------------------------------------------------- |
| `<acdh-ch-calendar>`                  | `year`              | holds the state                                   |
| `<acdh-ch-calendar-year>`             | `weekdays`          | displays all months of the current year           |
| `<acdh-ch-calendar-month>`            | `month`, `weekdays` | displays one month (1 to 12) of the current year  |
| `<acdh-ch-calendar-year-radio-group>` | `sparse`            | selects a year, use a `<fieldset>` to add a label |
| `<acdh-ch-calendar-year-select>`      | `sparse`            | selects a year, use a `<label>` to add a label    |

- `sparse` only allows selecting years with events.
- `weekdays` displays the names of weekdays.

`<acdh-ch-calendar>` has the properties `events`, `i18n`, and `year`. when there are no events,
`year` is `null`, and nothing is displayed.

## events

| event                  | detail             | description                                    |
| ---------------------- | ------------------ | ---------------------------------------------- |
| `calendar-event-click` | `{ date, events }` | a day with events has been clicked             |
| `calendar-year-change` | `{ year }`         | a different year has been selected by the user |

to create a custom year picker, dispatch a bubbling `calendar-year-select` event with `{ year }` as
detail from any element inside of `<acdh-ch-calendar>`.

## deprecated

these still work, but will be removed in a future version:

- `setData()` and `currentYear`: use `events` and `year`.
- `setI18n()`: use `i18n`.
- `<acdh-ch-calendar-year-picker>` and `register({ picker })`: use
  `<acdh-ch-calendar-year-radio-group>` or `<acdh-ch-calendar-year-select>`.
- `data-variant="sparse"`: use `sparse`.
