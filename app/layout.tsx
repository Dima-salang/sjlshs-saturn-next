import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saturn OS | Orbital Management",
  description: "Next-generation attendance and school management system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050508] text-zinc-100 min-h-screen`}
      >
        <AuthProvider>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
          <Toaster theme="dark" position="top-center" expand={false} richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
