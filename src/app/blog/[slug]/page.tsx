import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchPostBySlug, fetchPublishedPosts } from "../actions";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await fetchPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) notFound();

  return (
    <>
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
                <span>By {post.author}</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* COVER IMAGE */}
      {post.coverImageUrl && (
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.body}
            </ReactMarkdown>
          </div>

          {/* Back link */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-brand-teal font-semibold hover:text-brand-navy transition-colors"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </section>

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
              className="inline-block bg-brand-orange text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
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
