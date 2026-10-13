// Small building blocks for the Board forms, styled like the /volunteer application form
// (white cards on grey, rounded inputs) with the brand colours from the Board page.
import Link from "next/link";
import type { ReactNode } from "react";

export const inputClass =
  "w-full min-h-[48px] px-4 py-3 border-2 border-gray-300 rounded-xl text-brand-navy bg-white placeholder:text-gray-500 focus:outline-none focus:border-brand-teal focus-visible:ring-2 focus-visible:ring-brand-teal";

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
      <legend className="sr-only">{title}</legend>
      <h2 aria-hidden="true" className="text-brand-navy font-bold text-lg">
        {title}
      </h2>
      {children}
    </fieldset>
  );
}

export function Field({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-brand-navy mb-1">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-gray-600 mb-2">
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

export function TextInput({
  id,
  name,
  type = "text",
  required,
  hint,
  autoComplete,
  maxLength,
  placeholder,
  inputMode,
}: {
  id: string;
  name: string;
  type?: string;
  required?: boolean;
  hint?: boolean;
  autoComplete?: string;
  maxLength?: number;
  placeholder?: string;
  inputMode?: "text" | "tel" | "email" | "url";
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      required={required}
      autoComplete={autoComplete}
      maxLength={maxLength ?? 200}
      placeholder={placeholder}
      inputMode={inputMode}
      aria-describedby={hint ? `${id}-hint` : undefined}
      className={inputClass}
    />
  );
}

export function Select({
  id,
  name,
  options,
  required,
  placeholder,
}: {
  id: string;
  name: string;
  options: readonly string[];
  required?: boolean;
  placeholder: string;
}) {
  return (
    <select id={id} name={name} required={required} defaultValue="" className={inputClass}>
      <option value="">{placeholder}</option>
      {options.map((o, i) => (
        // The value is the position in the list, which is the Monday.com label index.
        <option key={o} value={i}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function TextArea({
  id,
  name,
  required,
  hint,
  rows = 4,
  maxLength = 2000,
  onChange,
}: {
  id: string;
  name: string;
  required?: boolean;
  hint?: boolean;
  rows?: number;
  maxLength?: number;
  onChange?: (value: string) => void;
}) {
  return (
    <textarea
      id={id}
      name={name}
      required={required}
      rows={rows}
      maxLength={maxLength}
      aria-describedby={hint ? `${id}-hint` : undefined}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      className={`${inputClass} resize-y`}
    />
  );
}

export function Check({ id, name, children }: { id: string; name: string; children: ReactNode }) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 min-h-[44px] py-2 cursor-pointer">
      <input id={id} name={name} type="checkbox" value="yes" required className="mt-1 h-6 w-6 shrink-0 accent-brand-teal" />
      <span className="text-brand-navy leading-snug">
        {children}
        <span aria-hidden="true"> *</span>
      </span>
    </label>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border-2 border-red-700 bg-red-50 px-4 py-3 text-red-800 font-semibold">
      {message}
    </p>
  );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  // Navy text on orange: white on orange fails contrast.
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full min-h-[56px] rounded-xl bg-brand-orange text-brand-navy font-bold text-lg px-6 py-4 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
    >
      {loading ? "Sending…" : children}
    </button>
  );
}

export function PageHero({ title, intro, backHref }: { title: string; intro: string; backHref: string }) {
  return (
    <>
      <div className="bg-brand-teal">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl">{title}</h1>
        </div>
      </div>
      <div className="h-2 bg-brand-orange" aria-hidden="true" />
      <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <p className="text-lg leading-relaxed">{intro}</p>
        <Link
          href={backHref}
          className="mt-3 inline-flex min-h-[44px] items-center font-semibold underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
        >
          Back to Board vacancies
        </Link>
      </div>
    </>
  );
}
