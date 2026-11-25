# calendar component

this is a simple calendar view, provided as html custom elements.

## how to use

see the [example](./example/index.html), deployed at
<https://calendar-component.acdh-dev.oeaw.ac.at/>.

```html
<acdh-calendar year="2024">
	<fieldset>
		<legend>Year</legend>
		<acdh-calendar-year-radio-group sparse></acdh-calendar-year-radio-group>
	</fieldset>
	<acdh-calendar-year></acdh-calendar-year>
</acdh-calendar>
```

```js
import "@acdh-oeaw/calendar-component/calendar.css";

import { register } from "@acdh-oeaw/calendar-component";
import de from "@acdh-oeaw/calendar-component/i18n/de";

register();

const calendar = document.querySelector("acdh-calendar");

calendar.i18n = de;
calendar.events = [{ date: new Date("2024-09-26"), kind: "birthday", label: "Birthday" }];

calendar.addEventListener("calendar-event-click", (event) => {
	const { date, events } = event.detail;
});
```

dates are interpreted as utc.

## elements

all elements can be nested anywhere inside `<acdh-calendar>`, in any number, and can be added and
removed at any time.

| element                            | attributes          | description                                       |
| ---------------------------------- | ------------------- | ------------------------------------------------- |
| `<acdh-calendar>`                  | `year`              | holds the state                                   |
| `<acdh-calendar-year>`             | `weekdays`          | displays all months of the current year           |
| `<acdh-calendar-month>`            | `month`, `weekdays` | displays one month (1 to 12) of the current year  |
| `<acdh-calendar-year-radio-group>` | `sparse`            | selects a year, use a `<fieldset>` to add a label |
| `<acdh-calendar-year-select>`      | `sparse`            | selects a year, use a `<label>` to add a label    |

- `sparse` only allows selecting years with events.
- `weekdays` displays the names of weekdays.

`<acdh-calendar>` has the properties `events`, `i18n`, and `year`. when there are no events, `year`
is `null`, and nothing is displayed.

## events

| event                  | detail             | description                                    |
| ---------------------- | ------------------ | ---------------------------------------------- |
| `calendar-event-click` | `{ date, events }` | a day with events has been clicked             |
| `calendar-year-change` | `{ year }`         | a different year has been selected by the user |

to create a custom year picker, dispatch a bubbling `calendar-year-select` event with `{ year }` as
detail from any element inside of `<acdh-calendar>`.
