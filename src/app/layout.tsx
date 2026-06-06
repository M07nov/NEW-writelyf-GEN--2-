import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Writelyf HealthOS – Your Family's Health Memory",
  description:
    "Upload reports, prescriptions, and medical files. Writelyf organizes them, explains key values, builds a health timeline, and creates doctor-ready summaries.",
  keywords: ["health records", "medical records", "family health", "AI health", "doctor summary"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
            },
            success: { style: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" } },
            error: { style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" } },
          }}
        />
      </body>
    </html>
  );
}
