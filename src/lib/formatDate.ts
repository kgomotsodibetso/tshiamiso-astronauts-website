/**
 * Formats a "YYYY-MM-DD" string into a localised date string using local-time
 * construction (avoids UTC midnight / SAST timezone shift).
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
