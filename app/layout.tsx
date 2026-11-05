import type { Metadata } from "next";
import { Archivo, Montserrat, Plus_Jakarta_Sans, Sacramento, Space_Grotesk, Syne } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InquireModalProvider } from "@/components/inquire-modal";
import { NavigationProgress } from "@/components/navigation-progress";
import { SiteContentProvider } from "@/components/site-content-provider";
import { loadSiteContent } from "@/lib/site-content";
import { NOINDEX, SITE_URL } from "@/lib/seo";
import "./globals.css";
import { JsonLd } from "@/components/json-ld";
import { resolveGeneral } from "@/lib/seo-general-shared";
import { shareImageUrl } from "@/lib/seo-overrides";
import { loadSchemaSettings } from "@/lib/seo-schema";
import { loadSeoSettings } from "@/lib/seo-settings";
import { organizationSchema, type OrganizationData } from "@/lib/seo-schema-shared";

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

// Site-wide defaults; the admin's SEO Settings screen can change them (row 'general' of seo_settings).
export async function generateMetadata(): Promise<Metadata> {
  const general = resolveGeneral((await loadSeoSettings()).general);
  return {
    metadataBase: new URL(`${SITE_URL}/`),
    title: "Alet India | Mobile App & Web Development Company",
    description: general.defaultDescription,
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: general.siteName,
      images: [{ url: shareImageUrl(general.defaultShareImage) }],
    },
    ...(general.googleVerification || general.bingVerification
      ? {
          verification: {
            ...(general.googleVerification ? { google: general.googleVerification } : {}),
            ...(general.bingVerification ? { other: { "msvalidate.01": general.bingVerification } } : {}),
          },
        }
      : {}),
    ...(NOINDEX ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [schema, content] = await Promise.all([loadSchemaSettings(), loadSiteContent()]);
  const { company, services, caseStudies, testimonials, careers, showcase, inquireForm } = content;
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${syne.variable} ${space.variable} ${archivo.variable} ${sacramento.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-ink">
        <JsonLd items={schema.organization.enabled ? [organizationSchema(schema.organization.data as OrganizationData)] : []} />
        <NavigationProgress />
        <SiteContentProvider value={{ company, services, caseStudies, testimonials, careers, showcase, inquireForm }}>
          <InquireModalProvider>
            <Header navigation={content.navigation} />
            <main className="flex-1">{children}</main>
            <Footer />
          </InquireModalProvider>
        </SiteContentProvider>
      </body>
    </html>
  );
}
