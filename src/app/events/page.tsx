import Link from "next/link";
import type { Metadata } from "next";
import { fetchEvents, type MondayEvent } from "./actions";
import { EventCard } from "./EventCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Events & Competitions | Tshiamiso Astronauts",
  description:
    "Find upcoming Spelling Bee rounds, community festivals, and fundraising events from Tshiamiso Astronauts. RSVP online.",
};

export default async function EventsPage() {
  let events: MondayEvent[] = [];
  let fetchError = false;

  try {
    events = await fetchEvents();
    events.sort((a, b) => (a.date > b.date ? 1 : -1));
  } catch {
    fetchError = true;
  }

  // Build today at local midnight to avoid UTC vs SAST shift when comparing
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  function toLocalDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  const upcoming = events.filter((e) => { const d = toLocalDate(e.date); return d !== null && d >= today; });
  const past     = events.filter((e) => { const d = toLocalDate(e.date); return d !== null && d < today; });

  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-br from-brand-navy to-brand-teal py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-brand-light-teal text-sm font-semibold uppercase tracking-widest mb-4">
            2026 Calendar
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Events &{" "}
            <span className="text-brand-orange">Competitions</span>
          </h1>
          <p className="text-gray-200 text-lg leading-relaxed">
            From Spelling Bee championships to community festivals — find out
            what&apos;s happening and secure your spot.
          </p>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-brand-navy">Upcoming Events</h2>
            <div className="flex gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-brand-orange inline-block" /> Spelling Bee
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-brand-teal inline-block" /> Community
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-brand-navy inline-block" /> Fundraising
              </span>
            </div>
          </div>

          {fetchError ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Unable to load events right now.</p>
              <p className="text-sm mt-1">
                Please contact us at{" "}
                <a href="mailto:info@tshiamisoastronauts.org" className="text-brand-teal underline">
                  info@tshiamisoastronauts.org
                </a>
              </p>
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No upcoming events at the moment.</p>
              <p className="text-sm mt-1">Check back soon — the 2026 calendar is being finalised.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PAST EVENTS */}
      {past.length > 0 && (
        <section className="py-16 px-6 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-400 mb-8">Past Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA STRIP */}
      <section className="py-16 px-6 bg-brand-navy">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
          <div className="bg-white/10 rounded-2xl p-8">
            <h3 className="text-white font-bold text-xl mb-2">Support Our Events</h3>
            <p className="text-gray-300 text-sm mb-6">
              Your donation helps us run competitions, festivals, and programmes that
              transform young lives in Evaton West.
            </p>
            <Link
              href="/donate"
              className="inline-block bg-brand-orange text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Donate Now
            </Link>
          </div>
          <div className="bg-white/10 rounded-2xl p-8">
            <h3 className="text-white font-bold text-xl mb-2">Volunteer at Events</h3>
            <p className="text-gray-300 text-sm mb-6">
              We need hands on deck for every competition and community day. Sign up
              to be part of the crew.
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
