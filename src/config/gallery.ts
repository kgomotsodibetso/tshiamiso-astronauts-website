// Private event photo galleries at /gallery/[slug]. Not in the nav or the sitemap, and marked noindex:
// they are for sharing by link only. Photos live in Vercel Blob (BLOB_READ_WRITE_TOKEN, see .env.example).
// A gallery is every image whose file name starts with its prefix. To add an event, upload the photos with a
// shared file name prefix (TA_Photo_<Event>_...) and add an entry here.

export type GalleryConfig = {
  slug: string;
  title: string;
  eyebrow: string;
  intro: string;
  thanks: string;
  /** Start of the Blob path shared by this gallery's photos (a folder with a trailing slash, or a file name prefix). */
  prefix: string;
  /** Optional zip of every photo, uploaded to the Blob store, for the "Download all" button. */
  zipPath: string;
};

export const GALLERIES: GalleryConfig[] = [
  {
    slug: "regional-spelling-bee",
    title: "Regional Spelling Bee",
    eyebrow: "2026 Photo Gallery",
    intro: "Moments from the Regional Spelling Bee. View the photos here and download your favourites.",
    thanks:
      "Thank you to our learners, teachers, the host school and the Tshiamiso Astronauts team for making the day a success.",
    prefix: "TA_Photo_SpellingBeeGrandFinal_",
    zipPath: "TA_Gallery_SpellingBeeGrandFinal_V1.zip",
  },
];

export function getGallery(slug: string): GalleryConfig | undefined {
  return GALLERIES.find((g) => g.slug === slug);
}
