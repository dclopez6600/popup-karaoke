/* ==========================================================================
   PopUp Karaoke — EVENT CALENDAR (the only file to edit each month)

   This one list drives:
     • the "Where to sing this month" calendar on the homepage
     • the event data Google reads for event listings (built automatically)
     • the "Upcoming dates" on each venue page

   Monthly update:
     1. Change `month` (1–12) and `year`.
     2. Replace the `events` list. Each event needs:
          d      day of the month (the weekday is worked out automatically)
          v      venue key from PUK_VENUES below
          title  event name shown under the venue (optional)
          time   like "7pm – 10pm" or "8pm – 12am" (leave out for private events)
     3. Private events: { d: 17, v: "private" } — shown greyed out, never sent to Google.
   New venue? Add it to PUK_VENUES once, then use its key in events.
   ========================================================================== */

window.PUK_VENUES = {
  "18thStreetBrewery": { name: "18th Street Brewery – Miller", street: "5725 Miller Ave", city: "Gary", zip: "46403", maps: "18th Street Brewery 5725 Miller Ave Gary IN", page: "18th-street-brewery-karaoke.html" },
  "elCapitan":         { name: "El Capitán", street: "327 Main St", city: "Hobart", zip: "46342", maps: "El Capitan 327 Main St Hobart IN", page: "el-capitan-karaoke.html" },
  "emilios":           { name: "Emilio's Restaurant & Cantina", street: "9400 Indianapolis Blvd", city: "Highland", zip: "46322", maps: "Emilio's Restaurant & Cantina 9400 Indianapolis Blvd Highland IN", page: "emilios-karaoke.html" },
  "moods":             { name: "Moods", street: "2548 Portage Mall", city: "Portage", zip: "46368", maps: "Moods 2548 Portage Mall Portage IN" },
  "stacksBarGrill":    { name: "Stacks Bar and Grill", street: "175 W Lincolnway", city: "Valparaiso", zip: "", maps: "Stacks Bar and Grill 175 W Lincolnway Valparaiso IN" },
  "sunsetMarkets":     { name: "Sunset Markets", street: "6600 Broadway", city: "Merrillville", zip: "46410", maps: "Dean and Barbara White Community Center 6600 Broadway Merrillville IN" },
  "flights":           { name: "Flights Taproom", street: "839 169th St", city: "Hammond", zip: "46324", maps: "Flights Taproom 839 169th St Hammond IN" },
  "private":           { name: "Private Party", private: true, note: "Private event — not open to the public" }
};

window.PUK_CALENDAR = {
  month: 10,
  year: 2026,
  funFact: "According to recent studies, singing karaoke relieves stress, boosts self-esteem and confidence, and builds social connections — all major life extenders.",
  events: [
    { d: 2,  v: "elCapitan",         title: "Karaoke Friday",                 time: "8pm – 12am" },
    { d: 4,  v: "moods",             title: "Dolly Parton Sing Along Brunch", time: "12pm – 3pm" },
    { d: 7,  v: "18thStreetBrewery", title: "Karaoke Night",                  time: "7pm – 10pm" },
    { d: 8,  v: "emilios",           title: "Karaoke Thursdays",              time: "7pm – 10pm" },
    { d: 14, v: "18thStreetBrewery", title: "Karaoke Night",                  time: "7pm – 10pm" },
    { d: 16, v: "elCapitan",         title: "Karaoke Friday",                 time: "8pm – 12am" },
    { d: 17, v: "private" },
    { d: 21, v: "18thStreetBrewery", title: "Karaoke Night",                  time: "7pm – 10pm" },
    { d: 22, v: "emilios",           title: "Karaoke Thursdays",              time: "7pm – 10pm" },
    { d: 25, v: "private" },
    { d: 28, v: "18thStreetBrewery", title: "Karaoke Night",                  time: "7pm – 10pm" },
    { d: 30, v: "elCapitan",         title: "Karaoke Friday",                 time: "8pm – 12am" }
  ]
};
