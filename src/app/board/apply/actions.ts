"use server";

import {
  BOARD_MONDAY,
  COMMITTEES,
  CV_MAX_BYTES,
  GENDERS,
  LINKS_TO_TA,
  SKILL_AREAS,
  WHY_MAX_WORDS,
  resolveBoardSource,
} from "@/config/board";
import { guardSubmission } from "@/lib/board/guard";
import { addUpdate, attachFile, createBoardItem } from "@/lib/board/monday";
import { confirmationAllowed, mondayItemUrl } from "@/lib/board/notify";
import { sendBoardApplicationConfirmation, sendBoardStaffNotification } from "@/lib/resend";
import { siteUrl } from "@/lib/subscribe/siteUrl";
import { checkCv, clean, isEmail, normaliseLinkedIn, normaliseSaPhone, wordCount } from "@/lib/board/validate";

export type BoardResult = { success: true; cvSaved: boolean } | { success: false; error: string };

const fail = (error: string): BoardResult => ({ success: false, error });

// Index of a chosen option (the form sends the position in the list). null if missing or out of range.
function pick(value: FormDataEntryValue | null, list: readonly string[]): number | null {
  const s = clean(value);
  if (!/^\d{1,2}$/.test(s)) return null;
  const n = Number(s);
  return n < list.length ? n : null;
}

const CV_COLUMN = "fileacsa9swk";

