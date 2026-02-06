# Calendar File Instructions

## Current Setup
The calendar is currently loading from Dropbox via this URL:
https://www.dropbox.com/scl/fi/ky2sgi24lbesef4m8eklu/Feb-2026.mp4

## To Use a Local Calendar File

1. **Download your calendar video** (Feb-2026.mp4 or similar)
2. **Place it in your website root folder** alongside index.html
3. **Update the iframe src in index.html** (around line 129) to:
   ```html
   src="Feb-2026.mp4"
   ```
   or whatever your calendar video filename is.

## Current Calendar Settings
- Height: 700px (desktop)
- Responsive: Adjusts to 500px on tablets, 400px on mobile
- Enhanced styling with purple border and shadow

## To Update Calendar Monthly
Simply replace the video file in your root folder with the new month's calendar.
