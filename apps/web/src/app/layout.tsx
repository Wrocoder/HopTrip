import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HopTrip — tanie wyjazdy z Polski",
  description: "Odkrywaj prawdziwe okazje podróżnicze z Polski.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}

