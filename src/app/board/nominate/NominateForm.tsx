"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import TurnstileWidget, { type TurnstileHandle } from "@/components/TurnstileWidget";
import { NOMINEE_KNOWS, SKILL_AREAS, boardPath, type BoardSource } from "@/config/board";
import { Card, Check, Field, FormError, Select, SubmitButton, TextArea, TextInput } from "../_components/form-ui";
import { submitBoardNomination } from "./actions";

export default function NominateForm({ source }: { source: BoardSource }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const turnstileToken = useRef("");
  const turnstile = useRef<TurnstileHandle>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("source", source);
    fd.set("turnstileToken", turnstileToken.current);

    setLoading(true);
    try {
      const result = await submitBoardNomination(fd);
      if (result.success) {
        setDone(true);
        window.scrollTo({ top: 0 });
      } else {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong. Please try again, or email info@tshiamisoastronauts.org.");
    } finally {
      turnstile.current?.reset(); // each token works once
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div role="status" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <h2 className="text-2xl font-bold text-brand-navy mb-3">Nomination received</h2>
        <p className="text-lg leading-relaxed">
          Thank you. We will invite your nominee to apply, and nobody is appointed on a nomination alone.
        </p>
        <Link
          href={boardPath("/board", source)}
          className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-md bg-brand-navy px-8 py-3 font-bold text-white"
        >
          Back to Board vacancies
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-clarity-mask="true">
      <p className="text-sm text-gray-700">Fields marked * are required.</p>

      <Card title="About you">
        <Field id="yourName" label="Your full name" required>
          <TextInput id="yourName" name="yourName" required autoComplete="name" />
        </Field>
        <Field id="yourEmail" label="Your email address" required>
          <TextInput id="yourEmail" name="yourEmail" type="email" required autoComplete="email" inputMode="email" />
        </Field>
        <Field id="relationship" label="Your relationship to the nominee" required>
          <TextInput id="relationship" name="relationship" required />
        </Field>
      </Card>

      <Card title="About your nominee">
        <Field id="nomineeName" label="Nominee's full name" required>
          <TextInput id="nomineeName" name="nomineeName" required maxLength={150} />
        </Field>
        <Field id="nomineeEmail" label="Nominee's email address" required>
          <TextInput id="nomineeEmail" name="nomineeEmail" type="email" required inputMode="email" />
        </Field>
        <Field id="nomineePhone" label="Nominee's cell number (optional)" hint="A South African number, for example 082 123 4567.">
          <TextInput id="nomineePhone" name="nomineePhone" type="tel" hint inputMode="tel" maxLength={25} />
        </Field>
        <Field id="skillArea" label="Nominee's main skill area" required>
          <Select id="skillArea" name="skillArea" options={SKILL_AREAS} required placeholder="Choose one" />
        </Field>
        <Field id="why" label="Why would they make a strong Director?" required>
          <TextArea id="why" name="why" required />
        </Field>
        <Field id="knows" label="Does the nominee know you are nominating them?" required>
          <Select id="knows" name="knows" options={NOMINEE_KNOWS} required placeholder="Choose one" />
        </Field>
        <Field id="link" label="Do you have a family or business link to the nominee? Describe it, or write 'None'" required>
          <TextInput id="link" name="link" required maxLength={300} />
        </Field>
      </Card>

      <Card title="Permission">
        <Check id="permission" name="permission">
          I confirm I have the nominee&apos;s permission to share their contact details, or I accept TA will only invite them once and
          delete their details if they do not reply
        </Check>
        <p className="text-sm text-gray-700">
          We only use these details for this recruitment. Read our{" "}
          <Link href="/privacy" className="inline-flex min-h-[44px] items-center font-semibold underline">
            Privacy Policy
          </Link>
          .
        </p>
      </Card>

      <TurnstileWidget ref={turnstile} onToken={(t) => (turnstileToken.current = t)} />
      <FormError message={error} />
      <SubmitButton loading={loading}>Submit nomination</SubmitButton>
    </form>
  );
}
