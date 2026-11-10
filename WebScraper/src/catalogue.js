import * as cheerio from "cheerio";
import { getHtml } from "./fetcher.js";

const FIRST_PAGE = "https://books.toscrape.com/catalogue/page-1.html";
const MAX_PAGES = 3;

export async function getBookUrls() {
  const found = new Map(); // bookUrl -> sourcePage (a Map removes duplicates)
  let pageUrl = FIRST_PAGE;
  let pages = 0;

  while (pageUrl && pages < MAX_PAGES) {
    pages++;
    const html = await getHtml(pageUrl, `catalogue-page-${pages}.html`);
    const $ = cheerio.load(html);

    $("article.product_pod h3 a").each((_, el) => {
      const absolute = new URL($(el).attr("href"), pageUrl).href;
      if (!found.has(absolute)) {
        found.set(absolute, pageUrl);
      }
    });

    const nextHref = $("li.next a").attr("href");
    pageUrl = nextHref ? new URL(nextHref, pageUrl).href : null;
  }

  return { books: [...found.entries()], pages };
}
