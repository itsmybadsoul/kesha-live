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
  title: "Stocks Indicators - Smart Trading Platform",
  description: "Advanced indicators and predictive analytics for smart stock trading.",
};

import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@/context/ToastContext";
import { CryptoProvider } from "@/context/CryptoContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Footer } from "@/components/Footer";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <CryptoProvider>
            <UserProvider>
              <ToastProvider>
                <AnalyticsTracker />
                <div className="flex flex-col min-h-screen">
                  <div className="flex-1">{children}</div>
                  <Footer />
                </div>
              </ToastProvider>
            </UserProvider>
          </CryptoProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
