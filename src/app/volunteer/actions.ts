"use server";

import { sendVolunteerConfirmation, sendVolunteerNotification } from "@/lib/resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Keys must match Monday.com status label indices for column single_select7la5rsb
const ROLE_INDEX_MAP: Record<string, number> = {
  "Comprehension Navigator (Grades 4–7)": 2,
  "Phonics Specialist (Grade 1)": 3,
  "Data Marshall (Monitoring & Evaluation)": 4,
  "Fluency Coach (Grades 2–3)": 6,
  "Homework Support (Intermediate/High School)": 7,
};
const ROLES = Object.keys(ROLE_INDEX_MAP);

const AVAILABILITY = [
  "Weekday mornings",
  "Weekday afternoons",
  "Weekday evenings",
  "Weekends",
  "School holidays only",
  "Flexible / Remote only",
];

// Keys match Monday.com dropdown label IDs for column multi_selectkns53gii
const LANGUAGE_ID_MAP: Record<string, number> = {
  "Sesotho": 0,
  "IsiZulu": 1,
  "English": 2,
  "Other (Specify)": 3,
};
const VALID_LANGUAGES = Object.keys(LANGUAGE_ID_MAP);

async function uploadFileToMonday(
  token: string,
  itemId: string,
  columnId: string,
  file: File
): Promise<void> {
  const query = `mutation ($file: File!) {
    add_file_to_column(item_id: ${itemId}, column_id: "${columnId}", file: $file) { id }
  }`;

  const fd = new FormData();
  fd.append("query", query);
  fd.append("variables[file]", file, file.name);

  const res = await fetch("https://api.monday.com/v2/file", {
    method: "POST",
    headers: {
      Authorization: token,
      "API-Version": "2024-01",
    },
    body: fd,
  });

  const json = await res.json();
  if (json.errors?.length) {
    console.error(`[Volunteer] File upload error for column ${columnId}:`, json.errors);
  }
}

export async function submitVolunteerApplication(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_VOLUNTEER_BOARD_ID;

  if (!token || !boardId) {
    console.error("[Volunteer] Missing MONDAY_API_TOKEN or MONDAY_VOLUNTEER_BOARD_ID");
    return { success: false, error: "Server configuration error. Please contact us directly." };
  }

  const firstName = (formData.get("firstName") as string)?.trim() ?? "";
  const lastName = (formData.get("lastName") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim() ?? "";
  const phone = (formData.get("phone") as string)?.trim() ?? "";
  const role = (formData.get("role") as string) ?? "";
  const availability = (formData.get("availability") as string) ?? "";
  const message = (formData.get("message") as string)?.trim() ?? "";
  const languages: string[] = JSON.parse((formData.get("languages") as string) || "[]");
  const cvFile = formData.get("cv") as File | null;
  const qualFile = formData.get("qualification") as File | null;

  if (!firstName || firstName.length > 100) return { success: false, error: "First name is required (max 100 chars)." };
  if (!lastName || lastName.length > 100) return { success: false, error: "Last name is required (max 100 chars)." };
  if (!email || !EMAIL_RE.test(email) || email.length > 254) return { success: false, error: "A valid email address is required." };
  if (phone && phone.length > 20) return { success: false, error: "Phone number is too long." };
  if (!role || !ROLES.includes(role)) return { success: false, error: "Please select a valid role." };
  if (!availability || !AVAILABILITY.includes(availability)) return { success: false, error: "Please select a valid availability option." };
  if (message && message.length > 2000) return { success: false, error: "Message must be under 2000 characters." };

  const validLanguages = languages.filter((l) => VALID_LANGUAGES.includes(l));
  const fullName = `${firstName} ${lastName}`;

  const notesLines = [
    `Availability: ${availability}`,
    message ? `\n${message}` : "",
  ].filter(Boolean).join("\n");

  const mutation = `
    mutation CreateVolunteer($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item(
        board_id: $boardId,
        item_name: $itemName,
        column_values: $columnValues
      ) { id }
    }
  `;

  const columnValues: Record<string, unknown> = {
    short_textj00mpdv0: fullName,
    short_textjyc0986f: lastName,
    short_textjwgz4sor: email.toLowerCase(),
    short_text70w7rlxm: phone,
    single_select7la5rsb: { index: ROLE_INDEX_MAP[role] },
    long_textbsbqmt6z: { text: notesLines },
  };

  if (validLanguages.length > 0) {
    columnValues.multi_selectkns53gii = { ids: validLanguages.map((l) => LANGUAGE_ID_MAP[l]) };
  }

  const variables = {
    boardId,
    itemName: fullName,
    columnValues: JSON.stringify(columnValues),
  };

  try {
    const res = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        "API-Version": "2024-01",
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const json = await res.json();

    if (json.errors?.length) {
      console.error("[Volunteer] Monday.com errors:", json.errors);
      return { success: false, error: "Something went wrong. Please try again or contact us." };
    }

    const itemId = json.data?.create_item?.id;
    console.log(`[Volunteer] Created item ${itemId}`);

    if (itemId) {
      const uploads: Promise<void>[] = [];
      if (cvFile && cvFile.size > 0) {
        uploads.push(uploadFileToMonday(token, itemId, "file7otjarry", cvFile));
      }
      if (qualFile && qualFile.size > 0) {
        uploads.push(uploadFileToMonday(token, itemId, "file8b9f3u4o", qualFile));
      }
      await Promise.all(uploads);
    }

    await Promise.all([
      sendVolunteerConfirmation(email, firstName),
      sendVolunteerNotification({ firstName, lastName, email, role })
    ]).catch(err => console.error("[Volunteer] Email notification failed:", err));

    return { success: true };
  } catch (error) {
    console.error("[Volunteer] Fetch error:", error);
    return { success: false, error: "Something went wrong. Please try again or contact us." };
  }
}
