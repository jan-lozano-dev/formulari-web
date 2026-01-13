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
        url: "https://huerto.info/Icon_website.png",
        width: 1024,
        height: 1024,
        alt: "Huerto",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Inscripció huerto",
    description: "Huerto Carnaval 12/02",
    images: ["https://huerto.info/Icon_website.png"],
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
