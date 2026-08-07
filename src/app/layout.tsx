import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GiftFlick — AI Video Messages That Go Viral",
  description:
    "Create stunning AI-powered personalized video messages for birthdays, holidays, and every special occasion. Send unforgettable moments in 30 seconds.",
  keywords: ["AI video", "personalized gift", "video message", "birthday video", "gift card alternative"],
  openGraph: {
    title: "GiftFlick — AI Video Messages That Go Viral",
    description: "Create stunning personalized video messages in 30 seconds.",
    type: "website",
    url: "https://giftflick.app",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GiftFlick — AI Video Messages",
    description: "Create stunning personalized video messages in 30 seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(0, 0, 0, 0.9)",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
