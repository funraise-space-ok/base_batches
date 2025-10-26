/*
  Convert all PNGs under public/pls to WebP with quality 80.
  Usage: node scripts/convert-pls-to-webp.cjs
*/

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const PLS_DIR = path.join(ROOT, 'public', 'pls');

async function main() {
  if (!fs.existsSync(PLS_DIR)) {
    console.error('Directory not found:', PLS_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(PLS_DIR).filter(f => f.toLowerCase().endsWith('.png'));
  if (files.length === 0) {
    console.log('No PNG files found in', PLS_DIR);
    return;
  }

  console.log(`Converting ${files.length} PNG files to WebP...`);
  let converted = 0;
  for (const file of files) {
    const src = path.join(PLS_DIR, file);
    const dst = path.join(PLS_DIR, file.replace(/\.png$/i, '.webp'));
    try {
      const buf = fs.readFileSync(src);
      const image = sharp(buf, { limitInputPixels: false });
      await image.webp({ quality: 80 }).toFile(dst);
      converted++;
      console.log('✅', path.basename(dst));
    } catch (e) {
      console.warn('⚠️ Failed to convert', file, e.message);
    }
  }
  console.log(`Done. Converted ${converted}/${files.length} files.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
