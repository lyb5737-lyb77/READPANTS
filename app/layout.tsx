import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthListener } from "@/components/auth-listener";
import { BackgroundOverlay } from "@/components/background-overlay";
import { SplashScreen } from "@/components/ui/splash-screen";
import { ProfileGuard } from "@/components/auth/profile-guard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "빨간바지 솔로 골프",
  description: "해외 골프 조인 및 여행의 모든 것, 빨간바지 솔로 골프",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 20%, #fef9c3 50%, #fef3c7 80%, #fff7ed 100%)',
          backgroundAttachment: 'fixed'
        }}
      >
        <BackgroundOverlay />
        <SplashScreen />
        <AuthListener />

        <ProfileGuard />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
