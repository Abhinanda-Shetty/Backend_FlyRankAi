import fs from "node:fs/promises";
import path from "node:path";

const CACHE_DIR = path.resolve("cache");

const USER_AGENT =
  "FlyRankInternship-A9/1.0 (+https://github.com/Abhinanda-Shetty/Backend_FlyRankAi)";

export async function fetchPage(url, filename) {
  await fs.mkdir(CACHE_DIR, { recursive: true });

  const cachePath = path.join(CACHE_DIR, filename);
  // 1. Reuse cached HTML if available
  try {
    const cachedHTML = await fs.readFile(cachePath, "utf-8");

    console.log(`CACHE HIT: ${url}`);
    console.log(`Size: ${Buffer.byteLength(cachedHTML)} bytes`);

    return cachedHTML;
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  // 2. Fetch from the website
  console.log(`FETCH: ${url}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(20000),
  });

  // 3. Only accept HTTP 200
  if (response.status !== 200) {
    throw new Error(`HTTP error: ${response.status} for ${url}`);
  }

  // 4. Read and save HTML
  const html = await response.text();

  await fs.writeFile(cachePath, html, "utf-8");

  console.log(`Saved: ${cachePath}`);
  console.log(`Size: ${Buffer.byteLength(html)} bytes`);

  return html;
}
