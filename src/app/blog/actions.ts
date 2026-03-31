"use server";

import { cache } from "react";

// ── Column IDs ────────────────────────────────────────────────────────────────
// Blog Posts board (5093847699)
const BLOG_SLUG        = "text_mm1w2qxa";
const BLOG_EXCERPT     = "long_text_mm1wem2j";
const BLOG_BODY        = "long_text_mm1wxx50";
const BLOG_COVER       = "text_mm1wxff3";
const BLOG_AUTHOR      = "text_mm1wefrw";
const BLOG_CATEGORY    = "text_mm1wjjc7";
const BLOG_DATE        = "date_mm1wr6tt";
const BLOG_PUBLISHED   = "boolean_mm1wc26t";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  author: string;
  category: string;
  publishedDate: string; // "YYYY-MM-DD"
  published: boolean;
}

const fetchAllPosts = cache(async function fetchAllPosts(): Promise<BlogPost[]> {
  const token   = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_BLOG_BOARD_ID;

  if (!token || !boardId) {
    console.error("[Blog] Missing MONDAY_API_TOKEN or MONDAY_BLOG_BOARD_ID");
    return [];
  }

  const query = `{
    boards(ids: [${boardId}]) {
      items_page(limit: 100) {
        items {
          id
          name
          column_values(ids: [
            "${BLOG_SLUG}", "${BLOG_EXCERPT}", "${BLOG_BODY}",
            "${BLOG_COVER}", "${BLOG_AUTHOR}", "${BLOG_CATEGORY}",
            "${BLOG_DATE}", "${BLOG_PUBLISHED}"
          ]) {
            id
            text
            value
          }
        }
      }
    }
  }`;

  const res = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "API-Version": "2024-01",
    },
    body: JSON.stringify({ query }),
    next: { revalidate: 3600 },
  });

  const json = await res.json();
  const items = json.data?.boards?.[0]?.items_page?.items ?? [];

  return items.map((item: Record<string, unknown>) => {
    const cols = item.column_values as Array<{ id: string; text: string; value: string }>;
    const col  = (id: string) => cols.find((c) => c.id === id);

    const publishedValue = col(BLOG_PUBLISHED)?.value;
    const published = publishedValue ? JSON.parse(publishedValue)?.checked === true : false;

    return {
      id:            item.id as string,
      title:         item.name as string,
      slug:          col(BLOG_SLUG)?.text ?? "",
      excerpt:       col(BLOG_EXCERPT)?.text ?? "",
      body:          col(BLOG_BODY)?.text ?? "",
      coverImageUrl: col(BLOG_COVER)?.text ?? "",
      author:        col(BLOG_AUTHOR)?.text ?? "Tshiamiso Astronauts",
      category:      col(BLOG_CATEGORY)?.text ?? "",
      publishedDate: col(BLOG_DATE)?.text ?? "",
      published,
    };
  });
});

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  const posts = await fetchAllPosts();
  return posts
    .filter((p) => p.published && p.slug)
    .sort((a, b) => (a.publishedDate > b.publishedDate ? -1 : 1)); // newest first
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await fetchAllPosts();
  return posts.find((p) => p.slug === slug && p.published) ?? null;
}
