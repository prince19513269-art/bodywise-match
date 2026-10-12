import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Navigation, Footer } from "@/components/shell";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Bodywise Match — Skincare, made clear",
    template: "%s | Bodywise Match",
  },
  description:
    "Understand ingredients. Compare products. Choose with clarity. An independent skincare discovery companion.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Navigation />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
