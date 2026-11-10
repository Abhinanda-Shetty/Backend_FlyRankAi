import fs from "node:fs";
import { getBookUrls } from "./catalogue.js";
import { getHtml, STATS } from "./fetcher.js";
import { parseBook, cleanPrice } from "./extract.js";
import { Book } from "./schema.js";

function slug(url) {
  return url.split("/").at(-2);
}

const startedAt = new Date();
const { books } = await getBookUrls();

// Test only: run with `node src/index.js --fake` to add one made-up URL
if (process.argv.includes("--fake")) {
  books.push([
    "https://books.toscrape.com/catalogue/this-book-does-not-exist_9999/index.html",
    "https://books.toscrape.com/catalogue/page-1.html",
  ]);
}

const good = new Map();
const errors = [];
const failedPages = [];

for (const [url, sourcePage] of books) {
  try {
    const html = await getHtml(url, `book-${slug(url)}.html`);
    const raw = parseBook(html, url, sourcePage);
    raw.price_gbp = cleanPrice(raw.price_text);

    const result = Book.safeParse(raw);
    if (result.success) {
      good.set(result.data.product_url, result.data);
    } else {
      const reason = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      errors.push({ url, reason });
    }
  } catch (err) {
    // One broken page is logged and skipped, the loop keeps going.
    console.log(`FAILED ${url}: ${err.message}`);
    failedPages.push({ url, reason: err.message });
  }
}

fs.mkdirSync("output", { recursive: true });
fs.writeFileSync(
  "output/books.json",
  JSON.stringify([...good.values()], null, 2)
);
fs.writeFileSync("output/errors.json", JSON.stringify(errors, null, 2));

const report = {
  started_at: startedAt.toISOString(),
  duration_seconds: Number(
    ((Date.now() - startedAt.getTime()) / 1000).toFixed(1)
  ),
  pages_fetched: STATS.pagesFetched,
  cache_hits: STATS.cacheHits,
  valid_records: good.size,
  invalid_records: errors.length,
  failed_pages: failedPages.length,
  failed_urls: failedPages,
};
fs.writeFileSync("output/run-report.json", JSON.stringify(report, null, 2));

console.log(report);
