import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL as string;

export const metadata: Metadata = {
  metadataBase: siteUrl,
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
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>{children}</AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
