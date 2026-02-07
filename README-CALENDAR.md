# Calendar File Instructions

## Current Setup
The calendar is currently loading from Dropbox as a video with **autoplay enabled and no controls**.

Video URL: https://www.dropbox.com/scl/fi/ky2sgi24lbesef4m8eklu/Feb-2026.mp4

## Features
- ✅ **Autoplay** - Video starts automatically when page loads
- ✅ **Loop** - Video repeats continuously
- ✅ **No Controls** - Clean viewing without player controls
- ✅ **Muted** - Silent autoplay (required for autoplay in browsers)

## To Use a Local Calendar File

1. **Download your calendar video** (Feb-2026.mp4 or similar)
2. **Place it in your website root folder** alongside index.html
3. **Update the video src in index.html** (around line 138) to:
   ```html
   <source src="Feb-2026.mp4" type="video/mp4">
   ```

## Current Calendar Settings
- Height: 700px (desktop)
- Responsive: Adjusts to 500px on tablets, 400px on mobile
- Enhanced styling with purple border and shadow
- Autoplay enabled with loop

## To Update Calendar Monthly
Simply replace the video file in your root folder with the new month's calendar video.
