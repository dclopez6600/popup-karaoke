#!/usr/bin/env node
/* Builds the mobile app's events from events.js into home-data.json.
   Runs automatically (GitHub Action) whenever events.js changes —
   you never need to run or edit this by hand.

   - Calendar: every public event in events.js (private ones are skipped)
   - "Every Week" cards: the WEEKLY list below (shown as cards only;
     the actual dates always come from events.js)                       */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// Weekly residency cards shown in the app (edit only if a residency starts/ends)
const WEEKLY = [
  { key: '18thStreetBrewery', name: '18th Street Brewery', shortName: '18th St Brewery', schedule: 'Every Wednesday', time: '7:00 PM – 10:00 PM' },
  { key: 'elCapitan',         name: 'El Capitan',          shortName: 'El Capitán',      schedule: 'Every Friday',    time: '8:00 PM – 12:00 AM' },
];

// Look per venue in the app (anything not listed gets the default)
const STYLE = {
  '18thStreetBrewery': { color: 'primary', emoji: '🍺' },
  elCapitan:           { color: 'cyan',    emoji: '🎸' },
  emilios:             { color: 'accent',  emoji: '🌮' },
  moods:               { color: 'accent',  emoji: '🥂' },
  stacksBarGrill:      { color: 'accent',  emoji: '🍔' },
  sunsetMarkets:       { color: 'cyan',    emoji: '🌅' },
  flights:             { color: 'accent',  emoji: '🥃' },
};
const DEFAULT_STYLE = { color: 'primary', emoji: '🎤' };

// Load events.js (it assigns to window.*)
const window = {};
new Function('window', fs.readFileSync(path.join(root, 'events.js'), 'utf8'))(window);
const VENUES = window.PUK_VENUES, CAL = window.PUK_CALENDAR;

// "7pm – 10pm" -> "7:00 PM – 10:00 PM"
const fmtTime = t => (t || '').replace(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/gi,
  (_, h, m, ap) => `${h}:${m || '00'} ${ap.toUpperCase()}`);
const address = v => `${v.street}, ${v.city}, IN`;
const mapsQuery = v => encodeURIComponent(v.maps || address(v)).replace(/%20/g, '+');
const pad = n => String(n).padStart(2, '0');

const oneOffEvents = CAL.events
  .filter(e => VENUES[e.v] && !VENUES[e.v].private)
  .map(e => {
    const v = VENUES[e.v], s = STYLE[e.v] || DEFAULT_STYLE;
    const ev = {
      date: `${CAL.year}-${pad(CAL.month)}-${pad(e.d)}`,
      venue: v.name,
      shortName: v.name.split(/ [–-] | Restaurant| Bar and| Taproom/)[0],
      time: fmtTime(e.time),
      address: address(v),
      mapsQuery: mapsQuery(v),
      color: s.color,
      emoji: s.emoji,
    };
    if (e.title) ev.note = e.title;
    return ev;
  });

const venues = WEEKLY.map(w => {
  const v = VENUES[w.key], s = STYLE[w.key] || DEFAULT_STYLE;
  return { name: w.name, shortName: w.shortName, address: address(v), schedule: w.schedule,
           time: w.time, mapsQuery: mapsQuery(v), color: s.color, emoji: s.emoji };
  // no "rule" on purpose: dates come only from events.js
});

const file = path.join(root, 'home-data.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
data.venues = venues;
data.oneOffEvents = oneOffEvents;
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
console.log(`home-data.json: ${venues.length} weekly cards, ${oneOffEvents.length} events for ${CAL.month}/${CAL.year}`);
