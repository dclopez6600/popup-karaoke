# GTM Setup Guide — popupkaraoke.net

Container: **GTM-WNX6WZJZ**
Meta Pixel: **2505894646597826** (currently hard-coded in `index.html`)

This guide configures Google Tag Manager so it tracks every meaningful action on the site: page views, booking requests, song requests, payment clicks, and phone/email taps.

The site already pushes these events to the GTM `dataLayer`:

| Event name (dataLayer) | Fires when | Key params |
|---|---|---|
| `lead_submit` | Booking form OR song-request form is submitted | `content_name`, `content_category`, `value`, `currency` |
| `initiate_checkout` | Any Square payment link is clicked | `content_name`, `payment_method`, `link_source`, `currency` |
| `contact_click` | Phone or email link is tapped | `content_name`, `contact_method` |

You'll set up GTM to listen for these and send them to GA4 (and optionally Meta Pixel + Google Ads).

---

## Prerequisites

You'll need:
- Access to GTM container **GTM-WNX6WZJZ** at https://tagmanager.google.com
- A GA4 property — if you don't have one, create at https://analytics.google.com (Admin → Create Property → Web). Copy the **Measurement ID** (looks like `G-XXXXXXXXXX`).

---

## Step 1 — Built-in variables

In GTM, go to **Variables → Configure** (top right of the Built-In Variables panel) and turn on:

- Click Element
- Click URL
- Click Text
- Form Element
- Form ID
- Form Classes
- Page URL
- Page Path
- Page Hostname

These give you generic data without needing custom variables for common cases.

---

## Step 2 — User-Defined Variables

Create one **Constant** variable so the GA4 ID lives in one place.

1. **Variables → New → Constant**
   - **Variable Name:** `Const - GA4 Measurement ID`
   - **Value:** `G-XXXXXXXXXX` (paste your real GA4 ID)

Then create **Data Layer Variables** for each parameter the site emits. For each one below: **Variables → New → Data Layer Variable**, leave **Data Layer Variable Version** = 2.

| Variable Name | Data Layer Variable Name |
|---|---|
| `DLV - content_name` | `content_name` |
| `DLV - content_category` | `content_category` |
| `DLV - payment_method` | `payment_method` |
| `DLV - link_source` | `link_source` |
| `DLV - contact_method` | `contact_method` |
| `DLV - currency` | `currency` |
| `DLV - value` | `value` |

Save all.

---

## Step 3 — Triggers

### 3a. Page View (already exists by default — skip if `All Pages` trigger is there)

### 3b. Booking / Song Request submission

**Triggers → New**
- **Name:** `CE - lead_submit`
- **Trigger Type:** Custom Event
- **Event name:** `lead_submit`
- **This trigger fires on:** All Custom Events

### 3c. Square payment click

**Triggers → New**
- **Name:** `CE - initiate_checkout`
- **Trigger Type:** Custom Event
- **Event name:** `initiate_checkout`
- **This trigger fires on:** All Custom Events

### 3d. Phone/email tap

**Triggers → New**
- **Name:** `CE - contact_click`
- **Trigger Type:** Custom Event
- **Event name:** `contact_click`
- **This trigger fires on:** All Custom Events

---

## Step 4 — Tags

### 4a. GA4 Configuration (initialize GA4 on every page)

**Tags → New**
- **Name:** `GA4 - Configuration`
- **Tag Type:** Google Tag (formerly GA4 Configuration)
- **Tag ID:** `{{Const - GA4 Measurement ID}}`
- **Triggering:** All Pages (Page View)

### 4b. GA4 Event — Lead

**Tags → New**
- **Name:** `GA4 - Event - generate_lead`
- **Tag Type:** Google Analytics: GA4 Event
- **Measurement ID:** `{{Const - GA4 Measurement ID}}`
- **Event Name:** `generate_lead` *(this is the recommended GA4 event name)*
- **Event Parameters:**

  | Parameter Name | Value |
  |---|---|
  | `content_name`     | `{{DLV - content_name}}` |
  | `content_category` | `{{DLV - content_category}}` |
  | `currency`         | `{{DLV - currency}}` |
  | `value`            | `{{DLV - value}}` |

- **Triggering:** `CE - lead_submit`

### 4c. GA4 Event — Begin Checkout (Square click)

**Tags → New**
- **Name:** `GA4 - Event - begin_checkout`
- **Tag Type:** Google Analytics: GA4 Event
- **Measurement ID:** `{{Const - GA4 Measurement ID}}`
- **Event Name:** `begin_checkout`
- **Event Parameters:**

  | Parameter Name | Value |
  |---|---|
  | `content_name`    | `{{DLV - content_name}}` |
  | `payment_method`  | `{{DLV - payment_method}}` |
  | `link_source`     | `{{DLV - link_source}}` |
  | `currency`        | `{{DLV - currency}}` |

