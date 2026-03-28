"use server";

export interface ContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

async function saveToMonday(input: ContactInput): Promise<void> {
  const token = process.env.MONDAY_API_TOKEN!;
  const boardId = process.env.MONDAY_CONTACT_BOARD_ID!;
  const today = new Date().toISOString().split("T")[0];

  const columnValues = JSON.stringify({
    text_mm1w50ak: input.email,
    text_mm1w6s7n: input.phone,
    long_text_mm1wg8qm: {
      text: `Subject: ${input.subject}\n\n${input.message}`,
    },
    date_mm1wwsx4: { date: today },
  });

  const mutation = `
    mutation {
      create_item(
        board_id: ${boardId},
        item_name: "${`${input.firstName} ${input.lastName} — ${input.subject}`.replace(/"/g, '\\"')}",
        column_values: ${JSON.stringify(columnValues)}
      ) { id }
    }
  `;

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
    throw new Error(json.errors[0].message);
  }

  console.log(
    `[Contact] Monday.com item ${json.data?.create_item?.id} created for ${input.firstName} ${input.lastName}`
  );
}

async function sendSmsNotification(input: ContactInput): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM_NUMBER!;
  const to = process.env.TWILIO_NOTIFY_NUMBER!;

  const body =
    `New enquiry from ${input.firstName} ${input.lastName}\n` +
    `Subject: ${input.subject}\n` +
    `Email: ${input.email}\n` +
    `Phone: ${input.phone || "not provided"}\n` +
    `Message: ${input.message.slice(0, 100)}${input.message.length > 100 ? "…" : ""}`;

  const params = new URLSearchParams({ From: from, To: to, Body: body });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      },
      body: params.toString(),
    }
  );

  const json = await res.json();
  if (json.status >= 400) {
    throw new Error(json.message ?? "Twilio error");
  }

  console.log(`[Contact] SMS sent via Twilio SID ${json.sid}`);
}

export async function submitContactForm(
  input: ContactInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await Promise.all([saveToMonday(input), sendSmsNotification(input)]);
    return { success: true };
  } catch (error) {
    console.error("[Contact] Submission error:", error);
    return {
      success: false,
      error: "Something went wrong. Please email us directly at info@tshiamisoastronauts.org",
    };
  }
}
