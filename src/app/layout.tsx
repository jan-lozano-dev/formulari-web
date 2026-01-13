import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://huerto.info"),
  title: "Inscripció huerto",
  description: "Huerto Carnaval 12/02",
  icons: {
    icon: "/Icon_website.png",
    apple: "/Icon_website.png",
  },
  openGraph: {
    title: "Inscripció huerto",
    description: "Huerto Carnaval 12/02",
    url: "https://huerto.info",
    siteName: "Huerto",
    images: [
      {
        url: "https://huerto.info/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Huerto",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inscripció huerto",
    description: "Huerto Carnaval 12/02",
    images: ["https://huerto.info/og-image.jpg"],
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
