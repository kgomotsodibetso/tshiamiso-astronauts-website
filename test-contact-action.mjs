import { submitContactForm } from "./src/app/contact/actions.js";

async function test() {
  console.log("Testing submitContactForm...");
  try {
    const res = await submitContactForm({
      firstName: "Test",
      lastName: "Test",
      email: "test@example.com",
      phone: "12345",
      subject: "General Enquiry",
      message: "Testing"
    });
    console.log("Result:", res);
  } catch (err) {
    console.error("Caught error:", err);
  }
}

test();