export async function submitBoardApplication(formData: FormData): Promise<BoardResult> {
  const blocked = await guardSubmission(formData, "Applications");
  if (blocked) return fail(blocked);

  const fullName = clean(formData.get("fullName"));
  const preferredName = clean(formData.get("preferredName"));
  const email = clean(formData.get("email")).toLowerCase();
  const phone = normaliseSaPhone(clean(formData.get("phone")));
  const suburbCity = clean(formData.get("suburbCity"));
  const gender = pick(formData.get("gender"), GENDERS); // optional
  const linkToTa = pick(formData.get("linkToTa"), LINKS_TO_TA);
  const skillArea = pick(formData.get("skillArea"), SKILL_AREAS);
  const roleEmployer = clean(formData.get("roleEmployer"));
  const experience = clean(formData.get("experience"));
  const linkedInRaw = clean(formData.get("linkedIn"));
  const why = clean(formData.get("why"));
  const first12 = clean(formData.get("first12"));
  const supplier = clean(formData.get("supplier"));
  const committee = pick(formData.get("committee"), COMMITTEES);
  const referee1 = clean(formData.get("referee1"));
  const referee2 = clean(formData.get("referee2"));
  const interests = clean(formData.get("interests"));
  const nominatedBy = clean(formData.get("nominatedBy"));
  const cvEntry = formData.get("cv");
  const cv = cvEntry instanceof File ? cvEntry : null;
  const source = resolveBoardSource(clean(formData.get("source")));

  if (!fullName || fullName.length > 150) return fail("Please enter your full name.");
  if (preferredName.length > 100) return fail("Preferred name is too long.");
  if (!isEmail(email)) return fail("Please enter a valid email address.");
  if (!phone) return fail("Please enter a South African cell number, for example 082 123 4567.");
  if (!suburbCity || suburbCity.length > 150) return fail("Please enter your suburb and city.");
  if (linkToTa === null) return fail("Please choose your link to TA.");
  if (skillArea === null) return fail("Please choose your main skill area.");
  if (roleEmployer.length > 200) return fail("Current role and employer is too long.");
  if (!experience || experience.length > 2000) return fail("Please describe your Board or committee experience, or write 'None'.");
  const linkedIn = linkedInRaw ? normaliseLinkedIn(linkedInRaw) : null;
  if (linkedInRaw && !linkedIn) return fail("Please enter a LinkedIn link, for example https://www.linkedin.com/in/your-name.");
  if (!why || why.length > 2000) return fail("Please tell us why you want to serve on the Board.");
  if (wordCount(why) > WHY_MAX_WORDS) return fail(`Please keep your answer to ${WHY_MAX_WORDS} words or fewer.`);
  if (!first12 || first12.length > 2000) return fail("Please tell us what you would want to achieve in your first 12 months.");
  if (!supplier || supplier.length > 2000) return fail("Please answer the question about a friend's company.");
  if (committee === null) return fail("Please choose a Board committee.");
  if (referee1.length > 300 || referee2.length > 300) return fail("A referee entry is too long.");
  if (!interests || interests.length > 2000) return fail("Please declare any interest or relationship, or write 'None'.");
  if (nominatedBy.length > 150) return fail("The nominator's name is too long.");
  for (const key of ["attend", "unpaid", "declaration", "consent"]) {
    if (clean(formData.get(key)) !== "yes") return fail("Please tick every box marked with a star.");
  }
  const cvError = await checkCv(cv, CV_MAX_BYTES);
  if (cvError) return fail(cvError);

  const columns: Record<string, unknown> = {
    short_text6woox264: preferredName,
    emailnv9zgb3o: { email, text: email },
    phonej8temktw: { phone, countryShortName: "ZA" },
    short_textjxdlylk4: suburbCity,
    single_select7hvfnpx: { index: linkToTa },
    single_select0za2dfq: { index: skillArea },
    short_textmz3vtpr0: roleEmployer,
    long_texty387y7oj: { text: experience },
    long_textglbtv37u: { text: why },
    long_textbrnbisk9: { text: first12 },
    long_text1ijunpmg: { text: supplier },
    booleanzflglsye: { checked: "true" },
    single_selectrlycvzy: { index: committee },
    booleandhxiryw9: { checked: "true" },
    short_texte0vvuozi: referee1,
    short_textqqxab530: referee2,
    booleant7kjjhjm: { checked: "true" },
    long_text0o4j69cy: { text: interests },
    short_textdgw4yhlb: nominatedBy,
    booleanlb21va40: { checked: "true" },
    short_textyh9m6k7c: source,
  };
  if (gender !== null) columns.single_select2ew0qac = { index: gender };
  if (linkedIn) columns.link670aqofe = { url: linkedIn, text: "LinkedIn" };

  const created = await createBoardItem({
    label: "Applications",
    boardId: BOARD_MONDAY.applicationsBoardId,
    name: fullName,
    columns,
    phoneColumnIds: ["phonej8temktw"],
    phoneNote: `WhatsApp or cell number (the phone column refused it): ${phone}`,
  });
  if (!created.ok) {
    return fail("Something went wrong and your application was not saved. Please try again, or email info@tshiamisoastronauts.org.");
  }

  // The item exists now, so a CV problem must not make the applicant send everything twice.
  const cvSaved = await attachFile(created.itemId, CV_COLUMN, cv as File);
  if (!cvSaved) await addUpdate(created.itemId, "CV upload failed. Please ask the applicant to email their CV.");

  // Emails. The application is already saved, so a failed email never loses it: a note on the Monday item says what to do.
  const allowed = await confirmationAllowed(email);
  const [confirmed, staffNotified] = await Promise.all([
    allowed
      ? sendBoardApplicationConfirmation({ name: fullName, email, cvSaved, privacyUrl: `${siteUrl()}/privacy` })
      : Promise.resolve(false),
    sendBoardStaffNotification({
      kind: "application",
      lines: [
        ["Applicant", fullName],
        ["Main skill area", SKILL_AREAS[skillArea]],
        ["Committee", COMMITTEES[committee]],
        ["Source", source],
        ["CV uploaded", cvSaved ? "Yes" : "NO: ask the applicant to email it"],
      ],
      itemUrl: mondayItemUrl(BOARD_MONDAY.applicationsBoardId, created.itemId),
    }),
  ]);
  if (!staffNotified) console.warn("[Board:Applications] staff notification email not sent");
  if (!confirmed) {
    console.warn(`[Board:Applications] confirmation email not sent (${allowed ? "send failed" : "daily limit for this address"})`);
    await addUpdate(created.itemId, "Confirmation email to the applicant was NOT sent. Please confirm receipt by hand.");
  }

  return { success: true, cvSaved };
}
