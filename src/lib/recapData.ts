// Verified from monday.com (workspace "Tshiamiso Astronauts: Mission 2026"), 1 Jan to 8 Oct 2026.
// Update these numbers in one place when the figures are re-run.
// Never add learner names, photos, contact details or anything from the Enrollment board.
export const recapData = {
  asOf: "2026-10-08",
  asOfLabel: "8 October 2026",
  attendanceRecords: 1922,
  sessionDays: 142,
  learnerHours: 3009,
  soupKitchenVisits: 1511,
  soupKitchenServiceDays: 125,
  // Indicative only: some attendance records carry more than one programme label.
  programmes: {
    homeworkAssistance: { records: 1612, days: 125, hours: 2245 },
    bookClub: { records: 162, days: 18, hours: 387 },
    library: { records: 124, days: 23, hours: 238 },
    saturdayBookClub: { records: 40, days: 5, hours: 149 },
  },
  spellingBee: {
    schoolQualifiers: 9,
    finalists: 107,
    grandFinalLabel: "Friday 23 October 2026, 09:00",
    venue: "Setlabotjha Primary School, Sedibeng West District D8",
    rsvpUrl: "https://wkf.ms/4zmG6n1",
    rsvpClosesLabel: "16 October 2026",
  },
} as const;

export const fmt = (n: number) => n.toLocaleString("en-ZA").replace(/ /g, ",");
