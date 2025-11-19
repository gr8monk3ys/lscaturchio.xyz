# PWA Setup Instructions

## Icon Generation

The PWA requires two icon sizes:
- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)

### Quick Icon Generation

You can generate these from an existing logo/image using ImageMagick or online tools:

```bash
# Using ImageMagick
convert your-logo.png -resize 192x192 public/icon-192x192.png
convert your-logo.png -resize 512x512 public/icon-512x512.png
```

Or use online tools:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

### PWA Features Implemented

✅ Service Worker with offline support
✅ Web App Manifest
✅ Offline fallback page
✅ Install prompt support
✅ Caching strategy (network-first, cache fallback)
✅ Automatic service worker registration

### Testing PWA

1. Run production build: `npm run build && npm start`
2. Open Chrome DevTools → Application tab
3. Check "Service Workers" and "Manifest" sections
4. Test offline mode by enabling "Offline" in Network tab

### Manifest Configuration

The manifest is located at `/public/manifest.json` and can be customized:
- App name and short name
- Theme colors
- Icon sizes
- Shortcuts
- Display mode
