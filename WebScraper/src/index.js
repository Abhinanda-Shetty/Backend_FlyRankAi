import fs from "node:fs";
import { getBookUrls } from "./catalogue.js";
import { getHtml } from "./fetcher.js";
import { parseBook, cleanPrice } from "./extract.js";
import { Book } from "./schema.js";

function slug(url) {
  return url.split("/").at(-2);
}

const { books } = await getBookUrls();

const good = new Map(); // product_url -> clean record (a Map means no duplicates)
const errors = [];

for (const [url, sourcePage] of books) {
  const html = await getHtml(url, `book-${slug(url)}.html`);
  const raw = parseBook(html, url, sourcePage);
  raw.price_gbp = cleanPrice(raw.price_text);

  const result = Book.safeParse(raw); // validate
  if (result.success) {
    good.set(result.data.product_url, result.data);
  } else {
    const reason = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    errors.push({ url, reason });
  }
}

fs.mkdirSync("output", { recursive: true });
fs.writeFileSync(
  "output/books.json",
  JSON.stringify([...good.values()], null, 2)
);
fs.writeFileSync("output/errors.json", JSON.stringify(errors, null, 2));

console.log(`valid=${good.size} invalid=${errors.length}`);
