# event-time-utils

[![npm version](https://badge.fury.io/js/event-time-utils.svg)](http://badge.fury.io/js/event-time-utils)
![Downloads](http://img.shields.io/npm/dm/event-time-utils.svg?style=flat)

A collection of utilities based around events with begins/ends timestamps

## Installation

Install the package with npm:

```
npm install event-time-utils
```

## Usage

These utilities are intended to be used with any objects that have a `begins` / `ends` timestamp,
formatted as a millisecond integer.

### chronoEventsComparer

`chronoEventsComparer` is used for sorting events by start time.

```javascript
import moment from 'moment'
import { chronoEventsComparer } from 'event-time-utils'

let events = [
  {
    title: 'Dinner',
    begins: +moment().set({hour: 19, minute: 0,}).startOf('minute').format('x'),
    ends: +moment().set({hour: 20, minute: 0,}).startOf('minute').format('x'),
  },
  {
    title: 'Breakfast',
    begins: +moment().set({hour: 7, minute: 30,}).startOf('minute').format('x'),
    ends: +moment().set({hour: 8, minute: 0,}).startOf('minute').format('x'),
  },
  {
    title: 'Lunch',
    begins: +moment().set({hour: 12, minute: 0,}).startOf('minute').format('x'),
    ends: +moment().set({hour: 13, minute: 15,}).startOf('minute').format('x'),
  },
]
let sortedEvents = [...events,].sort(chronoEventsComparer)

console.log(sortedEvents)
// [{title: 'Breakfast', ...}, {title: 'Lunch', ...}, {title: 'Dinner', ...}]
```

### activeTime

`activeTime` tells you the amount of total time spent within a set of events, given a `begins` and
`ends` bound. Overlapping times are only counted once.

For this function to work, events require a key-serialisable unique `id` attribute. The time value
is returned as a simplified two decimal place string count of hours.

```javascript
import moment from 'moment'
import { activeTime } from 'event-time-utils'

let events = [
  {
    id: 1,
    title: 'Eat Breakfast',
    begins: +moment().set({hour: 6, minute: 30,}).startOf('minute').format('x'),
    ends: +moment().set({hour: 7, minute: 0,}).startOf('minute').format('x'),
  },
  {
    id: 2,
    title: 'Shower',
    begins: +moment().set({hour: 7, minute: 15,}).startOf('minute').format('x'),
    ends: +moment().set({hour: 7, minute: 30,}).startOf('minute').format('x'),
  },
  {
    id: 3,
    title: 'Brush Teeth',
    begins: +moment().set({hour: 7, minute: 20,}).startOf('minute').format('x'),
    ends: +moment().set({hour: 7, minute: 25,}).startOf('minute').format('x'),
  },
]
let dayBegins = +moment().startOf('day').format('x')
let dayEnds = +moment().endOf('day').format('x')
let time = activeTime(events, dayBegins, dayEnds)

console.log(time)
// '0.75'
```

### eventsInRange

`eventsInRange` returns a filtered set of events that fall within a specified `begins` and `ends`
bound.

```javascript
import moment from 'moment'
import { eventsInRange } from 'event-time-utils'

let events = [
  {
    title: 'Lunch Yesterday',
    begins: +moment().subtract({days: 1,}).set({hour: 6, minute: 30,}).startOf('minute').format('x'),
    ends: +moment().subtract({days: 1,}).set({hour: 7, minute: 0,}).startOf('minute').format('x'),
  },
  {
    title: 'Lunch Today',
    begins: +moment().set({hour: 7, minute: 15,}).startOf('minute').format('x'),
    ends: +moment().set({hour: 7, minute: 30,}).startOf('minute').format('x'),
  },
  {
    title: 'Lunch Tomorrow',
    begins: +moment().add({days: 1,}).set({hour: 7, minute: 20,}).startOf('minute').format('x'),
    ends: +moment().add({days: 1,}).set({hour: 7, minute: 25,}).startOf('minute').format('x'),
  },
]
let dayBegins = +moment().startOf('day').format('x')
let dayEnds = +moment().endOf('day').format('x')
let todaysEvents = eventsInRange(events, dayBegins, dayEnds)

console.log(todaysEvents)
// [{title: 'Lunch Today', ...}]
```

### stackEvents

`stackEvents` returns a mutated set of events with an additional `stackIndex` attribute, with any
overlapping events placed on a higher stack.

The input events can be supplied with their own `stackIndex` attribute, so all other events will
stack around them.

Optionally, you can provide a `margin` to which events will stack even if they don't overlap.

```javascript
import moment from 'moment'
import { stackEvents } from 'event-time-utils'

let events = [
  {
    title: 'Eat Breakfast',
    begins: +moment().set({hour: 6, minute: 30,}).startOf('minute').format('x'),
    ends: +moment().set({hour: 7, minute: 0,}).startOf('minute').format('x'),
  },
  {
    title: 'Shower',
    begins: +moment().set({hour: 7, minute: 15,}).startOf('minute').format('x'),
    ends: +moment().set({hour: 7, minute: 30,}).startOf('minute').format('x'),
  },
  {
    title: 'Brush Teeth',
    begins: +moment().set({hour: 7, minute: 20,}).startOf('minute').format('x'),
    ends: +moment().set({hour: 7, minute: 25,}).startOf('minute').format('x'),
  },
]
let stackedEvents = stackEvents(events, 0)

console.log(
  'shower stack:', stackedEvents[1].stackIndex,
  'brush teeth stack:', stackedEvents[2].stackIndex,
)
// shower stack: 0, brush teeth stack: 1
```

### nearestTime

`nearestTime` rounds a given time value to the nearest given time unit.

```javascript
import moment from 'moment'
import { nearestTime } from 'event-time-utils'

let vagueTime = +moment().set({hour: 7, minute: 7,}).startOf('minute').format('x')
let roundedTime = nearestTime(vagueTime, +moment.duration({minutes: 15,}))

console.log(
  moment(vagueTime, 'x').format(), 'rounded to:',
  moment(roundedTime, 'x').format(),
)
// 2018-05-15T07:07:00+10:00 rounded to: 2018-05-15T07:00:00+10:00
```
