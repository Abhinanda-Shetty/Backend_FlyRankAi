import fs from "node:fs";
import path from "node:path";

const USER_AGENT =
  "FlyRankInternshipA9/1.0 (+https://github.com/Abhinanda-Shetty/Backend_FlyRankAi)";
const TIMEOUT_MS = 10000;
const DELAY_MS = 600;
const RETRY_WAIT_MS = 2000;
const CACHE_DIR = "cache";

export const STATS = { pagesFetched: 0, cacheHits: 0 };

let lastRequestTime = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitPolitely() {
  const wait = DELAY_MS - (Date.now() - lastRequestTime);
  if (wait > 0) await sleep(wait);
  lastRequestTime = Date.now();
}

// Real request. Retries ONCE on timeout / network error / 5xx.
async function download(url) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    await waitPolitely();

    let response;
    try {
      response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      // timeout or network error
      if (attempt === 2) throw err;
      await sleep(RETRY_WAIT_MS);
      continue;
    }

    if (response.status === 200) {
      return await response.text();
    }

    if (response.status >= 500 && attempt === 1) {
      await sleep(RETRY_WAIT_MS);
      continue;
    }

    // 404, 403, or a second 5xx: do NOT retry
    throw new Error(`Bad status ${response.status} for ${url}`);
  }
}

export async function getHtml(url, cacheName) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const filePath = path.join(CACHE_DIR, cacheName);

  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, "utf-8");
    STATS.cacheHits++;
    console.log(`CACHE HIT ${cacheName} (${html.length} chars)`);
    return html;
  }

  const html = await download(url);
  STATS.pagesFetched++;

  fs.writeFileSync(filePath, html, "utf-8");
  console.log(`FETCH ${cacheName} (${html.length} chars)`);
  return html;
}
