import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist",
});

const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
});

// Display accents (italic words in headings)
const instrument = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    style: ["normal", "italic"],
    variable: "--font-instrument",
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
            <body className={`${geist.variable} ${geistMono.variable} ${instrument.variable} font-sans antialiased`}>
                {children}
                <SpeedInsights />
            </body>
        </html>
    );
}
