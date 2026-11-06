import Script from "next/script";
import { GA_PATTERN, GTM_PATTERN, type AnalyticsSettings } from "@/lib/analytics-shared";

/** Google Analytics and/or Tag Manager, as set in the admin's Site Settings → Analytics. */
export function Analytics({ settings }: { settings: AnalyticsSettings }) {
  // Ids are checked again here: only a well-formed id ever reaches the page's scripts.
  const ga = settings.gaId && GA_PATTERN.test(settings.gaId) ? settings.gaId : null;
  const gtm = settings.gtmId && GTM_PATTERN.test(settings.gtmId) ? settings.gtmId : null;
  return (
    <>
      {ga ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      ) : null}
      {gtm ? (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      ) : null}
    </>
  );
}
