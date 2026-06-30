const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcIcon = "C:\\Users\\Mike\\.gemini\\antigravity\\brain\\59d75276-a3ee-4863-9978-3374264fb627\\holy_scriptures_icon_1782736520148.png";
const resDir = "C:\\Users\\Mike\\Desktop\\holy-scriptures-app\\android\\app\\src\\main\\res";

const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

async function generate() {
  for (const [folder, size] of Object.entries(sizes)) {
    const outDir = path.join(resDir, folder);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    
    // 1. Regular legacy launcher icon (circle masked or square)
    await sharp(srcIcon)
      .resize(size, size)
      .toFile(path.join(outDir, 'ic_launcher.png'));
      
    // 2. Round launcher icon
    // Create a circular crop for round launcher
    const radius = size / 2;
    const circleSvg = `<svg><circle cx="${radius}" cy="${radius}" r="${radius}" fill="black"/></svg>`;
    await sharp(srcIcon)
      .resize(size, size)
      .composite([{
        input: Buffer.from(circleSvg),
        blend: 'dest-in'
      }])
      .toFile(path.join(outDir, 'ic_launcher_round.png'));

    // 3. Adaptive foreground launcher icon (keep center 72/108 of base size, i.e., 66% width)
    // For adaptive icons, total resource viewport is 108dp, active zone is central 72dp.
    // The sizes here are mipmaps at 108dp base (mdpi=108, hdpi=162, xhdpi=216, xxhdpi=324, xxxhdpi=432)
    // We can scale the core image down to 66% to avoid clipping in adaptive modes.
    const adaptiveSize = Math.round(size * 1.5); // 108dp is 1.5x of legacy 72dp active size (48 -> 108, 192 -> 432)
    const activeSize = Math.round(adaptiveSize * 0.66);
    
    await sharp(srcIcon)
      .resize(activeSize, activeSize)
      .extend({
        top: Math.round((adaptiveSize - activeSize) / 2),
        bottom: Math.round((adaptiveSize - activeSize) / 2),
        left: Math.round((adaptiveSize - activeSize) / 2),
        right: Math.round((adaptiveSize - activeSize) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent background for foreground layer
      })
      .resize(adaptiveSize, adaptiveSize) // Ensure exact dimensions
      .toFile(path.join(outDir, 'ic_launcher_foreground.png'));
  }
  console.log("All app icons updated successfully!");
}

generate().catch(console.error);
