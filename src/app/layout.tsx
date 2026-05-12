import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cactus Vault Prototype",
  description: "Mike-style CRE Vault prototype for multifamily acquisition teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
