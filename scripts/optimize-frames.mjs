import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const FRAMES_DIR = path.join(ROOT_DIR, 'frames');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

async function convertFrames() {
  console.log('--- Starting Canvas Frame Conversion to WebP ---');
  const files = fs.readdirSync(FRAMES_DIR).filter(f => /^frame_\d+\.jpg$/i.test(f));
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  console.log(`Found ${files.length} frames to convert.`);

  let totalOrigBytes = 0;
  let totalWebpBytes = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const srcPath = path.join(FRAMES_DIR, file);
    const destName = file.replace(/\.jpg$/i, '.webp');
    const destPath = path.join(FRAMES_DIR, destName);

    const origStat = fs.statSync(srcPath);
    totalOrigBytes += origStat.size;

    await sharp(srcPath)
      .webp({ quality: 82, effort: 4 })
      .toFile(destPath);

    const webpStat = fs.statSync(destPath);
    totalWebpBytes += webpStat.size;

    if ((i + 1) % 25 === 0 || i === files.length - 1) {
      console.log(`Processed ${i + 1}/${files.length} frames...`);
    }
  }

  const origMB = (totalOrigBytes / (1024 * 1024)).toFixed(2);
  const webpMB = (totalWebpBytes / (1024 * 1024)).toFixed(2);
  const savingsPct = (((totalOrigBytes - totalWebpBytes) / totalOrigBytes) * 100).toFixed(1);

  console.log(`\nFrame conversion complete:`);
  console.log(`Original: ${origMB} MB -> WebP: ${webpMB} MB (Saved ${savingsPct}%)`);

  // Also convert avatar
  const avatarJpg = path.join(ASSETS_DIR, 'shahriar-avatar.jpg');
  const avatarWebp = path.join(ASSETS_DIR, 'shahriar-avatar.webp');
  if (fs.existsSync(avatarJpg)) {
    await sharp(avatarJpg)
      .webp({ quality: 85 })
      .toFile(avatarWebp);
    console.log(`Converted avatar to WebP: ${fs.statSync(avatarWebp).size} bytes`);
  }
}

convertFrames().catch(err => {
  console.error('Conversion failed:', err);
  process.exit(1);
});
