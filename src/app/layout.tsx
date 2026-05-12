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
              <ToastProvider>{children}</ToastProvider>
            </UserProvider>
          </CryptoProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
