import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchPostBySlug, fetchPublishedPosts } from "../actions";
import { formatDate } from "@/lib/formatDate";
import BlogSubscribeCard from "@/components/subscribe/BlogSubscribeCard";
import SubscribePopup from "@/components/subscribe/SubscribePopup";

export const revalidate = 3600;

const SITE_URL = "https://tshiamisoastronauts.org";

export async function generateStaticParams() {
  try {
    const posts = await fetchPublishedPosts();
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await fetchPostBySlug(slug);
    if (!post) return {};
    const image = post.coverImageUrl || "/images/social/social-media.png";
    const title = `${post.title} | Tshiamiso Astronauts`;
    const description =
      post.seoDescription || post.excerpt || "Read this story from the Tshiamiso Astronauts community in Evaton West.";
    const url = `${SITE_URL}/blog/${slug}`;
    return {
      title,
      description,
      alternates: { canonical: url },
      ...(post.draft ? { robots: { index: false, follow: false } } : {}),
      openGraph: {
        title,
        description,
        url,
        siteName: "Tshiamiso Astronauts NPC",
        images: [{ url: image, width: 1200, height: 630, alt: post.heroAlt || post.title }],
        locale: "en_ZA",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = await fetchPostBySlug(slug);
  } catch (err) {
    console.error("[Blog] Failed to fetch post:", err);
    notFound();
  }

  if (!post) notFound();

  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const shareLinks = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${post.title} ${postUrl}`)}` },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    datePublished: post.publishedDate || undefined,
    mainEntityOfPage: postUrl,
    image: post.coverImageUrl
      ? post.coverImageUrl.startsWith("http")
        ? post.coverImageUrl
        : `${SITE_URL}${post.coverImageUrl}`
      : undefined,
    inLanguage: "en-ZA",
    keywords: post.tags?.join(", "),
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "Tshiamiso Astronauts NPC", url: SITE_URL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {post.draft && (
        <div className="bg-brand-orange text-white text-center text-sm font-bold px-6 py-2">
          DRAFT preview: not public. Awaiting the President&apos;s approval.
        </div>
      )}
      {/* HERO */}
      <section className="bg-gradient-to-br from-brand-navy to-brand-teal py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          {post.category && (
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-light-teal mb-4">
              {post.category}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-gray-300 text-sm">
            {post.publishedDate && <span>{formatDate(post.publishedDate)}</span>}
            {post.author && (
              <>
                <span className="text-gray-500">·</span>
                <span>
                  By {post.author}
                  {post.authorRole ? `, ${post.authorRole}` : ""}
                </span>
              </>
            )}
            {post.readingTime && (
              <>
                <span className="text-gray-500">·</span>
                <span>{post.readingTime} read</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* COVER IMAGE */}
      {post.coverImageUrl && post.heroAlt && (
        <div className="max-w-4xl mx-auto px-6 pt-10 bg-white">
          <Image
            src={post.coverImageHiRes || post.coverImageUrl}
            alt={post.heroAlt}
            width={1200}
            height={630}
            sizes="(max-width: 896px) 100vw, 896px"
            className="w-full h-auto rounded-xl"
            priority
          />
        </div>
      )}
      {post.coverImageUrl && !post.heroAlt && (
        <div className="relative w-full max-h-96 overflow-hidden bg-gray-100">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            width={1200}
            height={480}
            className="w-full object-cover max-h-96"
            priority
          />
        </div>
      )}

      {/* ARTICLE BODY */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          {/* Excerpt / lead */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed mb-10 font-medium border-l-4 border-brand-orange pl-5">
              {post.excerpt}
            </p>
          )}

          {/* Body content */}
          <div className="prose prose-lg prose-headings:text-brand-navy prose-a:text-brand-teal prose-strong:text-brand-navy prose-img:rounded-xl max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children }) => (
                  <div className="overflow-x-auto">
                    <table>{children}</table>
                  </div>
                ),
              }}
            >
              {post.body}
            </ReactMarkdown>
          </div>

          {/* Supported by */}
          {post.partners && post.partners.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-teal mb-4">Supported by</p>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                {post.partners.map(({ name, logo }) => (
                  <Image key={name} src={logo} alt={name} width={320} height={160} className="h-24 w-auto object-contain" />
                ))}
              </div>
            </div>
          )}

          {/* Subscribe */}
          <BlogSubscribeCard />

          {/* Share + partner */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-brand-navy">Share:</span>
              {shareLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-brand-teal border border-brand-teal rounded-full px-4 py-1.5 hover:bg-brand-teal hover:text-white transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
            <Link
              href="/contact"
              className="inline-block text-center bg-brand-navy text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Partner with us
            </Link>
          </div>

          {/* Back link */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-brand-teal font-semibold hover:text-brand-navy transition-colors"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </section>

      <SubscribePopup />

      {/* CTA STRIP */}
      <section className="py-16 px-6 bg-brand-navy">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
          <div className="bg-white/10 rounded-2xl p-8">
            <h3 className="text-white font-bold text-xl mb-2">Support Our Work</h3>
            <p className="text-gray-300 text-sm mb-6">
              Your donation funds books, tutors, and digital access for learners in Evaton West.
            </p>
            <Link
              href="/donate"
              className="inline-block bg-brand-orange text-brand-navy font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Donate Now
            </Link>
          </div>
          <div className="bg-white/10 rounded-2xl p-8">
            <h3 className="text-white font-bold text-xl mb-2">Get Involved</h3>
            <p className="text-gray-300 text-sm mb-6">
              Volunteer your time and skills to help children discover the power of reading.
            </p>
            <Link
              href="/volunteer"
              className="inline-block bg-brand-teal text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Volunteer
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
