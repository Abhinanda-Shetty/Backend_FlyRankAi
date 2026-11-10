import * as cheerio from "cheerio";

export function cleanPrice(priceText) {
  // "£51.77" -> 51.77
  return Number(priceText.replace("£", "").trim());
}

export function parseBook(html, productUrl, sourcePage) {
  const $ = cheerio.load(html);
  const product = $("article.product_page");

  const title = product.find("h1").text().trim();
  const priceText = product.find("p.price_color").first().text().trim();

  const availabilityText = product
    .find("p.availability")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  const ratingClass = product.find("p.star-rating").attr("class");
  const ratingText = ratingClass.split(" ").find((c) => c !== "star-rating");

  const descTag = product.find("#product_description").next("p");
  const description = descTag.length ? descTag.text().trim() : null;

  return {
    title,
    product_url: productUrl,
    price_text: priceText,
    availability_text: availabilityText,
    rating_text: ratingText,
    description,
    source_page: sourcePage,
    fetched_at: new Date().toISOString(),
  };
}
