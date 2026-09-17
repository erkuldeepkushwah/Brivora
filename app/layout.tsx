import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Brivora",
  description:
    "Brivora business consulting and strategic advisory platform featuring service showcases, case studies, executive courses, and client portal.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body>{children}</body>
    </html>
  );
}
