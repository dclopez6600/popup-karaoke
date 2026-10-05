/* PopUp Karaoke — builds the calendar, Google event data, and venue-page dates
   from events.js. Monthly updates happen in events.js, not here. */
(function () {
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var DAY_SHORT = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  var SITE = 'https://popupkaraoke.net/';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // America/Chicago offset: CDT (-05:00) from the 2nd Sunday of March to the 1st Sunday of November.
  function nthSunday(y, m, n) { var d = new Date(y, m, 1); var first = (7 - d.getDay()) % 7 + 1; return first + (n - 1) * 7; }
  function chicagoOffset(y, m0, d) {
    var dstStart = nthSunday(y, 2, 2), dstEnd = nthSunday(y, 10, 1);
    var after = m0 > 2 || (m0 === 2 && d >= dstStart);
    var before = m0 < 10 || (m0 === 10 && d < dstEnd);
    return (after && before) ? '-05:00' : '-06:00';
  }

  // "8pm – 12am" -> {start:[20,0], end:[0,0], overnight:true}
  function parseTime(t) {
    if (!t) return null;
    var re = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/gi, m, out = [];
    while ((m = re.exec(t))) {
      var h = parseInt(m[1], 10) % 12; if (m[3].toLowerCase() === 'pm') h += 12;
      out.push([h, m[2] ? parseInt(m[2], 10) : 0]);
    }
    if (out.length < 2) return null;
    var overnight = (out[1][0] * 60 + out[1][1]) <= (out[0][0] * 60 + out[0][1]);
    return { start: out[0], end: out[1], overnight: overnight };
  }
  function iso(y, m0, d, hm) {
    var dt = new Date(y, m0, d);
    return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()) + 'T' + pad(hm[0]) + ':' + pad(hm[1]) + ':00' + chicagoOffset(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }

  function events() {
    var cal = window.PUK_CALENDAR, venues = window.PUK_VENUES || {};
    if (!cal || !cal.events) return [];
    var m0 = cal.month - 1;
    return cal.events.map(function (e) {
      var v = venues[e.v] || { name: e.v };
      var date = new Date(cal.year, m0, e.d);
      return { e: e, v: v, key: e.v, y: cal.year, m0: m0, d: e.d, date: date, dow: date.getDay(), time: parseTime(e.time) };
    });
  }

  function mapsUrl(v) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(v.maps || (v.name + ' ' + v.street + ' ' + v.city + ' IN')); }
  function addr(v) { return v.street ? v.street + ', ' + v.city + ', IN' + (v.zip ? ' ' + v.zip : '') : ''; }

  // ── Homepage calendar ──
  function renderCalendar() {
    var list = document.getElementById('cal-events'); if (!list) return;
    var cal = window.PUK_CALENDAR;
    var mEl = document.getElementById('cal-month'), yEl = document.getElementById('cal-year'), fEl = document.querySelector('.cal-funfact-text');
    if (mEl) mEl.textContent = MONTHS[cal.month - 1];
    if (yEl) yEl.textContent = cal.year;
    if (fEl && cal.funFact) fEl.textContent = cal.funFact;
    var evs = events();
    if (!evs.length) { list.innerHTML = '<p class="cal-empty">No public events scheduled this month — check back soon!</p>'; return; }
    list.innerHTML = evs.map(function (x) {
      var v = x.v, cls = (x.key || '').replace(/[^A-Za-z0-9]/g, '');
      var name = v.page ? '<a href="' + esc(v.page) + '" style="color:inherit;text-decoration:none">' + esc(v.name) + '</a>' : esc(v.name);
      var a = addr(v);
      return '<article class="cal-event venue-' + cls + '">'
        + '<div class="cal-event-date"><span class="cal-event-day">' + DAY_SHORT[x.dow] + '</span><span class="cal-event-num">' + x.d + '</span></div>'
        + '<div class="cal-event-info"><h4 class="cal-event-venue">' + name + '</h4>'
        + (x.e.title ? '<div class="cal-event-title">' + esc(x.e.title) + '</div>' : '')
        + '<div class="cal-event-meta">'
        + (x.e.time ? '<span class="cal-event-time">' + esc(x.e.time) + '</span>' : '')
        + (a ? '<span class="cal-event-addr"><a href="' + mapsUrl(v) + '" target="_blank" rel="noopener">' + esc(a) + '</a></span>' : '')
        + '</div>'
        + ((x.e.note || v.note) ? '<div class="cal-event-note" style="font-size:0.72rem;color:var(--text-mute,var(--text-dim));font-style:italic;margin-top:0.25rem;">*' + esc(x.e.note || v.note) + '</div>' : '')
        + '</div></article>';
    }).join('');
  }

  // ── Venue pages: upcoming dates ──
  function renderVenueUpcoming() {
    var els = document.querySelectorAll('[data-venue-upcoming]'); if (!els.length) return;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var all = events();
    Array.prototype.forEach.call(els, function (el) {
      var key = el.getAttribute('data-venue-upcoming');
      var mine = all.filter(function (x) { return x.key === key && x.date >= today; });
      if (!mine.length) {
        el.innerHTML = '<p style="color:var(--text-dim)">No dates posted for the rest of ' + MONTHS[window.PUK_CALENDAR.month - 1] + ' yet. Check the <a href="index.html#events">events calendar</a> or follow <a href="https://www.facebook.com/PopUpKaraoke219" target="_blank" rel="noopener">@popupkaraoke219</a> for next month\'s schedule.</p>';
        return;
      }
      el.innerHTML = '<ul class="venue-dates">' + mine.map(function (x) {
        return '<li><strong>' + DAYS[x.dow] + ', ' + MONTHS[x.m0] + ' ' + x.d + '</strong>' + (x.e.time ? ' · ' + esc(x.e.time) : '') + (x.e.title ? ' · ' + esc(x.e.title) : '') + '</li>';
      }).join('') + '</ul>';
    });
  }

  // ── Google event data (JSON-LD), built from the same list ──
  function injectSchema() {
    var scope = document.querySelector('[data-venue-upcoming]');
    var only = scope ? scope.getAttribute('data-venue-upcoming') : null;
    var out = events().filter(function (x) {
      return !x.v.private && x.v.street && x.time && (!only || x.key === only);
    }).map(function (x) {
      var v = x.v, t = x.time;
      var endDay = t.overnight ? x.d + 1 : x.d;
      var title = x.e.title || 'Karaoke Night';
      var place = { '@type': 'Place', name: v.name, address: { '@type': 'PostalAddress', streetAddress: v.street, addressLocality: v.city, addressRegion: 'IN', addressCountry: 'US' } };
      if (v.zip) place.address.postalCode = v.zip;
      return {
        '@context': 'https://schema.org', '@type': 'Event',
        name: title + ' at ' + v.name + ' — Hosted by PopUp Karaoke',
        description: title + ' with PopUp Karaoke at ' + v.name + ' in ' + v.city + ', IN. Pro host, 90,000+ songs, concert-quality sound. Free to attend.',
        startDate: iso(x.y, x.m0, x.d, t.start), endDate: iso(x.y, x.m0, endDay, t.end),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: place,
        organizer: { '@type': 'Organization', name: 'PopUp Karaoke', url: SITE },
        performer: { '@type': 'Organization', name: 'PopUp Karaoke' },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: v.page ? SITE + v.page : SITE + '#events', validFrom: iso(x.y, x.m0, 1, [0, 0]) },
        isAccessibleForFree: true,
        image: SITE + 'og-image.png'
      };
    });
    if (!out.length) return;
    var s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'puk-events-schema';
    s.text = JSON.stringify(out);
    document.head.appendChild(s);
  }

  function run() { renderCalendar(); renderVenueUpcoming(); injectSchema(); }

  // events.js is fetched fresh (hourly cache-buster) so a monthly edit shows up right away.
  if (window.PUK_CALENDAR) { run(); return; }
  var base = (document.currentScript && document.currentScript.src) ? document.currentScript.src.replace(/calendar\.js.*$/, '') : '';
  var s = document.createElement('script');
  s.src = base + 'events.js?h=' + Math.floor(Date.now() / 3600000);
  s.onload = run;
  document.head.appendChild(s);
})();
