"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { PANEL } from "@/lib/motion";
import { useReservePanel } from "@/components/common/ReservePanelContext";
import ArrowDiagonalIcon from "@/components/common/ArrowDiagonalIcon";
import { UNITES } from "@/lib/data/unites";
import { submitReservation } from "@/actions/reservation";

type RefugeSlug = "aubepine" | "galets" | "brume";

const DEFAULT_STAY_NIGHTS = 5;

function formatCAD(value: number) {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

function diffNights(arrival: string, departure: string) {
  if (!arrival || !departure) return 0;
  const a = new Date(arrival).getTime();
  const d = new Date(departure).getTime();
  if (Number.isNaN(a) || Number.isNaN(d)) return 0;
  const ms = d - a;
  if (ms <= 0) return 0;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export default function ReservePanel() {
  const { isOpen, close } = useReservePanel();
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const bottomBarContentRef = useRef<HTMLDivElement>(null);

  const [refuge, setRefuge] = useState<RefugeSlug>("galets");
  const [arrivee, setArrivee] = useState(() => isoDate(0));
  const [depart, setDepart] = useState(() => isoDate(DEFAULT_STAY_NIGHTS));
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // xPercent 105 (not 100): the panel sits at right-4, so translating by
  // exactly its own width leaves a 16px sliver visible. The extra 5% clears
  // the offset.
  // visibility: hidden → visible avoids the SSR flash without adding a CSS
  // class whose `transform` could interfere with GSAP's inline tween parsing.
  useGSAP(() => {
    if (panelRef.current) gsap.set(panelRef.current, { xPercent: 105, visibility: "visible" });
    if (backdropRef.current) gsap.set(backdropRef.current, { opacity: 0, pointerEvents: "none" });
    if (bottomBarRef.current) gsap.set(bottomBarRef.current, { scaleX: 0, transformOrigin: "right center" });
    if (bottomBarContentRef.current) gsap.set(bottomBarContentRef.current, { opacity: 0 });
    if (contentRef.current) gsap.set(contentRef.current, { opacity: 0 });
  }, []);

  useGSAP(
    () => {
      const backdrop = backdropRef.current;
      const panel = panelRef.current;
      const content = contentRef.current;
      const bar = bottomBarRef.current;
      const barContent = bottomBarContentRef.current;
      if (!backdrop || !panel) return;

      if (isOpen) {
        gsap.to(backdrop, {
          opacity: 1,
          pointerEvents: "auto",
          duration: 0.6,
          ease: PANEL.ease,
        });
        gsap.to(panel, {
          xPercent: 0,
          duration: 1.1,
          ease: PANEL.ease,
        });
        if (bar) {
          gsap.to(bar, {
            scaleX: 1,
            duration: 0.85,
            ease: PANEL.ease,
            delay: 0.55,
          });
        }
        if (barContent) {
          gsap.to(barContent, {
            opacity: 1,
            duration: 0.7,
            ease: PANEL.ease,
            delay: 1.1,
          });
        }
        if (content) {
          gsap.to(content, {
            opacity: 1,
            duration: 0.8,
            ease: PANEL.ease,
            delay: 0.85,
          });
        }
      } else {
        if (content) {
          gsap.to(content, {
            opacity: 0,
            duration: 0.4,
            ease: PANEL.closeEase,
          });
        }
        if (barContent) {
          gsap.to(barContent, {
            opacity: 0,
            duration: 0.4,
            ease: PANEL.closeEase,
          });
        }
        if (bar) {
          gsap.to(bar, {
            scaleX: 0,
            duration: 0.55,
            ease: PANEL.closeEase,
            delay: 0.2,
          });
        }
        gsap.to(panel, {
          xPercent: 105,
          duration: 0.85,
          ease: PANEL.closeEase,
          delay: 0.45,
        });
        gsap.to(backdrop, {
          opacity: 0,
          pointerEvents: "none",
          duration: 0.55,
          ease: PANEL.closeEase,
          delay: 0.6,
        });
      }
    },
    { dependencies: [isOpen] },
  );

  // Body scroll lock is owned by SmoothScroll (Lenis stop + body overflow).
  // Duplicating it here previously caused a restore race that left the page
  // non-scrollable after closing.

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  const nights = useMemo(() => diffNights(arrivee, depart), [arrivee, depart]);
  const dailyRate = useMemo(
    () => UNITES.find((u) => u.slug === refuge)?.tarifParNuit ?? 0,
    [refuge],
  );
  const total = nights * dailyRate;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    setFieldErrors({});
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("refuge", refuge);
    formData.set("arrivee", arrivee);
    formData.set("depart", depart);
    const result = await submitReservation({ ok: false, message: "" }, formData);
    setSubmitting(false);
    setFeedback({ ok: result.ok, message: result.message });
    setFieldErrors(result.errors ?? {});
  }

  return (
    <>
      <div
        ref={backdropRef}
        onClick={close}
        aria-hidden
        className="fixed inset-0 z-[200] bg-base-noir/60 backdrop-blur-sm opacity-0"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Réservation"
        // visibility: hidden on SSR; useGSAP flips to visible alongside
        // setting xPercent: 105. A static CSS class with transform was
        // interfering with GSAP's tween parsing on re-open.
        style={{ visibility: "hidden" }}
        className="fixed top-4 right-4 bottom-4 z-[210] w-[calc(100%-2rem)] md:w-[640px] bg-gris-tan text-creme overflow-y-auto rounded-[36px] shadow-2xl"
      >
        <div ref={contentRef} className="flex flex-col min-h-full p-8 md:p-10 pb-32">
          <button
            type="button"
            onClick={close}
            aria-label="Fermer la réservation"
            className="self-start inline-flex h-12 w-12 items-center justify-center rounded-full bg-base-noir text-creme transition-colors hover:bg-base-noir/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-gris-tan"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="mt-12">
            <p className="text-creme-dim text-[10px] uppercase tracking-[0.3em] font-semibold mb-4">
              Réservation
            </p>
            <h2 className="text-creme text-4xl md:text-5xl font-semibold leading-[1.05] tracking-tight whitespace-pre-line">
              {"Choisir un refuge,\nune date."}
            </h2>
            <p className="text-creme-dim mt-5 text-base leading-relaxed max-w-md font-semibold">
              Une demande, pas un panier. Nous répondons dans les vingt-quatre heures.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-14 flex-1">
            <fieldset className="flex flex-col gap-6">
              <legend className="text-creme/90 text-base font-semibold">
                <span className="text-creme-dim/60 mr-2 font-normal">(1)</span>Vos coordonnées
              </legend>
              <TextInput
                label="Nom"
                name="nom"
                type="text"
                autoComplete="name"
                error={fieldErrors.nom?.[0]}
              />
              <TextInput
                label="Courriel"
                name="email"
                type="email"
                autoComplete="email"
                error={fieldErrors.email?.[0]}
              />
            </fieldset>

            <fieldset className="flex flex-col gap-8">
              <legend className="text-creme/90 text-base font-semibold">
                <span className="text-creme-dim/60 mr-2 font-normal">(2)</span>Quel refuge aimeriez-vous réserver ?
              </legend>
              <div className="grid grid-cols-3 gap-3">
                {UNITES.map((unite) => {
                  const selected = refuge === unite.slug;
                  return (
                    <button
                      key={unite.slug}
                      type="button"
                      onClick={() => setRefuge(unite.slug as RefugeSlug)}
                      className={`group relative flex flex-col overflow-hidden rounded-[20px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-gris-tan ${
                        selected
                          ? "bg-creme text-base-noir"
                          : "bg-base-noir/50 text-creme hover:bg-base-noir/70"
                      }`}
                    >
                      <span className="relative block aspect-[4/3] overflow-hidden rounded-[16px] m-2 mb-0 bg-base-noir-soft">
                        <Image
                          src={unite.image}
                          alt={unite.nom}
                          fill
                          sizes="180px"
                          className="object-cover"
                        />
                      </span>
                      <span className="block px-3 py-3 text-center text-sm font-medium tracking-tight">
                        {unite.nom}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-8">
              <legend className="text-creme/90 text-base font-semibold">
                <span className="text-creme-dim/60 mr-2 font-normal">(3)</span>Combien de temps ?
              </legend>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <DateInput label="Arrivée" name="arrivee" value={arrivee} onChange={setArrivee} />
                <DateInput label="Départ" name="depart" value={depart} onChange={setDepart} />
              </div>
            </fieldset>

            {feedback ? (
              <p
                aria-live="polite"
                className={`text-xs ${feedback.ok ? "text-turquoise" : "text-orange-sunset"}`}
              >
                {feedback.message}
              </p>
            ) : null}
          </form>
        </div>

        {/* Bottom bar — pinned to bottom of panel, grows from right */}
        <div
          ref={bottomBarRef}
          className="absolute bottom-4 left-4 right-4 rounded-pill bg-base-noir/95 backdrop-blur-sm origin-right will-change-transform"
        >
          <div
            ref={bottomBarContentRef}
            className="flex items-center justify-between gap-4 px-5 py-3"
          >
            <div className="flex flex-col leading-tight">
              <span className="text-creme-dim/60 text-[10px] uppercase tracking-[0.2em]">
                Séjour
              </span>
              <span className="text-creme text-xs">
                {nights > 0 ? `${nights} ${nights === 1 ? "nuit" : "nuits"}` : "—"}
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-creme-dim/60 text-[10px] uppercase tracking-[0.2em]">
                Estimation
              </span>
              <span className="text-creme text-xs tabular-nums">
                {total > 0 ? formatCAD(total) : "—"}
              </span>
            </div>
            <button
              type="submit"
              onClick={(e) => {
                const form = (e.currentTarget.closest("aside") as HTMLElement)?.querySelector("form");
                if (form) (form as HTMLFormElement).requestSubmit();
              }}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-pill bg-creme px-5 py-2.5 text-xs font-medium text-base-noir transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-base-noir"
            >
              {submitting ? "Envoi…" : "Suivant"}
              <ArrowDiagonalIcon size={12} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function DateInput({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-creme-dim/60 text-[10px] uppercase tracking-[0.2em] font-semibold">{label}</span>
      <input
        type="date"
        name={name}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border border-creme/20 rounded-soft px-4 py-3 text-creme text-sm focus:outline-none focus:border-creme transition-colors"
      />
    </label>
  );
}

function TextInput({
  label,
  name,
  type,
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type: "text" | "email";
  autoComplete?: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-creme-dim/60 text-[10px] uppercase tracking-[0.2em] font-semibold">
        {label}
      </span>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        required
        aria-invalid={error ? "true" : undefined}
        className={`bg-transparent border rounded-soft px-4 py-3 text-creme text-sm focus:outline-none transition-colors ${
          error ? "border-orange-sunset focus:border-orange-sunset" : "border-creme/20 focus:border-creme"
        }`}
      />
      {error ? <span className="text-orange-sunset text-xs">{error}</span> : null}
    </label>
  );
}
