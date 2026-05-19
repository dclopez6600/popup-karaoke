#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  PopUp Karaoke v2.0 — App Store Update Script
#
#  This submits an UPDATE to your existing app:
#    Bundle ID:  app.replit.popupkaraoke
#    ASC App ID: 6767769319
#    Version:    2.0.0 (build 2)
#
#  BEFORE YOU RUN:
#  1. Install Node.js → https://nodejs.org  (if not installed)
#  2. Have your Apple ID (dclopez@me.com) + password ready
#  3. Have your Apple Developer Team ID ready
#     → Find it at: developer.apple.com → Account → Membership
# ─────────────────────────────────────────────────────────────

set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   PopUp Karaoke v2.0 — Store Update     ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "  Bundle ID : app.replit.popupkaraoke"
echo "  App ID    : 6767769319"
echo "  Version   : 2.0.0 (build 2)"
echo "  Apple ID  : dclopez@me.com"
echo ""

# ── Step 1: Install dependencies ─────────────────
echo "📦 Step 1/5 — Installing dependencies..."
npm install
echo "✓ Done"

# ── Step 2: Install EAS CLI ──────────────────────
echo ""
echo "🔧 Step 2/5 — Installing EAS CLI..."
npm install -g eas-cli
echo "✓ Done"

# ── Step 3: Login to Expo ────────────────────────
echo ""
echo "🔑 Step 3/5 — Log in to Expo..."
echo "   (Use your Expo account — sign up free at expo.dev if needed)"
eas login

# ── Step 4: Build ────────────────────────────────
echo ""
echo "🏗  Step 4/5 — Building iOS update..."
echo "   EAS builds in the cloud (~15 min). No Xcode needed."
echo ""
echo "   When prompted for credentials, choose:"
echo "   → 'Expo manages everything' (easiest)"
echo "   → It will ask for your Apple ID password and 2FA code"
echo ""
eas build --platform ios --profile production

echo ""
echo "✓ Build complete!"

# ── Step 5: Submit ───────────────────────────────
echo ""
echo "🚀 Step 5/5 — Submitting to App Store..."
echo ""
echo "   This sends the new build to your existing listing:"
echo "   App ID 6767769319 → PopUp Karaoke"
echo ""
echo "   You'll be asked for your Apple Team ID."
echo "   Find it at: developer.apple.com → Account → Membership Details"
echo ""
read -p "Enter your Apple Team ID (e.g. ABC1234567): " TEAM_ID

# Write the team ID into eas.json
sed -i.bak "s/\"appleTeamId\": \"\"/\"appleTeamId\": \"$TEAM_ID\"/" eas.json

eas submit --platform ios --latest

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅ Update submitted!                   ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Apple will review the update — usually 1–3 days."
echo ""
echo "Track it at: https://appstoreconnect.apple.com"
echo "  → My Apps → PopUp Karaoke → TestFlight / App Store tab"
echo ""
echo "While you wait, you can add 'What's New' release notes:"
echo "  App Store Connect → Your App → iOS App → What's New"
echo "  Suggested text:"
echo "  '✨ Complete redesign with live song updates, singer rotation,"
echo "   event calendar, full song catalog, reviews, and social feed.'"
echo ""
