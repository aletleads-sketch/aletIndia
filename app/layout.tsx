import type { Metadata } from "next";
import { Archivo, Montserrat, Plus_Jakarta_Sans, Sacramento, Space_Grotesk, Syne } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InquireModalProvider } from "@/components/inquire-modal";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const sacramento = Sacramento({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sacramento",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alet India — Inspired by Technology",
  description:
    "Alet India is a New Delhi technology partner for mobile apps, web applications, UI and graphic design, and digital marketing. Established in 2017.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${syne.variable} ${space.variable} ${archivo.variable} ${sacramento.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-ink">
        <InquireModalProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </InquireModalProvider>
      </body>
    </html>
  );
}
