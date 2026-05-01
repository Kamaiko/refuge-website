"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { PANEL } from "@/lib/motion";
import { useReservePanel } from "@/components/common/ReservePanelContext";
import { UNITES } from "@/lib/data/unites";
import { submitReservation } from "@/actions/reservation";

type RefugeSlug = "aubepine" | "galets" | "brume" | "trois";

const TROIS_REFUGES_RATE = 1100; // bundle rate per night when picking the three together

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

export default function ReservePanel() {
  const { isOpen, close } = useReservePanel();
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [refuge, setRefuge] = useState<RefugeSlug>("aubepine");
  const [arrivee, setArrivee] = useState("");
  const [depart, setDepart] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  // Sync initial state with GSAP cache (avoid CSS transform / xPercent drift)
  useGSAP(() => {
    if (panelRef.current) gsap.set(panelRef.current, { xPercent: 100 });
    if (backdropRef.current) gsap.set(backdropRef.current, { opacity: 0, pointerEvents: "none" });
  }, []);

  // Animate panel + backdrop on open/close
  useGSAP(
    () => {
      const backdrop = backdropRef.current;
      const panel = panelRef.current;
      if (!backdrop || !panel) return;

      if (isOpen) {
        gsap.to(backdrop, {
          opacity: 1,
          pointerEvents: "auto",
          duration: 0.35,
          ease: PANEL.ease,
        });
        gsap.to(panel, {
          xPercent: 0,
          duration: PANEL.open,
          ease: PANEL.ease,
        });
      } else {
        gsap.to(backdrop, {
          opacity: 0,
          pointerEvents: "none",
          duration: 0.35,
          ease: PANEL.closeEase,
        });
        gsap.to(panel, {
          xPercent: 100,
          duration: PANEL.close,
          ease: PANEL.closeEase,
        });
      }
    },
    { dependencies: [isOpen] },
  );

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Escape closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  const nights = useMemo(() => diffNights(arrivee, depart), [arrivee, depart]);
  const dailyRate = useMemo(() => {
    if (refuge === "trois") return TROIS_REFUGES_RATE;
    return UNITES.find((u) => u.slug === refuge)?.tarifParNuit ?? 0;
  }, [refuge]);
  const total = nights * dailyRate;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("refuge", refuge);
    formData.set("arrivee", arrivee);
    formData.set("depart", depart);
    const result = await submitReservation({ ok: false, message: "" }, formData);
    setSubmitting(false);
    setFeedback({ ok: result.ok, message: result.message });
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
        className="fixed top-0 right-0 z-[210] h-dvh w-full md:w-[480px] bg-base-noir text-creme overflow-y-auto"
      >
        <div className="flex flex-col min-h-full p-6 md:p-8">
          {/* Close */}
          <button
            type="button"
            onClick={close}
            aria-label="Fermer la réservation"
            className="self-start inline-flex h-9 w-9 items-center justify-center rounded-pill border border-creme/30 text-creme hover:border-creme transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Heading */}
          <div className="mt-10">
            <p className="text-creme-dim text-[10px] uppercase tracking-[0.3em] mb-4">
              Réservation
            </p>
            <h2 className="text-creme text-3xl md:text-4xl font-semibold leading-[1.05] tracking-tight">
              {"Choisir un refuge,\nune date."}
            </h2>
            <p className="text-creme-dim mt-4 text-sm leading-relaxed max-w-md">
              Une demande, pas un panier. Nous répondons dans les vingt-quatre heures.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-10 flex-1">
            {/* (1) Refuge selection */}
            <fieldset className="flex flex-col gap-4">
              <legend className="text-creme/90 text-sm">
                <span className="text-creme-dim/60 mr-2">(1)</span>Quel refuge ?
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {UNITES.map((unite) => {
                  const selected = refuge === unite.slug;
                  return (
                    <button
                      key={unite.slug}
                      type="button"
                      onClick={() => setRefuge(unite.slug as RefugeSlug)}
                      className={`group relative aspect-[3/4] overflow-hidden rounded-soft transition-all ${
                        selected
                          ? "ring-2 ring-creme ring-offset-2 ring-offset-base-noir"
                          : "ring-1 ring-creme/15 hover:ring-creme/40"
                      }`}
                    >
                      <Image
                        src={unite.image}
                        alt={unite.nom}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-base-noir/85 to-transparent px-2 pt-6 pb-2">
                        <span className="block text-creme text-xs font-medium tracking-tight">
                          {unite.nom}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setRefuge("trois")}
                className={`text-left text-xs px-4 py-3 rounded-soft transition-colors ${
                  refuge === "trois"
                    ? "bg-creme text-base-noir"
                    : "border border-creme/15 text-creme/80 hover:border-creme/40"
                }`}
              >
                Les trois ensemble — privatisation complète
              </button>
            </fieldset>

            {/* (2) Dates */}
            <fieldset className="flex flex-col gap-4">
              <legend className="text-creme/90 text-sm">
                <span className="text-creme-dim/60 mr-2">(2)</span>Combien de temps ?
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <DateInput label="Arrivée" name="arrivee" value={arrivee} onChange={setArrivee} />
                <DateInput label="Départ" name="depart" value={depart} onChange={setDepart} />
              </div>
            </fieldset>

            {/* (3) Contact */}
            <fieldset className="flex flex-col gap-4">
              <legend className="text-creme/90 text-sm">
                <span className="text-creme-dim/60 mr-2">(3)</span>Vous êtes ?
              </legend>
              <input
                type="text"
                name="nom"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom"
                className="w-full bg-transparent border border-creme/20 rounded-pill px-5 py-3 text-creme text-sm placeholder:text-creme-dim/50 focus:outline-none focus:border-creme transition-colors"
              />
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Courriel"
                className="w-full bg-transparent border border-creme/20 rounded-pill px-5 py-3 text-creme text-sm placeholder:text-creme-dim/50 focus:outline-none focus:border-creme transition-colors"
              />
            </fieldset>

            {/* Spacer pushes summary to bottom */}
            <div className="flex-1" />

            {/* Summary + CTA */}
            <div className="border-t border-creme/10 pt-6 flex items-end justify-between gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-creme-dim/60 text-[10px] uppercase tracking-[0.2em]">
                  Séjour
                </span>
                <span className="text-creme text-sm">
                  {nights > 0 ? `${nights} ${nights === 1 ? "nuit" : "nuits"}` : "—"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-creme-dim/60 text-[10px] uppercase tracking-[0.2em]">
                  Estimation
                </span>
                <span className="text-creme text-sm tabular-nums">
                  {total > 0 ? formatCAD(total) : "—"}
                </span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-pill bg-creme px-6 py-3 text-sm font-medium text-base-noir transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Envoi…" : "Suivant"}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 11L11 3M11 3H4M11 3V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

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
      <span className="text-creme-dim/60 text-[10px] uppercase tracking-[0.2em]">{label}</span>
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
