import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastNotification from "@/components/ToastNotification";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Jagalchi Chef",
  description: "Market Modern & Trustful Food Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <ToastNotification />
      </body>
    </html>
  );
}
