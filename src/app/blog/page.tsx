import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { fetchPublishedPosts, type BlogPost } from "./actions";
import { formatDate } from "@/lib/formatDate";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog | Tshiamiso Astronauts",
  description:
    "News, stories, and reflections from the Tshiamiso Astronauts community in Evaton West, Gauteng.",
  openGraph: {
    title: "Blog | Tshiamiso Astronauts",
    description:
      "News, stories, and reflections from the Tshiamiso Astronauts community in Evaton West, Gauteng.",
    url: "https://tshiamisoastronauts.org/blog",
    siteName: "Tshiamiso Astronauts NPC",
    images: [{ url: "/images/social/social-media.png", width: 1200, height: 630, alt: "Tshiamiso Astronauts — Literacy & Education NPO" }],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Tshiamiso Astronauts",
    description:
      "News, stories, and reflections from the Tshiamiso Astronauts community in Evaton West, Gauteng.",
    images: ["/images/social/social-media.png"],
  },
};

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Cover image */}
      {post.coverImageUrl ? (
        <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-brand-navy to-brand-teal flex items-center justify-center">
          <span className="text-4xl">🚀</span>
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Category + date */}
        <div className="flex items-center gap-3 mb-3">
          {post.category && (
            <span className="text-xs font-bold uppercase tracking-wide text-brand-teal bg-brand-teal/10 px-2.5 py-1 rounded-full">
              {post.category}
            </span>
          )}
          {post.publishedDate && (
            <span className="text-xs text-gray-400">{formatDate(post.publishedDate)}</span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-brand-navy font-bold text-lg mb-2 leading-snug group-hover:text-brand-orange transition-colors">
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Author */}
        <div className="mt-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-brand-orange/20 flex items-center justify-center text-xs">
            ✍️
          </span>
          <span className="text-xs text-gray-400 font-semibold">{post.author}</span>
        </div>
      </div>
    </Link>
  );
}

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  let fetchError = false;

  try {
    posts = await fetchPublishedPosts();
  } catch {
    fetchError = true;
  }

  return (
    <>
      {/* HERO */}
      <section className="relative py-24 px-6 text-center">
        <Image
          src="/images/blog-page/blog-hero.jpg"
          alt="Tshiamiso Astronauts Blog"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-brand-navy/70" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-brand-light-teal text-sm font-semibold uppercase tracking-widest mb-4">
            Stories & Updates
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Our{" "}
            <span className="text-brand-orange">Blog</span>
          </h1>
          <p className="text-gray-200 text-lg leading-relaxed">
            News, stories, and reflections from the Tshiamiso Astronauts community in Evaton West.
          </p>
        </div>
      </section>

      {/* POSTS GRID */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {fetchError ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Unable to load posts right now.</p>
              <p className="text-sm mt-1">
                Please contact us at{" "}
                <a href="mailto:info@tshiamisoastronauts.org" className="text-brand-teal underline">
                  info@tshiamisoastronauts.org
                </a>
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No posts yet — check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
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
