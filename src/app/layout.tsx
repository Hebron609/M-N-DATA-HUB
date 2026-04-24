import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./Providers";

export const metadata: Metadata = {
  title: "M&L Data | Affordable Data Bundles in Ghana",
  description:
    "Buy MTN Bundle, AirtelTigo iShare, and Telecel Non-Expiry data at the best prices. Fast delivery, reliable service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
