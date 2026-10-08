import fs from "node:fs";
import path from "node:path";
import type { BlogPost } from "@/app/blog/actions";

// Markdown posts kept in the repo (content/blog/*.md). They are merged into the
// same blog as the Monday.com posts. A post whose frontmatter `status` starts
// with "draft" is only visible on previews and local builds, never in production.

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");
const PUBLIC_DIR = path.join(process.cwd(), "public");

function parseValue(raw: string): string | string[] {
  const v = raw.trim();
  if (v.startsWith('"')) {
    const end = v.indexOf('"', 1);
    return end > 0 ? v.slice(1, end) : v.slice(1);
  }
  const noComment = v.replace(/\s+#.*$/, "").trim();
  if (noComment.startsWith("[") && noComment.endsWith("]")) {
    return noComment
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return noComment;
}

function parseFrontmatter(src: string): { data: Record<string, string | string[]>; body: string } {
  const match = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: src };
  const data: Record<string, string | string[]> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
    if (kv) data[kv[1]] = parseValue(kv[2]);
  }
  return { data, body: match[2] };
}

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(", ") : v ?? "");
const publicFileExists = (p: string) => !!p && fs.existsSync(path.join(PUBLIC_DIR, p));

export function readLocalPosts(): BlogPost[] {
  let files: string[] = [];
  try {
    files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }

  const showDrafts = process.env.VERCEL_ENV !== "production";
  const posts: BlogPost[] = [];

  for (const file of files) {
    const { data, body } = parseFrontmatter(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"));
    const slug = str(data.slug);
    if (!slug) continue;

    const draft = str(data.status).toLowerCase().startsWith("draft");
    if (draft && !showDrafts) continue;

    // Internal HOLD notes live in HTML comments and must never be rendered.
    const cleanBody = body.replace(/<!--[\s\S]*?-->/g, "").replace(/\n{3,}/g, "\n\n").trim();

    // The brand graphic is dropped into public/images/blog later; only use it once it exists.
    const hero = str(data.heroImage);
    const hero2x = hero.replace(/(\.\w+)$/, "@2x$1");
    const hasHero = publicFileExists(hero);

    posts.push({
      id: `local-${slug}`,
      title: str(data.title),
      slug,
      excerpt: str(data.excerpt),
      body: cleanBody,
      coverImageUrl: hasHero ? hero : "",
      coverImageHiRes: hasHero && publicFileExists(hero2x) ? hero2x : undefined,
      author: str(data.author) || "Tshiamiso Astronauts",
      authorRole: str(data.authorRole) || undefined,
      category: str(data.category),
      publishedDate: str(data.publishDate),
      published: true,
      draft,
      seoDescription: str(data.seoDescription) || undefined,
      heroAlt: str(data.heroAlt) || undefined,
      readingTime: str(data.readingTime) || undefined,
      tags: Array.isArray(data.tags) ? data.tags : undefined,
    });
  }
  return posts;
}
