// Takes the entry's screenshots: serves game/ on localhost, renders each ?shot= scene
// in headless Chromium at 1280x800, and converts the captures to JPEGs under 256 KiB in
// screenshots/. Run with: node shots.mjs
// Chromium runs asynchronously: a blocking spawn would stall this process's own server.
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, 'game');
const shots = JSON.parse(readFileSync(join(here, 'shots.json'), 'utf8'));
const chromium = `${process.env.HOME}/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`;
const outDir = join(here, 'screenshots');
mkdirSync(outDir, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const file = join(root, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});

function runChromium(url, pngPath) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(chromium, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--user-data-dir=/tmp/chrome-shot-profile',
      '--window-size=1280,800',
      `--screenshot=${pngPath}`,
      url,
    ], { stdio: 'ignore' });
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      rejectPromise(new Error(`Chromium timed out for ${url}`));
    }, 45000);
    child.on('error', (error) => {
      clearTimeout(timer);
      rejectPromise(error);
    });
    child.on('exit', (code) => {
      clearTimeout(timer);
      if (code !== 0) rejectPromise(new Error(`Chromium exited ${code} for ${url}`));
      else resolvePromise();
    });
  });
}

function toJpeg(pngPath, jpegPath) {
  // Convert with Pillow, dropping quality until the file fits the 256 KiB cap.
  for (const quality of [85, 75, 65, 55]) {
    const code = [
      'from PIL import Image',
      `img = Image.open(${JSON.stringify(pngPath)}).convert('RGB')`,
      `img.save(${JSON.stringify(jpegPath)}, 'JPEG', quality=${quality})`,
    ].join('\n');
    const result = spawnSync('python3', ['-c', code], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(`PIL failed: ${result.stderr}`);
    if (statSync(jpegPath).size <= 262144) return quality;
  }
  throw new Error(`${jpegPath} still over 256 KiB at quality 55`);
}

await new Promise((resolvePromise) => server.listen(0, '127.0.0.1', resolvePromise));
const port = server.address().port;
try {
  for (const shot of shots) {
    const png = join(tmpdir(), `odd-twin-${shot.name}.png`);
    await runChromium(`http://127.0.0.1:${port}/${shot.query}`, png);
    const quality = toJpeg(png, join(outDir, shot.name));
    const bytes = statSync(join(outDir, shot.name)).size;
    console.log(`${shot.name}: ${bytes} bytes (jpeg q${quality})`);
  }
  console.log('All screenshots taken.');
} finally {
  server.close();
}
