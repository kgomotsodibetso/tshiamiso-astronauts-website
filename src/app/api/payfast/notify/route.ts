import { NextRequest, NextResponse } from "next/server";

// PayFast Instant Transaction Notification (ITN) handler.
// PayFast POSTs payment confirmation here after every transaction.
// TODO: Validate the ITN signature, then trigger a Section 18A receipt email.
export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const data = Object.fromEntries(body.entries());

    const paymentStatus = data["payment_status"];
    const amount = data["amount_gross"];
    const email = data["email_address"];
    const firstName = data["name_first"];
    const lastName = data["name_last"];

    console.log(
      `[PayFast ITN] Status: ${paymentStatus} | Amount: R${amount} | Donor: ${firstName} ${lastName} <${email}>`
    );

    // TODO: If paymentStatus === "COMPLETE":
    //   1. Validate ITN signature against PayFast
    //   2. Send Section 18A receipt email via Resend / Nodemailer to donor email
    //   3. BCC receipt to process.env.RECEIPT_EMAIL

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[PayFast ITN] Error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
