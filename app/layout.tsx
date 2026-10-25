import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Viaoda_Libre, Kapakana } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const viaoda = Viaoda_Libre({
  variable: "--font-viaoda",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const kapakana = Kapakana({
  variable: "--font-kapakana",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Wedding of Meli & Kevin",
  description: "You are invited to the wedding of Meli & Kevin — Saturday, 11 April 2026.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${viaoda.variable} ${kapakana.variable}`}>
      <head>
        {/* the browser must not remember the scroll position: every visit and refresh starts on the first slide */}
        <script dangerouslySetInnerHTML={{ __html: 'try{history.scrollRestoration="manual"}catch(e){}' }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
