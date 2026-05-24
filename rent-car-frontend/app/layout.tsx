import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RentCar",
  description: "Modern car and motorbike rental platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read non-httpOnly cookies to pass initial auth state to client
  const cookieStore = await cookies();
  const email = cookieStore.get("email")?.value ?? null;
  const role = (cookieStore.get("role")?.value ?? null) as
    | "USER"
    | "ADMIN"
    | null;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-zinc-50 font-sans antialiased">
        <Providers initialEmail={email} initialRole={role}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
