import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { NavbarWrapper } from "@/components/layout/navbar-wrapper";
import { FooterWrapper } from "@/components/layout/footer-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LuckyDraw.pk - Win Exciting Prizes",
  description: "Join LuckyDraw.pk and participate in exciting lucky draw events to win amazing prizes!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full dark">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4163781606095908"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.className} w-full overflow-x-hidden`}>
        <AuthProvider>
          <NavbarWrapper>
            <Navbar />
          </NavbarWrapper>
          <main className="min-h-screen w-full">{children}</main>
          <FooterWrapper>
            <Footer />
          </FooterWrapper>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

