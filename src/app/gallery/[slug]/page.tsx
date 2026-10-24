import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { head, list } from "@vercel/blob";
import { GALLERIES, getGallery } from "@/config/gallery";
import { GalleryGrid, type GalleryPhoto } from "./GalleryGrid";

// New uploads show up within the hour without a redeploy. Listing the folder counts as an advanced Blob operation,
// and the free plan allows 2,000 a month, so this stays well under it (at most 720).
export const revalidate = 3600;

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

export function generateStaticParams() {
  return GALLERIES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const gallery = getGallery((await params).slug);
  if (!gallery) return {};
  // Shared by link only, so it must never appear in search results.
  return {
    title: `${gallery.title} Photos | Tshiamiso Astronauts`,
    description: gallery.intro,
    robots: { index: false, follow: false },
  };
}

async function loadPhotos(prefix: string) {
  const blobs = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const gallery = getGallery((await params).slug);
  if (!gallery) notFound();

  let photos: GalleryPhoto[] = [];
  let zipUrl: string | null = null;
  let loadError = false;

  try {
    const blobs = await loadPhotos(gallery.prefix);
    photos = blobs
      .filter((b) => IMAGE_EXT.test(b.pathname))
      .sort((a, b) => a.pathname.localeCompare(b.pathname, undefined, { numeric: true }))
      .map((b) => ({
        src: b.url,
        downloadUrl: b.downloadUrl,
        name: b.pathname.split("/").pop() ?? b.pathname,
      }));
    if (gallery.zipPath) zipUrl = (await head(gallery.zipPath).catch(() => null))?.downloadUrl ?? null;
  } catch {
    loadError = true;
  }

  return (
    <>
      <section className="bg-brand-navy px-6 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand-light-teal">{gallery.eyebrow}</p>
          <h1 className="mb-5 text-4xl font-bold text-white md:text-5xl">
            {gallery.title} <span className="text-brand-orange">Photos</span>
          </h1>
          <p className="text-lg leading-relaxed text-gray-200">{gallery.intro}</p>
          {zipUrl && (
            <a
              href={zipUrl}
              className="mt-8 inline-flex min-h-[44px] items-center rounded-xl bg-brand-orange px-8 py-3 font-bold text-brand-navy transition-opacity hover:opacity-90"
            >
              Download all photos (.zip)
            </a>
          )}
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {loadError ? (
            <p className="py-16 text-center text-gray-500">
              We could not load the photos right now. Please try again shortly, or email{" "}
              <a href="mailto:info@tshiamisoastronauts.org" className="text-brand-teal underline">
                info@tshiamisoastronauts.org
              </a>
              .
            </p>
          ) : photos.length === 0 ? (
            <p className="py-16 text-center text-gray-500">The photos are being uploaded. Please check back soon.</p>
          ) : (
            <>
              <p className="mb-6 text-sm font-semibold text-brand-teal">{photos.length} photos</p>
              <GalleryGrid photos={photos} label={gallery.title} />
            </>
          )}
        </div>
      </section>

      <section className="bg-white px-6 py-14">
        <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-brand-navy">{gallery.thanks}</p>
      </section>
    </>
  );
}
