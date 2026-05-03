import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import SmoothScroll from "@/components/common/SmoothScroll";
import CustomCursor from "@/components/common/CustomCursor";
import { MenuProvider } from "@/components/common/MenuContext";
import MenuOverlay from "@/components/common/MenuOverlay";
import { ReservePanelProvider } from "@/components/common/ReservePanelContext";
import ReservePanel from "@/components/common/ReservePanel";
import { SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

const hostGrotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_TITLE = `${SITE_CONFIG.name} — Refuges Charlevoix`;
const SITE_DESCRIPTION =
  "Trois refuges contemporains posés dans la forêt boréale de Charlevoix, ouverts sur le Saint-Laurent.";

export const metadata: Metadata = {
  // Resolves relative URLs (OG images etc.) to absolute. Set
  // NEXT_PUBLIC_SITE_URL in the deployment env to the production URL —
  // dev falls back to localhost so social-sharing previews work locally.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "fr_CA",
    siteName: SITE_CONFIG.name,
    // Hero AVIF as the placeholder OG image. Swap for a 1200×630 PNG/JPG
    // when the final brand asset lands — AVIF is supported by LinkedIn /
    // Slack / iMessage but Twitter/X falls back to a generic preview.
    images: [{ url: "/images/hero-shape.avif", width: 1920, height: 1080, alt: SITE_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/hero-shape.avif"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${hostGrotesk.variable} antialiased`}>
      <body>
        <MenuProvider>
          <ReservePanelProvider>
            <SmoothScroll>{children}</SmoothScroll>
            <MenuOverlay />
            <ReservePanel />
            <CustomCursor />
          </ReservePanelProvider>
        </MenuProvider>
      </body>
    </html>
  );
}
