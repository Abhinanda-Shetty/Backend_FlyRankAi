import * as cheerio from "cheerio";
import { fetchPage } from "./fetcher.js";

const START_URL = "https://books.toscrape.com/";

export async function discoverBooks() {
  let currentUrl = START_URL;

  const bookMap = new Map();
  const cataloguePages = [];

  for (let pageNumber = 1; pageNumber <= 3; pageNumber++) {
    const { html } = await fetchPage(
      currentUrl,
      `catalogue-page-${pageNumber}.html`
    );

    const $ = cheerio.load(html);

    cataloguePages.push(currentUrl);

    // Discover every book link on this catalogue page
    $("article.product_pod h3 a").each((_, element) => {
      const href = $(element).attr("href");

      if (!href) return;

      const absoluteUrl = new URL(href, currentUrl).href;

      bookMap.set(absoluteUrl, {
        productUrl: absoluteUrl,
        sourcePage: currentUrl,
      });
    });

    // Follow the website's own Next link
    if (pageNumber < 3) {
      const nextHref = $("li.next a").attr("href");

      if (!nextHref) {
        throw new Error(`Next link missing on page ${pageNumber}`);
      }

      currentUrl = new URL(nextHref, currentUrl).href;
    }
  }

  const books = [...bookMap.values()];

  console.log(`catalogue_pages=${cataloguePages.length}`);
  console.log(`discovered=${books.length}`);
  console.log(`unique_urls=${bookMap.size}`);

  return books;
}
