# Calendar File Instructions

## REQUIRED SETUP
⚠️ **IMPORTANT**: The calendar video file **MUST** be in your website's root folder!

**File name**: `Feb-2026.mp4`
**Location**: Same folder as `index.html`

## Features
- ✅ **Autoplay** - Video starts automatically when page loads
- ✅ **Loop** - Video repeats continuously  
- ✅ **No Sound** - Muted for silent autoplay
- ✅ **No Controls** - Clean viewing without player controls

## Setup Instructions

1. **Place Feb-2026.mp4 in your root folder** 
   ```
   your-website/
   ├── index.html
   ├── styles.css
   ├── script.js
   ├── logo.svg
   ├── small-logo.png
   └── Feb-2026.mp4  ← Calendar video goes here!
   ```

2. **Upload all files to your web host**
   - The video will autoplay when visitors load the page
   - No controls will show
   - Video loops continuously

## Current Calendar Settings
- Height: 700px (desktop)
- Responsive: Adjusts to 500px on tablets, 400px on mobile
- Enhanced styling with purple border and shadow
- Autoplay enabled with loop and no sound

## To Update Calendar Monthly
1. Create new calendar video (e.g., `Mar-2026.mp4`)
2. Replace `Feb-2026.mp4` in root folder with new file
3. Update the filename in `index.html` line 138 if you changed the name:
   ```html
   <source src="YOUR-NEW-FILENAME.mp4" type="video/mp4">
   ```
