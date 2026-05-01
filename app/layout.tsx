import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import SmoothScroll from "@/components/common/SmoothScroll";
import CustomCursor from "@/components/common/CustomCursor";
import { MenuProvider } from "@/components/common/MenuContext";
import MenuOverlay from "@/components/common/MenuOverlay";
import "./globals.css";

const hostGrotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brume — Refuges Charlevoix",
  description:
    "Trois refuges contemporains posés dans la forêt boréale de Charlevoix, ouverts sur le Saint-Laurent.",
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
          <SmoothScroll>{children}</SmoothScroll>
          <MenuOverlay />
          <CustomCursor />
        </MenuProvider>
      </body>
    </html>
  );
}
