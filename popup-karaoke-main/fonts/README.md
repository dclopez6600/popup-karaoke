# Self-Hosted Fonts

To eliminate the Google Fonts CDN dependency (saves ~200ms on first paint), download the font files into this folder.

## One-step download (recommended)

1. Open https://gwfh.mranftl.com/fonts
2. Search for **Outfit** → select weights: 400, 500, 600, 700, 800, 900 → choose "Modern Browsers" → click **Download files**
3. Search for **Space Grotesk** → select weights: 400, 500, 600, 700 → choose "Modern Browsers" → click **Download files**
4. Unzip both downloads. You'll get a bunch of `.woff2` files plus a sample CSS.
5. Drop only the `.woff2` files into this `fonts/` folder. You can ignore the sample CSS — the @font-face rules are already in `style.css`.

Expected files (filenames may vary slightly from what gwfh produces — rename if needed to match):

```
fonts/outfit-v11-latin-400.woff2
fonts/outfit-v11-latin-500.woff2
fonts/outfit-v11-latin-600.woff2
fonts/outfit-v11-latin-700.woff2
fonts/outfit-v11-latin-800.woff2
fonts/outfit-v11-latin-900.woff2
fonts/space-grotesk-v16-latin-400.woff2
fonts/space-grotesk-v16-latin-500.woff2
fonts/space-grotesk-v16-latin-600.woff2
fonts/space-grotesk-v16-latin-700.woff2
```

## After uploading

1. In `index.html` (and the other pages), find the line:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Outfit:..." rel="stylesheet">
   ```
   Delete that line. (Also delete the two `preconnect` lines for `fonts.googleapis.com` and `fonts.gstatic.com`.)

2. Push the changes. The `@font-face` rules I already added at the top of `style.css` will pick up the local files automatically.

## Why bother?

- One fewer DNS lookup (saves ~80ms median on cellular)
- No third-party request — Google can't track visits to your site via fonts
- Slightly faster first paint
- Site works offline / on flaky networks

If you'd rather keep the CDN (less work, slightly slower), just leave the existing setup as-is. The CDN approach still works fine.
