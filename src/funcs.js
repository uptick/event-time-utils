import moment from 'moment'

function chronoEventsComparer(a, b) {
  return (a.begins - b.begins)
}

function eventsOverlap(eventOne, eventTwo, margin) {
  return (
    eventOne.begins - margin < eventTwo.ends &&
    eventTwo.begins - margin < eventOne.ends
  )
}

function activeComparer(a, b) {
  return (a.time - b.time)
}
function activeTime(events, starts, ends) {
  let timeEvents = []
  timeEvents.push({
    type: 'timestart',
    time: +starts,
  })
  timeEvents.push({
    type: 'timeend',
    time: +ends,
  })
  events.map((event) => {
    timeEvents.push({
      type: 'workstart',
      time: +event.begins,
      id: event.id,
    })
    timeEvents.push({
      type: 'workends',
      time: +event.ends,
      id: event.id,
    })
  })
  timeEvents.sort(activeComparer)

  let activeEventIds = {}
  let activeTime = 0
  let withinTime = false
  let lastTime = 0
  timeEvents.map((event) => {
    if (withinTime && Object.keys(activeEventIds).length > 0) {
      activeTime += event.time - lastTime
    }
    lastTime = event.time

    if (event.type == 'workstart') {
      activeEventIds[event.id] = true
    }
    else if (event.type == 'workends') {
      if (event.id in activeEventIds) {
        delete activeEventIds[event.id]
      }
    }

    if (event.type == 'timeend') {
      withinTime = false
    }
    else if (event.type == 'timestart') {
      withinTime = true
    }
  })
  let hours = (activeTime / (1000 * 60 * 60)).toFixed(2).replace(/0+$/,'').replace(/\.+$/,'')
  return hours
}

function eventsInRange(events, starts, ends) {
  let newEvents = []
  events.map((event, eventIndex) => {
    if ((starts <= event.ends) && (ends >= event.begins)) {
      newEvents.push(event)
    }
  })
  return newEvents
}

function stackEvents(events, margin) {
  if (!margin) {
    margin = 0
  }
  const stackedEvents = [...events]
  stackedEvents.map((event, eventIndex) => {
    const newEvent = {
      ...event,
    }
    if ('stackIndex' in newEvent === false) {
      const takenStacks = {}
      stackedEvents.map((stackedEvent) => {
        if (stackedEvent.invisible || 'stackIndex' in stackedEvent === false) { return }
        if (eventsOverlap(stackedEvent, newEvent, margin)) {
          takenStacks[stackedEvent.stackIndex] = true
        }
      })
      newEvent.stackIndex = 0
      if (!newEvent.invisible) {
        while (newEvent.stackIndex in takenStacks) {
          newEvent.stackIndex++
        }
      }
    }
    stackedEvents[eventIndex] = newEvent
  })
  return stackedEvents
}

function nearestTime(time, roundTo) {
  return Math.round(+time / +roundTo) * +roundTo
}

export {
  chronoEventsComparer,
  eventsOverlap,
  activeTime,
  eventsInRange,
  stackEvents,
  nearestTime,
}
