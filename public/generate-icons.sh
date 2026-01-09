#!/bin/bash
# Generate PWA icons using ImageMagick (if available) or Node.js canvas

# Create a simple SVG icon
cat > /tmp/kahveqr-icon.svg << 'SVGEOF'
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ea580c;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad)" rx="50"/>
  <text x="256" y="330" font-size="280" text-anchor="middle" fill="white">☕</text>
</svg>
SVGEOF

echo "SVG icon created at /tmp/kahveqr-icon.svg"
echo "Please convert it using one of these methods:"
echo "1. Open /tmp/kahveqr-icon.svg in browser and use public/icon-generator.html"
echo "2. Use ImageMagick: convert /tmp/kahveqr-icon.svg -resize 512x512 public/icon-512x512.png"
echo "3. Use online tool: https://realfavicongenerator.net/"
