import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Sanjeev Atri",
    description: "Create beautiful, powerful forms with ease. Features include conditional logic, quiz mode, analytics, and more.",
    keywords: ["forms", "surveys", "form builder", "Google Forms alternative"],
    authors: [{ name: "Sanjeev Atri" }],
    openGraph: {
        title: "Sanjeev Atri",
        description: "Create beautiful, powerful forms with ease",
        type: "website",
    },
};

import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased`}>
                {children}
                <SpeedInsights />
            </body>
        </html>
    );
}
