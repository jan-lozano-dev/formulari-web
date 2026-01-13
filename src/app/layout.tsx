import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://huerto.info"),
  title: "Formulari de Registre",
  description: "Formulari senzill de registre",
  icons: {
    icon: "/Icon_website.png",
    apple: "/Icon_website.png",
  },
  openGraph: {
    title: "Formulari de Registre",
    description: "Formulari senzill de registre",
    url: "https://huerto.info",
    siteName: "Huerto",
    images: [
      {
        url: "/Icon_website.png",
        width: 800,
        height: 800,
        alt: "Huerto",
      },
    ],
    type: "website",
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
