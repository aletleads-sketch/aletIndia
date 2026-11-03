/**
 * High-resolution (≈4K) cover and in-article images for each blog post.
 * Kept apart from the generated `blogs-data.ts` so `npm run import:blogs` can't overwrite them.
 *
 * Files live in `public/images/blogs/hd/` as `<name>.webp` (3840px wide) plus
 * `<name>-1920.webp` and `<name>-960.webp`; `lib/image-loader.ts` picks the variant per width.
 * All photos are from Unsplash (free Unsplash License); `source` records the original.
 */
export type BlogImage = {
  src: string;
  alt: string;
  source: string;
};

const hd = (name: string) => `/images/blogs/hd/${name}.webp`;

export const blogImages: Record<string, { cover: BlogImage; inline?: BlogImage }> = {
  "why-user-centric-design-is-key-to-app-success": {
    cover: {
      src: hd("why-user-centric-design-is-key-to-app-success"),
      alt: "Designer sketching app wireframes and user flows on paper beside a laptop",
      source: "https://unsplash.com/photos/man-designing-wireframes-at-desk-with-laptop-pqzRfBhd9r0",
    },
  },
  "latest-ui-ux-trends-for-mobile-apps-in-2025": {
    cover: {
      src: hd("latest-ui-ux-trends-for-mobile-apps-in-2025"),
      alt: "Two smartphones showing modern mobile app interfaces side by side",
      source: "https://unsplash.com/photos/two-smartphones-displaying-different-app-interfaces-rIC8rWEe7cs",
    },
  },
  "startup-app-development-a-step-by-step-guide-to-launching-your-idea": {
    cover: {
      src: hd("startup-app-development-a-step-by-step-guide-to-launching-your-idea"),
      alt: "Startup team planning a product roadmap at a whiteboard",
      source: "https://unsplash.com/photos/three-men-sitting-while-using-laptops-and-watching-man-beside-whiteboard-wD1LRb9OeEo",
    },
  },
  "how-mobile-apps-are-revolutionizing-industries-healthcare-retail-and-education": {
    cover: {
      src: hd("how-mobile-apps-are-revolutionizing-industries-healthcare-retail-and-education"),
      alt: "Doctor reviewing a patient's scan with them on a tablet",
      source: "https://unsplash.com/photos/doctor-shows-patient-medical-scan-on-tablet-6qN9yEK5k9U",
    },
  },
  "why-your-business-needs-a-mobile-app-with-real-case-studies": {
    cover: {
      src: hd("why-your-business-needs-a-mobile-app-with-real-case-studies"),
      alt: "Food stall owner managing orders on a smartphone at the counter",
      source: "https://unsplash.com/photos/a-man-in-an-apron-looking-at-a-cell-phone-uk3ey_vhDKA",
    },
  },
  "app-development-costs-in-2025-what-to-expect": {
    cover: {
      src: hd("app-development-costs-in-2025-what-to-expect"),
      alt: "Calculator and pencil on handwritten cost estimates",
      source: "https://unsplash.com/photos/a-calculator-and-a-pen-sitting-on-top-of-a-piece-of-paper-Vs6ip7fsld8",
    },
  },
  "how-mobile-apps-help-boost-business-roi-in-2025": {
    cover: {
      src: hd("how-mobile-apps-help-boost-business-roi-in-2025"),
      alt: "Performance analytics dashboard with growth charts on a laptop",
      source: "https://unsplash.com/photos/graphs-of-performance-analytics-on-a-laptop-screen-JKUTrJ4vK00",
    },
  },
  "why-your-startup-needs-a-cross-platform-mobile-app": {
    cover: {
      src: hd("why-your-startup-needs-a-cross-platform-mobile-app"),
      alt: "Laptop, tablet and smartphone side by side on a desk",
      source: "https://unsplash.com/photos/macbook-pro-beside-ipad-and-iphone-turned-on-2mc2B5iX6as",
    },
  },
  "the-role-of-5g-in-shaping-the-future-of-mobile-apps": {
    cover: {
      src: hd("the-role-of-5g-in-shaping-the-future-of-mobile-apps"),
      alt: "Mobile network antenna tower against a clear blue sky",
      source: "https://unsplash.com/photos/a-cell-phone-tower-with-a-blue-sky-in-the-background-_-PY-2WQl10",
    },
  },
  "progressive-web-apps-vs-native-apps-which-is-better-for-your-business": {
    cover: {
      src: hd("progressive-web-apps-vs-native-apps-which-is-better-for-your-business"),
      alt: "The same web app open on a laptop and a smartphone",
      source: "https://unsplash.com/photos/a-person-holding-a-cell-phone-in-front-of-a-laptop-VkhP-zriXZQ",
    },
  },
  "how-to-choose-the-right-tech-stack-for-your-mobile-app": {
    cover: {
      src: hd("how-to-choose-the-right-tech-stack-for-your-mobile-app"),
      alt: "Code editor showing a React project's source files",
      source: "https://unsplash.com/photos/code-editor-displaying-react-source-code-mZnx9429i94",
    },
  },
  "how-ai-ml-are-transforming-mobile-apps-3-game-changing-innovations": {
    cover: {
      src: hd("how-ai-ml-are-transforming-mobile-apps-3-game-changing-innovations"),
      alt: "Glowing brain above a processor chip, representing on-device AI",
      source: "https://unsplash.com/photos/a-brain-over-cpu-represents-artificial-intelligence-sv2SuTA-9ug",
    },
  },
  "flutter-vs-react-native-which-framework-to-choose": {
    cover: {
      src: hd("flutter-vs-react-native-which-framework-to-choose"),
      alt: "Smartphone running an app in front of monitors full of code",
      source: "https://unsplash.com/photos/smartphone-and-computer-monitors-with-code-6sAl6aQ4OWI",
    },
  },
  "top-mobile-app-development-trends": {
    cover: {
      src: hd("top-mobile-app-development-trends"),
      alt: "Hand holding an unfolded foldable smartphone",
      source: "https://unsplash.com/photos/foldable-smartphone-with-green-screen-pdrh34RP6-U",
    },
  },
  "why-augmented-reality-ar-is-highly-important-for-businesses": {
    cover: {
      src: hd("why-augmented-reality-ar-is-highly-important-for-businesses"),
      alt: "Smartphone camera view previewing furniture in a room, AR style",
      source: "https://unsplash.com/photos/person-holding-black-android-smartphone-Mec-pTTcXlA",
    },
    inline: {
      src: hd("why-augmented-reality-ar-is-highly-important-for-businesses-detail"),
      alt: "A smartphone layering a digital view over the real-world scene",
      source: "https://unsplash.com/photos/person-holding-smartphone-showing-compendium-photo-1PmpbSuLxL0",
    },
  },
  "why-is-online-ticketing-system-highly-beneficial-for-event-organization": {
    cover: {
      src: hd("why-is-online-ticketing-system-highly-beneficial-for-event-organization"),
      alt: "Concert-goer filming a live show on a smartphone",
      source: "https://unsplash.com/photos/person-holding-smartphone-taking-video-of-a-concert-near-stage-with-lights-during-nighttime-JNuKyKXLh8U",
    },
  },
  "how-mobile-applications-are-beneficial-for-the-growth-of-business": {
    cover: {
      src: hd("how-mobile-applications-are-beneficial-for-the-growth-of-business"),
      alt: "Shop owner taking an order on a smartphone and tablet point-of-sale",
      source: "https://unsplash.com/photos/person-holding-smartphone-beside-tablet-computer-Xn5FbEM9564",
    },
    inline: {
      src: hd("how-mobile-applications-are-beneficial-for-the-growth-of-business-detail"),
      alt: "Customer paying with a mobile wallet at a card reader",
      source: "https://unsplash.com/photos/person-using-smartphone-for-contactless-payment-XH2JFgT4Abc",
    },
  },
  "how-artificial-intelligence-is-boosting-growth-of-organizations-in-the-digital-era": {
    cover: {
      src: hd("how-artificial-intelligence-is-boosting-growth-of-organizations-in-the-digital-era"),
      alt: "Circuit-board brain illustration representing artificial intelligence",
      source: "https://unsplash.com/photos/a-computer-circuit-board-with-a-brain-on-it-_0iV9LmPDn0",
    },
    inline: {
      src: hd("how-artificial-intelligence-is-boosting-growth-of-organizations-in-the-digital-era-detail"),
      alt: "Robot and human hands reaching toward the letters AI",
      source: "https://unsplash.com/photos/robot-and-human-hands-reaching-toward-ai-text-FHgWFzDDAOs",
    },
  },
  "an-insight-into-software-developments-in-india": {
    cover: {
      src: hd("an-insight-into-software-developments-in-india"),
      alt: "Indian software team collaborating around laptops in a meeting room",
      source: "https://unsplash.com/photos/six-colleagues-collaborating-around-a-conference-table-with-laptops-RdEFWm0N84o",
    },
    inline: {
      src: hd("an-insight-into-software-developments-in-india-detail"),
      alt: "City skyline lit up at dusk, seen from above",
      source: "https://unsplash.com/photos/aerial-view-of-city-buildings-during-night-time-ky1d-IWCBis",
    },
  },
};
