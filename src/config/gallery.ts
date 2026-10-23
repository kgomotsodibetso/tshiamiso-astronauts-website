// Private event photo galleries at /gallery/[slug]. Not in the nav or the sitemap, and marked noindex:
// they are for sharing by link only. Photos live in Vercel Blob (BLOB_READ_WRITE_TOKEN, see .env.example),
// one folder per gallery. To add an event, upload the photos to its folder and add an entry here.

export type GalleryConfig = {
  slug: string;
  title: string;
  eyebrow: string;
  intro: string;
  thanks: string;
  /** Blob folder that holds this gallery's photos, with a trailing slash. */
  folder: string;
  /** Optional zip of every photo, uploaded to the same folder, for the "Download all" button. */
  zipName: string;
};

export const GALLERIES: GalleryConfig[] = [
  {
    slug: "regional-spelling-bee",
    title: "Regional Spelling Bee",
    eyebrow: "2026 Photo Gallery",
    intro: "Moments from the Regional Spelling Bee. View the photos here and download your favourites.",
    thanks:
      "Thank you to our learners, teachers, the host school and the Tshiamiso Astronauts team for making the day a success.",
    folder: "galleries/regional-spelling-bee-2026/",
    zipName: "TA_Gallery_RegionalSpellingBee_V1.zip",
  },
];

export function getGallery(slug: string): GalleryConfig | undefined {
  return GALLERIES.find((g) => g.slug === slug);
}
