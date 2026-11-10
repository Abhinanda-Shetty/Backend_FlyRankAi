import { z } from "zod";

export const Book = z.object({
  title: z.string().min(1),
  product_url: z.string().startsWith("https://"),
  price_text: z.string(),
  price_gbp: z.number().positive(),
  availability_text: z.string(),
  rating_text: z.string(),
  description: z.string().nullable(),
  source_page: z.string().startsWith("https://"),
  fetched_at: z.string(),
});
