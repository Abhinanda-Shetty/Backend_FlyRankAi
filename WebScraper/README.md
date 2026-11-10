# The Polite Scraper

A small scraping pipeline: fetch → extract → normalize → validate → store → report.

## Target classification
- **Site:** https://books.toscrape.com (part of toscrape.com)
- **Why:** toscrape.com says it is a sandbox built for people to practise scraping.
- **How much:** first 3 catalogue pages only (60 books).
- **Data collected:** title, price, availability, rating, description, URL.
- **robots.txt result:** (your result from Stage 0)
- **Why appropriate:** it is a public practice site made for exactly this purpose.

I will not reuse this code on another site without checking its rules and terms first.

## Lane and install
JavaScript lane: Node.js 20+, built-in fetch, Cheerio, Zod.

```bash
npm install
```

## Run
```bash
node src/index.js
```
Outputs: `output/books.json`, `output/errors.json`, `output/run-report.json`.

## Record schema
| Field | Type | Notes |
|---|---|---|
| title | string | required |
| product_url | string | absolute https URL, the record's identity |
| price_text | string | original text, e.g. "£51.77" |
| price_gbp | number | cleaned, must be > 0 |
| availability_text | string | whitespace cleaned |
| rating_text | string | e.g. "Three" |
| description | string or null | null if the page has none |
| source_page | string | catalogue page where the book was found |
| fetched_at | string | UTC timestamp (provenance) |

## Politeness rules
- Honest user-agent: `FlyRankInternshipA9/1.0 (+repo link)`
- At least 600 ms between real requests
- 10 second timeout on every request
- Status code checked, only 200 is parsed
- HTML cached in `cache/`, development reads from the cache
- One retry on timeout or 5xx, never on 404 or 403

## Run report (real run)
```json
PASTE YOUR output/run-report.json HERE
```

## Why no browser?
The data is already in the HTML the server sends, so a browser would only add cost.

## Limitation
Only the first 3 catalogue pages are scraped, and the selectors will break if the site changes its HTML.

## Ethics note
Use an official API when one exists. Never bypass logins, paywalls or blocks. Collect only what you need.