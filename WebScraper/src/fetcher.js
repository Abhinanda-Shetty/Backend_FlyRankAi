import fs from "node:fs";
import path from "node:path";

const USER_AGENT =
  "FlyRankInternshipA9/1.0 (+https://github.com/Abhinanda-Shetty/Backend_FlyRankAi)";
const TIMEOUT_MS = 10000;
const DELAY_MS = 600; // pause between real requests (rule: at least 500)
const CACHE_DIR = "cache";

let lastRequestTime = 0;

async function waitPolitely() {
  const wait = DELAY_MS - (Date.now() - lastRequestTime);
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  lastRequestTime = Date.now();
}

export async function getHtml(url, cacheName) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const filePath = path.join(CACHE_DIR, cacheName);

  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, "utf-8");
    console.log(`CACHE HIT ${cacheName} (${html.length} chars)`);
    return html;
  }

  await waitPolitely();
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (response.status !== 200) {
    throw new Error(`Bad status ${response.status} for ${url}`);
  }

  const html = await response.text();
  fs.writeFileSync(filePath, html, "utf-8");
  console.log(`FETCH ${cacheName} (${html.length} chars)`);
  return html;
}
