"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import TurnstileWidget, { type TurnstileHandle } from "@/components/TurnstileWidget";
import { COMMITTEES, CV_MAX_BYTES, GENDERS, LINKS_TO_TA, SKILL_AREAS, WHY_MAX_WORDS, boardPath, type BoardSource } from "@/config/board";
import { wordCount } from "@/lib/board/validate";
import { Card, Check, Field, FormError, Select, SubmitButton, TextArea, TextInput, inputClass } from "../_components/form-ui";
import { submitBoardApplication } from "./actions";

export default function ApplyForm({ source }: { source: BoardSource }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { cvSaved: boolean }>(null);
  const [whyWords, setWhyWords] = useState(0);
  const turnstileToken = useRef("");
  const turnstile = useRef<TurnstileHandle>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("source", source);
    fd.set("turnstileToken", turnstileToken.current);

    const cv = fd.get("cv");
    if (cv instanceof File && cv.size > CV_MAX_BYTES) {
      setError(`Your CV must be smaller than ${Math.round(CV_MAX_BYTES / (1024 * 1024))} MB.`);
      return;
    }
    if (whyWords > WHY_MAX_WORDS) {
      setError(`Please keep your answer to ${WHY_MAX_WORDS} words or fewer.`);
      return;
    }

    setLoading(true);
    try {
      const result = await submitBoardApplication(fd);
      if (result.success) {
        setDone({ cvSaved: result.cvSaved });
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
        <h2 className="text-2xl font-bold text-brand-navy mb-3">Application received</h2>
        <p className="text-lg leading-relaxed">
          Thank you. A committee screens applications in early December and we will contact you by email.
        </p>
        {!done.cvSaved && (
          <p className="mt-4 rounded-xl border-2 border-brand-orange bg-brand-pale-teal px-4 py-3 font-semibold">
            Your application was saved, but your CV did not upload. Please email your CV to info@tshiamisoastronauts.org
            with your full name.
          </p>
        )}
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

      <Card title="Your details">
        <Field id="fullName" label="Full name" required>
          <TextInput id="fullName" name="fullName" required autoComplete="name" />
        </Field>
        <Field id="preferredName" label="Preferred name">
          <TextInput id="preferredName" name="preferredName" maxLength={100} />
        </Field>
        <Field id="email" label="Email address" required>
          <TextInput id="email" name="email" type="email" required autoComplete="email" inputMode="email" />
        </Field>
        <Field id="phone" label="WhatsApp or cell number" required hint="A South African number, for example 082 123 4567.">
          <TextInput id="phone" name="phone" type="tel" required hint autoComplete="tel" inputMode="tel" maxLength={25} />
        </Field>
        <Field id="suburbCity" label="Suburb and city" required>
          <TextInput id="suburbCity" name="suburbCity" required maxLength={150} autoComplete="address-level2" />
        </Field>
        <Field id="gender" label="Gender (optional)" hint="Used only in aggregate, to help the Board meet its gender balance goal.">
          <select id="gender" name="gender" defaultValue="" aria-describedby="gender-hint" className={inputClass}>
            <option value="">Prefer not to choose</option>
            {GENDERS.map((g, i) => (
              <option key={g} value={i}>
                {g}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      <Card title="About you">
        <Field id="linkToTa" label="Your link to TA" required>
          <Select id="linkToTa" name="linkToTa" options={LINKS_TO_TA} required placeholder="Choose one" />
        </Field>
        <Field id="skillArea" label="Main skill area" required>
          <Select id="skillArea" name="skillArea" options={SKILL_AREAS} required placeholder="Choose one" />
        </Field>
        <Field id="roleEmployer" label="Current role and employer (optional)">
          <TextInput id="roleEmployer" name="roleEmployer" />
        </Field>
        <Field
          id="experience"
          label="Board or committee experience, and professional registrations"
          required
          hint="For example SAICA, SAIPA, a law society, or any NPO board you have served on. Write 'None' if not."
        >
          <TextArea id="experience" name="experience" required hint />
        </Field>
        <Field id="cv" label="Upload your CV (PDF or Word)" required hint="PDF, DOC or DOCX, up to 3 MB.">
          <input
            id="cv"
            name="cv"
            type="file"
            required
            accept=".pdf,.doc,.docx"
            aria-describedby="cv-hint"
            className="w-full min-h-[48px] text-sm text-brand-navy file:mr-4 file:min-h-[44px] file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-navy file:text-white hover:file:opacity-90 cursor-pointer"
          />
        </Field>
        <Field id="linkedIn" label="LinkedIn profile link (optional)">
          <TextInput id="linkedIn" name="linkedIn" inputMode="url" maxLength={300} placeholder="linkedin.com/in/your-name" autoComplete="off" />
        </Field>
      </Card>

      <Card title="Your motivation">
        <Field id="why" label="Why do you want to serve on TA's Board? (up to 150 words)" required>
          <TextArea id="why" name="why" required onChange={(v) => setWhyWords(wordCount(v))} />
          <p className={`mt-1 text-sm ${whyWords > WHY_MAX_WORDS ? "font-bold text-red-800" : "text-gray-700"}`} aria-live="polite">
            {whyWords} of {WHY_MAX_WORDS} words
          </p>
        </Field>
        <Field id="first12" label="What would you want to achieve in your first 12 months?" required>
          <TextArea id="first12" name="first12" required />
        </Field>
        <Field id="supplier" label="A close friend owns a company that wants to supply TA. What do you do?" required>
          <TextArea id="supplier" name="supplier" required />
        </Field>
      </Card>

      <Card title="Your commitment">
        <Check id="attend" name="attend">
          I can attend a Board meeting one Saturday a month, 15h00 to 17h00
        </Check>
        <Field id="committee" label="Which Board committee interests you most?" required>
          <Select id="committee" name="committee" options={COMMITTEES} required placeholder="Choose one" />
        </Field>
        <Check id="unpaid" name="unpaid">
          I understand the role is unpaid and the term is 5 years
        </Check>
      </Card>

      <Card title="References and declarations">
        <Field id="referee1" label="Referee 1: name, relationship and contact (optional)" hint="We only contact referees if you are shortlisted.">
          <TextInput id="referee1" name="referee1" hint maxLength={300} />
        </Field>
        <Field id="referee2" label="Referee 2: name, relationship and contact (optional)">
          <TextInput id="referee2" name="referee2" maxLength={300} />
        </Field>
        <Check id="declaration" name="declaration">
          I have no criminal record, am not seeking employment with TA, and do not plan to stand for public office
        </Check>
        <Field
          id="interests"
          label="Do you have any interest or relationship with TA, its funders, suppliers or Directors?"
          required
          hint="Write 'None' if not. A declared link is not a bar; the Nominations and HR Committee decides how to manage it."
        >
          <TextArea id="interests" name="interests" required hint rows={3} />
        </Field>
        <Field id="nominatedBy" label="Were you nominated by someone? Their name (optional)">
          <TextInput id="nominatedBy" name="nominatedBy" maxLength={150} />
        </Field>
        <Check id="consent" name="consent">
          I consent to Tshiamiso Astronauts processing my details for this recruitment (POPIA) and confirm my answers are true
        </Check>
        <p className="text-sm text-gray-700">
          We only use your details for this recruitment. Read our{" "}
          <Link href="/privacy" className="inline-flex min-h-[44px] items-center font-semibold underline">
            Privacy Policy
          </Link>
          .
        </p>
      </Card>

      <TurnstileWidget ref={turnstile} onToken={(t) => (turnstileToken.current = t)} />
      <FormError message={error} />
      <SubmitButton loading={loading}>Submit application</SubmitButton>
    </form>
  );
}
