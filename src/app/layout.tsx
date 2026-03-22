import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://huerto.info"),
  title: "Inscripció Boda en Huerto",
  description: "Boda en Huerto: 12/03, 22:30",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Inscripció Boda en Huerto",
    description: "Boda en Huerto: 12/03, 22:30",
    url: "https://huerto.info",
    siteName: "Huerto",
    images: [
      {
        url: "https://huerto.info/logo.png",
        alt: "Huerto",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inscripció Boda en Huerto",
    description: "Boda en Huerto: 12/03, 22:30",
    images: ["https://huerto.info/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
