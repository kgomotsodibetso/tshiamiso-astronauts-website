"use server";

export interface VolunteerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  availability: string;
  message: string;
}

// ── Server-side validation ─────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ["Tutor", "Mentor", "Event Support", "Admin & Logistics", "Fundraising", "Other"];
const AVAILABILITY = ["Weekdays", "Weekends", "Both", "Flexible"];

function validate(input: VolunteerInput): string | null {
  if (!input.firstName?.trim() || input.firstName.length > 100) return "First name is required (max 100 chars).";
  if (!input.lastName?.trim() || input.lastName.length > 100) return "Last name is required (max 100 chars).";
  if (!input.email?.trim() || !EMAIL_RE.test(input.email) || input.email.length > 254) return "A valid email address is required.";
  if (input.phone && input.phone.length > 20) return "Phone number is too long.";
  if (!input.role || !ROLES.includes(input.role)) return "Please select a valid role.";
  if (!input.availability || !AVAILABILITY.includes(input.availability)) return "Please select a valid availability option.";
  if (input.message && input.message.length > 2000) return "Message must be under 2000 characters.";
  return null;
}

export async function submitVolunteerApplication(
  input: VolunteerInput
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_VOLUNTEER_BOARD_ID;

  if (!token || !boardId) {
    console.error("[Volunteer] Missing MONDAY_API_TOKEN or MONDAY_VOLUNTEER_BOARD_ID");
    return { success: false, error: "Server configuration error. Please contact us directly." };
  }

  const validationError = validate(input);
  if (validationError) return { success: false, error: validationError };

  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`;
  const notesLines = [
    `Role: ${input.role}`,
    `Availability: ${input.availability}`,
    input.message ? `\n${input.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  // Use GraphQL variables — no user data in the query string
  const mutation = `
    mutation CreateVolunteer($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item(
        board_id: $boardId,
        item_name: $itemName,
        column_values: $columnValues
      ) { id }
    }
  `;

  const variables = {
    boardId,
    itemName: fullName,
    columnValues: JSON.stringify({
      short_textj00mpdv0: fullName,
      short_textjyc0986f: input.lastName.trim(),
      short_textjwgz4sor: input.email.trim().toLowerCase(),
      short_text70w7rlxm: input.phone.trim(),
      long_textbsbqmt6z: { text: notesLines },
    }),
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

    console.log(`[Volunteer] Created item ${json.data?.create_item?.id} for ${fullName}`);
    return { success: true };
  } catch (error) {
    console.error("[Volunteer] Fetch error:", error);
    return { success: false, error: "Something went wrong. Please try again or contact us." };
  }
}
