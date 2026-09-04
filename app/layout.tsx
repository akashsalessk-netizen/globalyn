import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Globalyn | Global News, Business & Innovation",
    template: "%s | Globalyn",
  },

  description:
    "Globalyn delivers the latest global news, business insights, technology trends, innovation stories, startup news, and ideas shaping the future.",

  keywords: [
    "Global News",
    "Business News",
    "Global Business",
    "Technology News",
    "Innovation",
    "Startups",
    "Artificial Intelligence",
    "AI News",
    "Business Insights",
    "Technology Trends",
    "Global Innovation",
    "Globalyn",
  ],

  authors: [
    {
      name: "Globalyn",
    },
  ],

  creator: "Globalyn",
  publisher: "Globalyn",

  category: "News and Media",

  applicationName: "Globalyn",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  openGraph: {
    title: "Globalyn | Global News, Business & Innovation",

    description:
      "Discover global news, business insights, technology trends, innovation stories, startups, and ideas shaping the future.",

    siteName: "Globalyn",

    type: "website",

    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",

    title: "Globalyn | Global News, Business & Innovation",

    description:
      "Global news, business insights, technology, innovation, and stories shaping tomorrow.",

    creator: "@Globalyn",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,

      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}