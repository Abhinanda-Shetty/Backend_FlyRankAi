import { getBookUrls } from "./catalogue.js";
import { getHtml } from "./fetcher.js";
import { parseBook } from "./extract.js";

// ".../a-light-in-the-attic_1000/index.html" -> "a-light-in-the-attic_1000"
function slug(url) {
  return url.split("/").at(-2);
}

const { books } = await getBookUrls();
const rawRecords = [];

for (const [url, sourcePage] of books) {
  const html = await getHtml(url, `book-${slug(url)}.html`);
  rawRecords.push(parseBook(html, url, sourcePage));
}

console.log(JSON.stringify(rawRecords[0], null, 2));
console.log(`detail_pages=${rawRecords.length}`);
