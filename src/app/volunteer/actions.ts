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
  try {
    // Log the application (visible in Vercel function logs)
    console.log(
      `[Volunteer Application] ${input.firstName} ${input.lastName} <${input.email}> | Role: ${input.role} | Availability: ${input.availability}`
    );

    // TODO: When MONDAY_API_TOKEN is set, create an item in Monday.com board:
    // const mondayToken = process.env.MONDAY_API_TOKEN;
    // if (mondayToken) {
    //   await fetch("https://api.monday.com/v2", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json", Authorization: mondayToken },
    //     body: JSON.stringify({
    //       query: `mutation { create_item (board_id: YOUR_BOARD_ID, item_name: "${input.firstName} ${input.lastName}", column_values: "{}") { id } }`,
    //     }),
    //   });
    // }

    // TODO: Send notification email to RECEIPT_EMAIL (process.env.RECEIPT_EMAIL)
    // via Resend or Nodemailer when email service is configured.

    return { success: true };
  } catch (error) {
    console.error("[Volunteer Application] Error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
