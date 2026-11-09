import { fetchPage } from "./fetcher.js";

const CATALOGUE_URL = "https://books.toscrape.com/";
async function main() {
  try {
    const html = await fetchPage(CATALOGUE_URL, "catalogue-page-1.html");
    console.log("\nStage 1 completed successfully.");
    console.log(`HTML received: ${html.length} characters`);
  } catch (error) {
    console.error("Scraper failed:", error.message);
    process.exitCode = 1;
  }
}

main();
