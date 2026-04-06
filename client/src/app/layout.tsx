import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata: Metadata = {
  metadataBase: new URL("https://cvrise.com"),
  title: {
    default: "CVRise | Build ATS-Ready Resume & Cover Letter",
    template: "%s | CVRise",
  },
  description: "Create, tailor, and export professional resumes and cover letters with live preview and AI-powered optimization.",
  applicationName: "CVRise",
  keywords: [
    "CV builder",
    "resume builder",
    "cover letter",
    "ATS resume",
    "AI resume",
    "job application",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/images/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/images/favicon.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
  openGraph: {
    type: "website",
    url: "https://cvrise.com",
    title: "CVRise | Build ATS-Ready Resume & Cover Letter",
    description: "Create, tailor, and export professional resumes and cover letters with live preview and AI-powered optimization.",
    siteName: "CVRise",
    images: [
      {
        url: "/images/hero.png",
        width: 1200,
        height: 630,
        alt: "CVRise resume and cover letter builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CVRise | Build ATS-Ready Resume & Cover Letter",
    description: "Create, tailor, and export professional resumes and cover letters with live preview and AI-powered optimization.",
    images: ["/images/hero.png"],
  },
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID as string}>
            <AuthProvider>{children}</AuthProvider>
          </GoogleOAuthProvider>
      </body>
    </html>
  );
}
