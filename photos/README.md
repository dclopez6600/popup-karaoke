# Photo Gallery

Drop your event photos in this folder, then add them to the `PUK_GALLERY` data block in `index.html`.

## Recommended specs

- **Format:** JPG (smaller file size for photos than PNG)
- **Size:** 1200×900 px or 1600×1200 px (4:3 aspect ratio works best — the gallery uses 4:3 thumbnails)
- **File size:** under 300 KB each. If they're bigger, run them through https://tinypng.com first.
- **Filename:** lowercase, no spaces. Example: `valpo-wedding-2026.jpg`

## How to add photos to the site

1. Copy the photo files into this `photos/` folder.
2. Open `index.html` in any text editor.
3. Find the `EDIT MONTHLY` comment near the calendar — right below it, you'll find another block labeled `EDIT THIS BLOCK TO MANAGE THE PHOTO GALLERY`.
4. Add or remove entries in the `PUK_GALLERY` array. Each entry looks like:

   ```js
   { src: "photos/valpo-wedding-2026.jpg", caption: "Wedding at Aberdeen Manor — March 2026" }
   ```

5. Save and push.

## Tips

- Aim for **6 to 12 photos**. Fewer feels sparse, more makes the page heavy.
- Mix event types: weddings, brewery nights, birthdays, corporate. Show range.
- Crowd shots > equipment shots. People singing > the rig.
- One or two close-ups of someone laughing or singing into the mic = gold.

## What if I don't have photos yet?

Leave the gallery empty (the page hides the section when `PUK_GALLERY` is empty). When you have photos, add them and the gallery appears automatically.
