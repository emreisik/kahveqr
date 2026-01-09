// Simple PWA icon generator using Canvas (Node.js or browser)
// For production, use professional icon tools or design software

import { existsSync, writeFileSync } from 'fs';

// Check if icons already exist
const iconFiles = [
  'public/icon-192x192.png',
  'public/icon-512x512.png',
  'public/apple-touch-icon.png',
  'public/favicon-32x32.png',
  'public/favicon-16x16.png'
];

const allIconsExist = iconFiles.every(file => existsSync(file));

if (allIconsExist) {
  console.log('✅ PWA icons already exist, skipping generation');
  process.exit(0);
}

// Try to generate icons only if canvas is available
let canvas;
try {
  const canvasModule = await import('canvas');
  canvas = canvasModule.default;
} catch (error) {
  console.log('⚠️  Canvas module not available (expected in CI/CD)');
  console.log('✅ PWA icons should be pre-generated and committed to git');
  process.exit(0);
}

function generateIcon(size, filename) {
  const canvasElement = canvas.createCanvas(size, size);
  const ctx = canvasElement.getContext('2d');

  // Background gradient (orange theme)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#f97316');
  gradient.addColorStop(1, '#ea580c');
  ctx.fillStyle = gradient;
  
  // Rounded rectangle
  const radius = size * 0.1;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Coffee emoji (centered)
  ctx.font = `${size * 0.55}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white';
  ctx.fillText('☕', size / 2, size / 2);

  // Save
  const buffer = canvasElement.toBuffer('image/png');
  writeFileSync(filename, buffer);
  console.log(`✅ Generated: ${filename}`);
}

// Generate icons
try {
  generateIcon(192, 'public/icon-192x192.png');
  generateIcon(512, 'public/icon-512x512.png');
  generateIcon(180, 'public/apple-touch-icon.png');
  generateIcon(32, 'public/favicon-32x32.png');
  generateIcon(16, 'public/favicon-16x16.png');
  console.log('\n🎉 All PWA icons generated successfully!');
} catch (error) {
  console.error('❌ Error generating icons:', error.message);
  console.log('\n💡 Alternative: Open http://localhost:5173/icon-generator.html in your browser');
  console.log('   and manually download the icons.');
  process.exit(1);
}

