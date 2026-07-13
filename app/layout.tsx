import type { Metadata } from "next";
import "./app.css";

export const metadata: Metadata = {
  title: "Astreo",
  description: "Astreo — vino, solidarietà e cultura",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
