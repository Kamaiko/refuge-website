"use client";

import { useActionState } from "react";
import { submitReservation, type ReservationState } from "@/actions/reservation";
import RevealText from "@/components/common/RevealText";
import RevealOnScroll from "@/components/common/RevealOnScroll";

const initialState: ReservationState = { ok: false, message: "" };

const refuges = [
  { value: "aubepine", label: "Aubépine — au creux de la forêt" },
  { value: "galets", label: "Galets — au bord du fleuve" },
  { value: "brume", label: "Brume — sur le promontoire" },
  { value: "trois", label: "Les trois ensemble" },
];

export default function Reservation() {
  const [state, formAction, pending] = useActionState(submitReservation, initialState);

  return (
    <section
      id="reservation"
      className="relative w-full px-5 md:px-10 py-32 bg-base-noir-soft"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 max-w-3xl">
          <RevealText
            mode="words"
            stagger={0.04}
            className="text-creme-dim text-xs uppercase tracking-[0.3em] mb-8"
          >
            Réservation
          </RevealText>

          <RevealText
            as="h2"
            mode="lines"
            className="text-creme text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight"
          >
            {"Choisir un refuge,\nune date."}
          </RevealText>

          <RevealOnScroll y={20} className="mt-8">
            <p className="text-creme-dim text-base leading-relaxed">
              Une demande, pas un panier. Nous répondons dans les vingt-quatre heures.
            </p>
          </RevealOnScroll>
        </div>

        <RevealOnScroll y={32} stagger={0.05}>
          <form action={formAction} className="grid gap-6 md:grid-cols-2">
            <Field label="Nom" name="nom" type="text" required errors={state.errors?.nom} />
            <Field label="Courriel" name="email" type="email" required errors={state.errors?.email} />

            <div className="md:col-span-2">
              <label className="text-creme-dim text-[10px] uppercase tracking-[0.2em] block mb-3">
                Refuge
              </label>
              <select
                name="refuge"
                required
                defaultValue="aubepine"
                className="w-full bg-transparent border border-creme/20 rounded-full px-5 py-3.5 text-creme text-sm focus:outline-none focus:border-creme transition-colors"
              >
                {refuges.map((r) => (
                  <option key={r.value} value={r.value} className="bg-base-noir">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <Field label="Arrivée" name="arrivee" type="date" required errors={state.errors?.arrivee} />
            <Field label="Départ" name="depart" type="date" required errors={state.errors?.depart} />

            <div className="md:col-span-2">
              <label className="text-creme-dim text-[10px] uppercase tracking-[0.2em] block mb-3">
                Mot, intention, question (optionnel)
              </label>
              <textarea
                name="message"
                rows={4}
                maxLength={500}
                className="w-full bg-transparent border border-creme/20 rounded-2xl px-5 py-3.5 text-creme text-sm focus:outline-none focus:border-creme transition-colors resize-none"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between mt-4">
              <p className={`text-sm ${state.ok ? "text-turquoise" : "text-creme-dim"}`} aria-live="polite">
                {state.message}
              </p>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-creme px-8 py-4 text-sm font-medium text-base-noir transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Envoi…" : "Envoyer la demande"}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 11L11 3M11 3H4M11 3V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type,
  required,
  errors,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  errors?: string[];
}) {
  return (
    <div>
      <label htmlFor={name} className="text-creme-dim text-[10px] uppercase tracking-[0.2em] block mb-3">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full bg-transparent border border-creme/20 rounded-full px-5 py-3.5 text-creme text-sm focus:outline-none focus:border-creme transition-colors"
      />
      {errors?.[0] ? (
        <p className="text-orange-sunset text-xs mt-2">{errors[0]}</p>
      ) : null}
    </div>
  );
}
