"use server";

import { BOARD_MONDAY, NOMINEE_KNOWS, SKILL_AREAS, resolveBoardSource } from "@/config/board";
import { guardSubmission } from "@/lib/board/guard";
import { createBoardItem } from "@/lib/board/monday";
import { clean, isEmail, normaliseSaPhone } from "@/lib/board/validate";

export type NominationResult = { success: true } | { success: false; error: string };

const fail = (error: string): NominationResult => ({ success: false, error });

function pick(value: FormDataEntryValue | null, list: readonly string[]): number | null {
  const s = clean(value);
  if (!/^\d{1,2}$/.test(s)) return null;
  const n = Number(s);
  return n < list.length ? n : null;
}

export async function submitBoardNomination(formData: FormData): Promise<NominationResult> {
  const blocked = await guardSubmission(formData, "Nominations");
  if (blocked) return fail(blocked);

  const yourName = clean(formData.get("yourName"));
  const yourEmail = clean(formData.get("yourEmail")).toLowerCase();
  const relationship = clean(formData.get("relationship"));
  const nomineeName = clean(formData.get("nomineeName"));
  const nomineeEmail = clean(formData.get("nomineeEmail")).toLowerCase();
  const nomineePhoneRaw = clean(formData.get("nomineePhone"));
  const skillArea = pick(formData.get("skillArea"), SKILL_AREAS);
  const why = clean(formData.get("why"));
  const knows = pick(formData.get("knows"), NOMINEE_KNOWS);
  const link = clean(formData.get("link"));
  const source = resolveBoardSource(clean(formData.get("source")));

  if (!yourName || yourName.length > 150) return fail("Please enter your full name.");
  if (!isEmail(yourEmail)) return fail("Please enter a valid email address for yourself.");
  if (!relationship || relationship.length > 200) return fail("Please tell us your relationship to the nominee.");
  if (!nomineeName || nomineeName.length > 150) return fail("Please enter the nominee's full name.");
  if (!isEmail(nomineeEmail)) return fail("Please enter a valid email address for the nominee.");
  const nomineePhone = nomineePhoneRaw ? normaliseSaPhone(nomineePhoneRaw) : null;
  if (nomineePhoneRaw && !nomineePhone) return fail("Please enter the nominee's cell number as a South African number, or leave it blank.");
  if (skillArea === null) return fail("Please choose the nominee's main skill area.");
  if (!why || why.length > 2000) return fail("Please tell us why they would make a strong Director.");
  if (knows === null) return fail("Please tell us whether the nominee knows you are nominating them.");
  if (!link || link.length > 300) return fail("Please describe any family or business link to the nominee, or write 'None'.");
  if (clean(formData.get("permission")) !== "yes") return fail("Please tick the box marked with a star.");

  const columns: Record<string, unknown> = {
    emailsrr1rvuk: { email: yourEmail, text: yourEmail },
    short_textc8ol4f2f: relationship,
    short_textpmdw86jn: nomineeName,
    emailfxw3svgs: { email: nomineeEmail, text: nomineeEmail },
    single_selectb3x7hnp: { index: skillArea },
    long_texts8pc2ups: { text: why },
    single_selectbe7b84q: { index: knows },
    short_text10aoa9nv: link,
    boolean0c0pylzf: { checked: "true" },
    short_textucj96ndb: source,
  };
  if (nomineePhone) columns.phonedwrpgrr1 = { phone: nomineePhone, countryShortName: "ZA" };

  const created = await createBoardItem({
    label: "Nominations",
    boardId: BOARD_MONDAY.nominationsBoardId,
    name: yourName,
    columns,
    phoneColumnIds: ["phonedwrpgrr1"],
    phoneNote: nomineePhone ? `Nominee's cell number (the phone column refused it): ${nomineePhone}` : "",
  });
  if (!created.ok) {
    return fail("Something went wrong and your nomination was not saved. Please try again, or email info@tshiamisoastronauts.org.");
  }
  return { success: true };
}
