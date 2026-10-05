#!/usr/bin/env python3
"""PopUp Karaoke weekly site health check.

Loads the live site in a headless browser and checks the things that have
broken silently before: song search, the catalog, the monthly calendar,
venue pages, the booking form, and every URL in the sitemap.

Usage:  python3 tools/site_health_check.py [base_url]
Needs:  pip install playwright && python3 -m playwright install chromium
Exit code 0 = all good, 1 = at least one problem (details printed).
"""
import json, sys, time, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta

BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://popupkaraoke.net").rstrip("/") + "/"
MIN_SONGS = 80000
problems, notes = [], []


def ok(msg): notes.append("OK   " + msg)
def bad(msg): problems.append("FAIL " + msg)


def http_status(url):
    req = urllib.request.Request(url, headers={"User-Agent": "PopUpKaraoke-HealthCheck/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception as e:
        return str(e)


def chicago_now():
    # Close enough for "which month is it" purposes.
    return datetime.now(timezone.utc) - timedelta(hours=5)


# ── 1. Every sitemap URL responds ──
try:
    with urllib.request.urlopen(urllib.request.Request(BASE + "sitemap.xml", headers={"User-Agent": "PopUpKaraoke-HealthCheck/1.0"}), timeout=30) as r:
        root = ET.fromstring(r.read())
    locs = [e.text.strip() for e in root.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
    broken = [(u, s) for u in locs for s in [http_status(u)] if s != 200]
    if broken:
        for u, s in broken: bad(f"sitemap page not loading: {u} ({s})")
    else:
        ok(f"all {len(locs)} sitemap pages load")
except Exception as e:
    bad(f"sitemap.xml unreadable: {e}")

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()

    def page():
        pg = browser.new_page(viewport={"width": 1280, "height": 900})
        pg.errors = []
        pg.on("pageerror", lambda e: pg.errors.append(str(e)))
        return pg

    def js_errors(pg, label):
        if pg.errors: bad(f"{label}: JavaScript error(s): {pg.errors[:2]}")

    # ── 2. Homepage: calendar, event data, song search, booking form ──
    try:
        pg = page(); pg.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        pg.wait_for_selector("#cal-events .cal-event", timeout=20000)
        n = pg.locator("#cal-events .cal-event").count()
        month = pg.inner_text("#cal-month").strip().title()
        now = chicago_now()
        if month != now.strftime("%B"):
            bad(f"calendar shows {month}, but it's {now.strftime('%B')} — update events.js")
        else:
            ok(f"homepage calendar shows {month} with {n} events")
        try:
            data = json.loads(pg.eval_on_selector("#puk-events-schema", "e => e.text"))
            ok(f"Google event data: {len(data)} public events")
        except Exception:
            bad("Google event data (#puk-events-schema) missing on homepage")
        form = pg.locator("#bookingForm")
        if form.count() and pg.locator("#b-name").count() and pg.locator("#b-email").count() and form.get_attribute("data-netlify") == "true":
            ok("booking form present with name/email fields and Netlify handling")
        else:
            bad("booking form missing or broken on homepage")
        pg.locator("#songSearchInput").scroll_into_view_if_needed(); pg.click("#songSearchInput")
        pg.wait_for_function("window.SONGS && SONGS.length > 0", timeout=60000)
        cnt = pg.evaluate("SONGS.length")
        pg.fill("#songSearchInput", "sweet caroline"); pg.wait_for_timeout(1500)
        if cnt >= MIN_SONGS and "Neil Diamond" in pg.inner_text("#songSearchResults"):
            ok(f"homepage song search works ({cnt:,} songs)")
        else:
            bad(f"homepage song search: {cnt} songs loaded, test search failed")
        js_errors(pg, "homepage")
    except Exception as e:
        bad(f"homepage check crashed: {e}")

    # ── 3. Song Request page search ──
    try:
        pg = page(); pg.goto(BASE + "song-request.html", timeout=60000); pg.wait_for_timeout(1000)
        pg.click("#searchInput")
        pg.wait_for_function("Object.values(window._SC||{}).reduce((a,v)=>a+v.length,0) > 80000", timeout=90000)
        pg.fill("#searchInput", "sweet caroline"); pg.wait_for_timeout(1500)
        if "Neil Diamond" in pg.inner_text("#songGrid"):
            ok("Song Request search works")
        else:
            bad("Song Request search loaded songs but test search found nothing")
        js_errors(pg, "song-request.html")
    except Exception as e:
        bad(f"Song Request search not working: {e}")

    # ── 4. Catalog page ──
    try:
        pg = page(); pg.goto(BASE + "catalog.html", timeout=60000)
        pg.wait_for_function("window.CATALOG_DATA && CATALOG_DATA.length > 0", timeout=90000)
        cnt = pg.evaluate("CATALOG_DATA.length")
        (ok if cnt >= MIN_SONGS else bad)(f"catalog loads {cnt:,} songs")
        js_errors(pg, "catalog.html")
    except Exception as e:
        bad(f"catalog not loading: {e}")

    # ── 5. Venue pages ──
    for slug in ["18th-street-brewery-karaoke", "el-capitan-karaoke", "emilios-karaoke"]:
        try:
            pg = page(); pg.goto(BASE + slug + ".html", timeout=60000)
            pg.wait_for_function("document.querySelector('[data-venue-upcoming]') && !/Loading/.test(document.querySelector('[data-venue-upcoming]').innerText)", timeout=20000)
            txt = pg.inner_text("[data-venue-upcoming]")
            if "No dates posted" in txt:
                notes.append(f"NOTE {slug}: no upcoming dates left this month")
            else:
                ok(f"{slug}: upcoming dates showing")
            js_errors(pg, slug)
        except Exception as e:
            bad(f"{slug}: upcoming dates not rendering: {e}")

    # ── 6. New songs page ──
    try:
        pg = page(); pg.goto(BASE + "new-karaoke-songs.html", timeout=60000)
        n = pg.locator(".art").count()
        (ok if n > 0 else bad)(f"new-songs page lists {n} artists")
    except Exception as e:
        bad(f"new-songs page: {e}")

    browser.close()

print(f"PopUp Karaoke site health check — {chicago_now():%Y-%m-%d %H:%M} (Chicago)")
print(f"{len(problems)} problem(s)\n")
for line in problems + notes:
    print(line)
sys.exit(1 if problems else 0)
