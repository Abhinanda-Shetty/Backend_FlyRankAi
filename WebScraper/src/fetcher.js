import fs from "node:fs/promises";
import path from "node:path";

const CACHE_DIR = path.resolve("cache");

const USER_AGENT =
  "FlyRankInternship-A9/1.0 (+https://github.com/Abhinanda-Shetty/Backend_FlyRankAi)";

export async function fetchPage(url, filename) {
  await fs.mkdir(CACHE_DIR, { recursive: true });

  const cachePath = path.join(CACHE_DIR, filename);

  // 1. Check cache
  try {
    const cachedHTML = await fs.readFile(cachePath, "utf-8");

    console.log(`CACHE HIT: ${url}`);
    console.log(`Size: ${Buffer.byteLength(cachedHTML)} bytes`);

    return {
      html: cachedHTML,
      fetchedAt: new Date().toISOString(),
      cacheHit: true,
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  // 2. Fetch website
  console.log(`FETCH: ${url}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(25000),
  });

  // 3. Check HTTP status
  if (response.status !== 200) {
    throw new Error(`HTTP error: ${response.status} for ${url}`);
  }

  // 4. Read and cache HTML
  const html = await response.text();
  const fetchedAt = new Date().toISOString();

  await fs.writeFile(cachePath, html, "utf-8");

  console.log(`Saved: ${cachePath}`);
  console.log(`Size: ${Buffer.byteLength(html)} bytes`);

  return {
    html,
    fetchedAt,
    cacheHit: false,
  };
}
