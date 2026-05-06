import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "KX-01 Mechanical Keyboard",
  description: "Hyper-premium cinematic scrollytelling experience for the KX-01 mechanical keyboard.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
