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

export async function submitVolunteerApplication(
  input: VolunteerInput
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_VOLUNTEER_BOARD_ID;

  if (!token || !boardId) {
    console.error("[Volunteer Application] Missing MONDAY_API_TOKEN or MONDAY_VOLUNTEER_BOARD_ID");
    return { success: false, error: "Server configuration error. Please contact us directly." };
  }

  const fullName = `${input.firstName} ${input.lastName}`;

  const notesLines = [
    `Role: ${input.role}`,
    `Availability: ${input.availability}`,
    input.message ? `\n${input.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const columnValues = JSON.stringify({
    short_textj00mpdv0: fullName,
    short_textjyc0986f: input.lastName,
    short_textjwgz4sor: input.email,
    short_text70w7rlxm: input.phone,
    long_textbsbqmt6z: { text: notesLines },
  });

  const mutation = `
    mutation {
      create_item(
        board_id: ${boardId},
        item_name: "${fullName.replace(/"/g, '\\"')}",
        column_values: ${JSON.stringify(columnValues)}
      ) {
        id
      }
    }
  `;

  try {
    const res = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        "API-Version": "2024-01",
      },
      body: JSON.stringify({ query: mutation }),
    });

    const json = await res.json();

    if (json.errors?.length) {
      console.error("[Volunteer Application] Monday.com errors:", json.errors);
      return { success: false, error: "Something went wrong. Please try again or contact us." };
    }

    console.log(
      `[Volunteer Application] Created Monday.com item ${json.data?.create_item?.id} for ${fullName} <${input.email}>`
    );

    return { success: true };
  } catch (error) {
    console.error("[Volunteer Application] Fetch error:", error);
    return { success: false, error: "Something went wrong. Please try again or contact us." };
  }
}
