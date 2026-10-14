import { JOIN_SOURCES, type JoinSource } from "@/config/join";

// `?s=` is the only thing from the URL that we use. It is matched against a fixed list and the
// raw value is never kept, shown or passed on, so nothing a visitor types can end up on a page or in a link.
export function cleanSource(raw: string | string[] | null | undefined): JoinSource {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return "other";
  const v = value.trim().toLowerCase();
  return (JOIN_SOURCES as readonly string[]).includes(v) ? (v as JoinSource) : "other";
}
