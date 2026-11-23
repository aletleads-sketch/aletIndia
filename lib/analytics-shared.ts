/** Site Settings → Analytics (row "analytics" of seo_settings): the trackers the public website loads. */
export type AnalyticsSettings = { gaId?: string; gtmId?: string };

/** A Google Analytics 4 measurement id, e.g. G-AB12CD34EF. */
export const GA_PATTERN = /^G-[A-Z0-9]{4,15}$/;
/** A Google Tag Manager container id, e.g. GTM-ABC1234. */
export const GTM_PATTERN = /^GTM-[A-Z0-9]{4,12}$/;