- **Triggering:** `CE - initiate_checkout`

### 4d. GA4 Event — Contact

**Tags → New**
- **Name:** `GA4 - Event - contact`
- **Tag Type:** Google Analytics: GA4 Event
- **Measurement ID:** `{{Const - GA4 Measurement ID}}`
- **Event Name:** `contact`
- **Event Parameters:**

  | Parameter Name | Value |
  |---|---|
  | `content_name`    | `{{DLV - content_name}}` |
  | `contact_method`  | `{{DLV - contact_method}}` |

- **Triggering:** `CE - contact_click`

---

## Step 5 — Mark conversions in GA4

In **GA4 → Admin → Events**, after the events have fired at least once, toggle these on as conversions:

- `generate_lead`
- `begin_checkout`

(Optionally: `contact`)

This makes them appear in the Conversions report and lets you import them as Google Ads conversions later.

---

## Step 6 — Test before publishing

1. In GTM, click **Preview** (top right).
2. Enter `https://popupkaraoke.net/` and connect.
3. In the new tab that opens, do each action and confirm the corresponding event shows in the GTM Tag Assistant left rail:
   - Submit the booking form → `lead_submit` fires + `GA4 - Event - generate_lead` tag fires.
   - Open the song-request modal and submit → same.
   - Click any "Pay with Square" button → `initiate_checkout` fires.
   - Tap the phone or email link → `contact_click` fires.
4. Open the GA4 **DebugView** (Admin → DebugView) — events should land within seconds.
5. Once verified, back in GTM click **Submit** to publish the container.

---

## Step 7 — (Recommended) Move Meta Pixel into GTM

Right now the Pixel is hard-coded in `index.html`. To manage it from GTM instead:

### 7a. Pixel base tag

**Tags → New → Custom HTML**
- **Name:** `Meta Pixel - Base`
- **HTML:**
  ```html
  <script>
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '2505894646597826');
  fbq('track', 'PageView');
  </script>
  ```
- **Triggering:** All Pages

### 7b. Pixel Lead event

**Tags → New → Custom HTML**
- **Name:** `Meta Pixel - Lead`
- **HTML:**
  ```html
  <script>fbq('track', 'Lead', {
    content_name: {{DLV - content_name}},
    content_category: {{DLV - content_category}}
  });</script>
  ```
- **Tag firing options:** Once per event
- **Triggering:** `CE - lead_submit`
- **Tag sequencing:** Fire `Meta Pixel - Base` before this tag (Tag firing options → Tag sequencing).

### 7c. Pixel InitiateCheckout

Same pattern as 7b but:
- **Name:** `Meta Pixel - InitiateCheckout`
- **HTML:** `<script>fbq('track', 'InitiateCheckout', { content_name: {{DLV - content_name}}, payment_method: {{DLV - payment_method}} });</script>`
- **Triggering:** `CE - initiate_checkout`

### 7d. Remove the hard-coded Pixel

Once 7a/7b/7c are in GTM and verified, delete the `<!-- Meta Pixel Code -->` block from `index.html` (both the `<script>` and the `<noscript>`). Otherwise PageView fires twice — Meta dedupes most events, but cleanup is cleaner.

---

## Quick reference — what fires from where

| User action | dataLayer event | GA4 event sent | Meta Pixel event |
|---|---|---|---|
| Page loads | `gtm.js` | `page_view` (auto) | `PageView` |
| Booking form submit | `lead_submit` (content_category=`booking`) | `generate_lead` | `Lead` |
| Song request submit | `lead_submit` (content_category=`song_request`) | `generate_lead` | `Lead` |
| Square button click | `initiate_checkout` | `begin_checkout` | `InitiateCheckout` |
| Phone/email tap | `contact_click` | `contact` | `Contact` |

---

## Troubleshooting

- **Event not firing in Preview mode:** Hard-refresh (Cmd+Shift+R / Ctrl+F5) — GTM caches container versions.
- **Events fire but parameters are empty:** Check the dataLayer variable names — they're case-sensitive and must exactly match `content_name`, `content_category`, etc.
- **GA4 DebugView shows nothing:** Make sure you installed the **GA Debugger** Chrome extension OR launched from GTM Preview (which adds the debug parameter automatically).
- **Square button doesn't fire `initiate_checkout`:** The site listens to `a[href*="square.link"]`. If you change the payment URL, the listener still works as long as the URL contains `square.link`.
