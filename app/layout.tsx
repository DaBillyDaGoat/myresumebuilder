import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyResumeBuilder — Free Professional Resume Builder",
  description: "Build a professional resume for free. AI-powered, step-by-step guidance in English and Spanish. No experience needed.",
  keywords: "free resume builder, resume, CV, bilingual, English, Spanish, AI resume",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-white text-gray-900 antialiased" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
