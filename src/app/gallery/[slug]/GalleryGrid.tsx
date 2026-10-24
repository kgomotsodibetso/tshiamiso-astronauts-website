"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type GalleryPhoto = { src: string; downloadUrl: string; name: string };

export function GalleryGrid({ photos, label }: { photos: GalleryPhoto[]; label: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(null);
    lastTrigger.current?.focus();
  }, []);
  const step = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab") {
        // The dialog is modal, so keep keyboard focus inside it.
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("a[href], button");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (!dialogRef.current?.contains(active) || (e.shiftKey && active === first)) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, step]);

  const current = open === null ? null : photos[open];

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, i) => (
          <li key={photo.src} className="group relative aspect-square overflow-hidden rounded-xl bg-brand-card">
            <button
              type="button"
              onClick={(e) => {
                lastTrigger.current = e.currentTarget;
                setOpen(i);
              }}
              aria-label={`View photo ${i + 1} of ${photos.length}`}
              className="absolute inset-0 block h-full w-full focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-orange"
            >
              <Image
                src={photo.src}
                alt={`${label} photo ${i + 1}`}
                fill
                loading={i < 8 ? "eager" : "lazy"}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
            <a
              href={photo.downloadUrl}
              download={photo.name}
              aria-label={`Download photo ${i + 1}`}
              className="absolute bottom-2 right-2 inline-flex min-h-[44px] items-center rounded-lg bg-brand-navy/85 px-3 text-xs font-bold text-white hover:bg-brand-navy focus-visible:ring-4 focus-visible:ring-brand-orange"
            >
              Download
            </a>
          </li>
        ))}
      </ul>

      {current && open !== null && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${open + 1} of ${photos.length}`}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
            <p className="text-sm font-semibold">
              {open + 1} / {photos.length}
            </p>
            <div className="flex items-center gap-2">
              <a
                href={current.downloadUrl}
                download={current.name}
                className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-orange px-4 text-sm font-bold text-brand-navy hover:opacity-90"
              >
                Download
              </a>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="inline-flex min-h-[44px] items-center rounded-lg bg-white/15 px-4 text-sm font-bold hover:bg-white/25"
              >
                Close
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            <Image
              key={current.src}
              src={current.src}
              alt={`${label} photo ${open + 1}`}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-2xl text-white hover:bg-black/80"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-2xl text-white hover:bg-black/80"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </>
  );
}
