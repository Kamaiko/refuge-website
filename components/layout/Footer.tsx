import { SITE_CONFIG } from "@/lib/constants";
import RevealOnScroll from "@/components/common/RevealOnScroll";

export default function Footer() {
  return (
    <footer className="relative w-full px-5 md:px-10 py-20 border-t border-creme/10">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll y={24} stagger={0.1} className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="text-creme text-3xl md:text-4xl font-semibold tracking-tight">
              {SITE_CONFIG.name}
            </span>
            <p className="text-creme-dim mt-6 max-w-sm text-sm leading-relaxed">
              {SITE_CONFIG.heroSubcopy}
            </p>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <p className="text-creme-dim text-[10px] uppercase tracking-[0.2em] mb-4">
              Visiter
            </p>
            <ul className="space-y-2 text-sm text-creme/90">
              <li><a href="#refuges" className="hover:text-creme">Les refuges</a></li>
              <li><a href="#experiences" className="hover:text-creme">Expériences</a></li>
              <li><a href="#reservation" className="hover:text-creme">Réservation</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-creme-dim text-[10px] uppercase tracking-[0.2em] mb-4">
              Suivre
            </p>
            <ul className="space-y-2 text-sm text-creme/90">
              <li><a href="#" className="hover:text-creme">Instagram</a></li>
              <li><a href="#" className="hover:text-creme">Bulletin saisonnier</a></li>
              <li><a href="mailto:bonjour@example.com" className="hover:text-creme">bonjour@brume.ca</a></li>
            </ul>
          </div>
        </RevealOnScroll>

        <div className="mt-16 flex flex-col gap-4 border-t border-creme/10 pt-8 text-xs text-creme-dim md:flex-row md:items-center md:justify-between">
          <p>
            Concept fictif — projet portfolio par Patrick Patenaude. Aucune réservation réelle.
          </p>
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. Charlevoix, Québec.</p>
        </div>
      </div>
    </footer>
  );
}
