import { getBookUrls } from "./catalogue.js";

const { books, pages } = await getBookUrls();
const unique = new Set(books.map(([url]) => url)).size;

console.log(
  `catalogue_pages=${pages}, discovered=${books.length}, unique_urls=${unique}`
);
