import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import ThemeScript from "@/app/components/ThemeScript";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Auralis — Acoustic Threat Detection Platform",
  description:
    "Auralis detects drone presence from acoustic signatures in real time — mel-spectrogram CNN pipeline with ONNX export for edge deployment on Raspberry Pi and Jetson.",
  keywords: [
    "drone detection",
    "acoustic AI",
    "mel spectrogram",
    "CNN classification",
    "edge AI",
    "ONNX",
    "TensorRT",
    "OpenVINO",
    "Raspberry Pi",
    "Jetson Nano",
  ],
  openGraph: {
    title: "Auralis — Acoustic Threat Detection Platform",
    description:
      "Real-time acoustic drone detection — mel-spectrogram CNN pipeline with ONNX edge deployment.",
    type: "website",
    images: [{ url: "/auralis-mark.svg", width: 512, height: 512, alt: "Auralis logo" }],
  },
  icons: {
    icon: [{ url: "/auralis-mark.svg", type: "image/svg+xml" }],
    apple: "/auralis-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeScript />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
