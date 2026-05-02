"use server";

import { z } from "zod";

const ReservationSchema = z.object({
  nom: z.string().min(2, "Veuillez indiquer votre nom."),
  email: z.email("Adresse courriel invalide."),
  refuge: z.enum(["aubepine", "galets", "brume", "trois"]),
  arrivee: z.string().min(1, "Veuillez indiquer la date d'arrivée."),
  depart: z.string().min(1, "Veuillez indiquer la date de départ."),
  message: z.string().max(500).optional(),
});

export type ReservationState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitReservation(
  _prev: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  const raw = {
    nom: formData.get("nom"),
    email: formData.get("email"),
    refuge: formData.get("refuge"),
    arrivee: formData.get("arrivee"),
    depart: formData.get("depart"),
    message: formData.get("message") || undefined,
  };

  const parsed = ReservationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Quelques champs ont besoin d'être vérifiés.",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  // TODO: wire Resend (or another transactional email provider) to deliver
  // the request. For now, the action only validates the payload server-side.

  return {
    ok: true,
    message: "Merci. Nous revenons vers vous dans les vingt-quatre heures.",
  };
}
