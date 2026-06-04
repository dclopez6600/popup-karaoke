#!/bin/bash
# ─────────────────────────────────────────────────────────
#  PopUp Karaoke — Fix corrupted node_modules & rebuild
#  Run this from your project folder:
#    chmod +x fix-and-build.sh && ./fix-and-build.sh
# ─────────────────────────────────────────────────────────

set -e
cd "$(dirname "$0")"

echo ""
echo "🧹  Removing node_modules and stale lockfile..."
rm -rf node_modules
rm -f package-lock.json

echo ""
echo "📦  Fresh install on Mac (generates macOS-compatible lockfile)..."
npm install --legacy-peer-deps

echo ""
echo "✅  node_modules rebuilt. Lockfile is now Mac-native."
echo ""
echo "🚀  Starting EAS Build for iOS..."
npx eas-cli build --platform ios --profile production

echo ""
echo "🎉  Build submitted! Watch progress at https://expo.dev"
