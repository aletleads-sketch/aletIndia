import { caseStudies } from "@/lib/content";
import { guriHousesSections, tajikaSections } from "@/lib/case-study-extra-sections";
import { quickSavaariSections } from "@/lib/quick-savaari-sections";
import {
  allDeliveriesSections,
  legacyNarrativeSections,
  type CaseStudyNarrativeSection,
} from "@/lib/case-study-sections";

type CaseStudySource = (typeof caseStudies)[number];

export type DemoCaseStudy = {
  slug: string;
  client: string;
  industry: string;
  title: string;
  summary: string;
  facts: { label: string; value: string }[];
  /** Optional project snapshot rows (Industry, Market, Services, etc.). */
  snapshot?: { label: string; value: string }[];
  screens: { src: string; alt: string }[];
  /** Full right-column narrative (In this file sections). */
  sections?: CaseStudyNarrativeSection[];
  /** Kept for index / legacy helpers. */
  challenge: string[];
  approach: { title: string; body: string }[];
  built: string[];
  outcome: string;
};

/** @deprecated Prefer DemoCaseStudy — kept for gradual migration of index helpers. */
export type CaseStudyDetail = {
  slug: string;
  study: CaseStudySource;
  kicker: string;
  heroTitle: string;
  heroAccent: string;
  challenge: string;
  result: string;
  metrics: [string, string][];
  outcomes: [string, string][];
  steps: [string, string, string][];
};

const findStudy = (name: string, occurrence = 0) => {
  const matches = caseStudies.filter((study) => study.name === name);
  const study = matches[occurrence];
  if (!study) throw new Error(`Missing case study data for ${name}.`);
  return study;
};

/** Featured demo studies — same content/layout as live aletindia.com case files. */
export const demoCaseStudies: DemoCaseStudy[] = [
  {
    slug: "tajika",
    client: "Tajika",
    industry: "Home services",
    title: "Making Home Services Accessible Through a Seamless Digital Booking Experience",
    summary:
      "Connecting customers with home service professionals through convenience, simplicity, and technology.",
    facts: [
      { label: "Market", value: "Kenya, East Africa" },
      { label: "Type", value: "Booking app" },
      { label: "Focus", value: "Discover · schedule · book" },
    ],
    snapshot: [
      { label: "Industry", value: "Home Services & On-Demand Service Booking" },
      { label: "Client Location", value: "Kenya, East Africa" },
      { label: "Project Type", value: "Home Services Booking Application" },
      {
        label: "Services",
        value:
          "Mobile Application Development, UI/UX Design, Software Development & Technical Consulting",
      },
      {
        label: "Core Functionality",
        value: "Service Discovery, Appointment Scheduling & Professional Booking",
      },
    ],
    screens: [
      { src: "/images/work/tajika-1.png", alt: "Tajika home screen" },
      { src: "/images/work/tajika-2.png", alt: "Tajika services screen" },
      { src: "/images/work/tajika-3.png", alt: "Tajika booking screen" },
    ],
    sections: tajikaSections,
    challenge: [
      "Traditional service booking often involves multiple phone calls, manual coordination, and uncertainty around availability.",
      "Tajika needed a digital path where customers could discover services, pick a slot, and book a professional in a few steps.",
    ],
    approach: [
      {
        title: "Customer-centric experience",
        body: "We organised the product around the natural booking journey from discovery to confirmation.",
      },
      {
        title: "Simplified service discovery",
        body: "Services are presented clearly so customers can find the right offering without friction.",
      },
      {
        title: "Convenient scheduling",
        body: "Appointment selection is built into the booking flow so customers plan around their availability.",
      },
    ],
    built: [
      "Service discovery and browsing",
      "Appointment slot selection",
      "Professional booking in a short path",
    ],
    outcome:
      "Tajika brings service discovery, scheduling, and professional booking into one convenient digital experience.",
  },
  {
    slug: "all-deliveries",
    client: "All Deliveries",
    industry: "Logistics",
    title: "Building a Connected Logistics Ecosystem for Ghana",
    summary:
      "Transforming Parcel Delivery, Assisted Shopping, and Vehicle Rental through one integrated digital platform.",
    facts: [
      { label: "Market", value: "Ghana, West Africa" },
      { label: "Type", value: "Multi-app platform" },
      { label: "Status", value: "Under development" },
    ],
    snapshot: [
      { label: "Industry", value: "Logistics & On-Demand Services" },
      { label: "Target Market", value: "Ghana, West Africa" },
      { label: "Project Type", value: "Multi-Application Digital Platform" },
      {
        label: "Services",
        value:
          "Mobile Application Development, Backend Development, UI/UX Design, Quality Assurance, DevOps & Technical Consulting",
      },
      {
        label: "Applications",
        value:
          "Customer App, Delivery Partner App, Shopper App, Sales Agent App, Admin Panel",
      },
      { label: "Project Status", value: "Under Development" },
    ],
    screens: [
      { src: "/images/all-deliveries-login.png", alt: "All Deliveries login — get started" },
      { src: "/images/all-deliveries-track.png", alt: "All Deliveries order status tracking" },
      { src: "/images/all-deliveries-app-menu.png", alt: "All Deliveries app menu" },
      { src: "/images/ALL-DEIVERIES.png", alt: "All Deliveries website" },
    ],
    sections: allDeliveriesSections,
    challenge: [
      "The platform needed to support three distinct service models—Parcel Delivery, Shop for Me, and Rent Delivery Vehicle—each with its own booking process, workflows, and fulfilment requirements.",
      "It also needed to coordinate customers, delivery partners, shoppers, sales agents, and administrators in one connected logistics ecosystem.",
    ],
    approach: [
      {
        title: "Business-centric analysis",
        body: "We mapped how each logistics service would operate end to end before shaping the product.",
      },
      {
        title: "Multi-actor planning",
        body: "Customers, partners, shoppers, agents, and admins were designed as coordinated roles, not separate products.",
      },
      {
        title: "Modular architecture",
        body: "Shared capabilities support distinct service rules across five interconnected applications.",
      },
    ],
    built: [
      "Customer, delivery partner, shopper, and sales agent apps",
      "Admin panel for operational oversight",
      "Parcel, Shop for Me, and vehicle rental workflows",
    ],
    outcome:
      "A structured multi-service logistics foundation is in development, with five interconnected applications and clear room for post-launch enhancements.",
  },
  {
    slug: "guri-houses",
    client: "Guri Houses",
    industry: "Real estate",
    title: "Simplifying Property Discovery Through a Connected Digital Experience",
    summary: "Discover properties. Schedule viewings. Connect directly with owners.",
    facts: [
      { label: "Industry", value: "PropTech" },
      { label: "Type", value: "Property app" },
      { label: "Focus", value: "Explore · schedule · connect" },
    ],
    snapshot: [
      { label: "Industry", value: "Real Estate & Property Technology (PropTech)" },
      { label: "Project Type", value: "Property Discovery & Viewing Booking Application" },
      {
        label: "Services",
        value: "Application Development, UI/UX Design, Software Development & Technical Consulting",
      },
      {
        label: "Core Functionality",
        value: "Property Listings, Viewing Appointments & Direct Owner Communication",
      },
    ],
    sections: guriHousesSections,
    screens: [
      { src: "/images/GURI-HOUSES.png", alt: "Guri Houses property detail" },
      { src: "/images/GURI-HOUSES-2.png", alt: "Guri Houses booking detail" },
    ],
    challenge: [
      "Property deals stall when the listing is vague and the next step is a phone number passed around. Buyers needed the facts on one screen and a direct way to ask for a viewing.",
      "Owners needed the same clarity from the other side: who is interested, and what has been booked.",
    ],
    approach: [
      {
        title: "Put the property first",
        body: "The detail screen leads with the place itself, then the facts a buyer checks before they travel.",
      },
      {
        title: "Make the next step a booking",
        body: "Interest turns into a booked viewing instead of an open-ended chat.",
      },
      {
        title: "Keep both sides in the product",
        body: "Buyers and owners share one app, so the conversation does not leave for a separate thread.",
      },
    ],
    built: [
      "Listing and property detail screens",
      "A booking flow for viewings",
      "A path for the owner and the buyer to stay in contact",
    ],
    outcome:
      "Guri Houses gives a buyer a readable listing and a way to book, and gives the owner a record of that interest.",
  },
  {
    slug: "quick-savaari",
    client: "Quick Savaari",
    industry: "Mobility",
    title: "Making Everyday Travel Simpler Through Smart Ride-Booking Technology",
    summary: "Book Faster. Travel Smarter. Ride With Confidence.",
    facts: [
      { label: "Industry", value: "Mobility" },
      { label: "Type", value: "Cab booking app" },
      { label: "Focus", value: "Book · fare · ride" },
    ],
    snapshot: [
      { label: "Industry", value: "Transportation & Mobility Technology" },
      { label: "Project Type", value: "On-Demand Cab Booking Application" },
      {
        label: "Services",
        value: "Mobile Application Development, UI/UX Design, Software Development & Technical Consulting",
      },
      {
        label: "Core Functionality",
        value: "Ride Booking, Transparent Fare Information & Cab Service Accessibility",
      },
    ],
    screens: [
      { src: "/images/QUICK-SAWARI.png", alt: "Quick Savaari booking screen" },
      { src: "/images/QUICK-SAWARI-2.png", alt: "Quick Savaari trip screen" },
      { src: "/images/QUICK-SAWARI-3.png", alt: "Quick Savaari fare screen" },
    ],
    sections: quickSavaariSections,
    challenge: [
      "Traditional cab booking can leave fare details unclear and the booking path more complicated than it needs to be.",
      "Quick Savaari needed a digital ride-booking experience built around simplicity, affordability, transparency, and customer convenience.",
    ],
    approach: [
      {
        title: "Customer-centric experience",
        body: "We designed the product around everyday transportation needs with a booking path people can follow without friction.",
      },
      {
        title: "Fare transparency",
        body: "Clear fare information sits in the journey so customers understand the expected cost before they book.",
      },
      {
        title: "Simplified ride booking",
        body: "The booking flow stays short: plan the ride, review the fare, and confirm the cab.",
      },
    ],
    built: [
      "Easy cab booking in a few taps",
      "Transparent fare information before confirmation",
      "Access to affordable cab services through one app",
    ],
    outcome:
      "Quick Savaari brings ride booking and fare clarity together so everyday travel feels faster, clearer, and more convenient.",
  },
  {
    slug: "sniper-game",
    client: "Sniper Game",
    industry: "Game development",
    title: "Precision gameplay with a purposeful world",
    summary: findStudy("Sniper Game").summary,
    facts: [
      { label: "Format", value: "FPS" },
      { label: "World", value: "3D" },
      { label: "Engine", value: "Unity" },
    ],
    screens: findStudy("Sniper Game").screens.map((src, i) => ({
      src,
      alt: `Sniper Game screen ${i + 1}`,
    })),
    challenge: [
      "Sniper Game needed a focused first-person experience that could make long-range play feel rewarding while allowing rapid testing and refinement of environments.",
    ],
    approach: [
      {
        title: "Set the tactical loop",
        body: "We defined the rhythm of observing, aiming, making a decision, and acting.",
      },
      {
        title: "Create the environment",
        body: "Level spaces were built to support sight lines, movement, and a sense of place.",
      },
      {
        title: "Test and refine",
        body: "The game structure leaves room to improve challenge, behaviours, and player feedback over time.",
      },
    ],
    built: [
      "Focused long-range gameplay with clear objectives",
      "Detailed modular environments for immersion",
      "A build ready for ongoing iteration",
    ],
    outcome:
      "The outcome is an immersive tactical concept with detailed visual environments, clear game goals, and room for continued gameplay iteration.",
  },
  {
    slug: "cricket-fantasybuzz",
    client: "Cricket FantasyBuzz",
    industry: "Fantasy sports",
    title: "Turn match-day excitement into a live digital experience",
    summary: findStudy("Cricket FantasyBuzz").summary,
    facts: [
      { label: "Scoring", value: "Live" },
      { label: "Journey", value: "One fan path" },
      { label: "Platforms", value: "Android & iOS" },
    ],
    screens: findStudy("Cricket FantasyBuzz").screens.map((src, i) => ({
      src,
      alt: `Cricket FantasyBuzz screen ${i + 1}`,
    })),
    challenge: [
      "Cricket FantasyBuzz needed to make team building, contests, live scoring, and payments feel immediate without making the experience feel complicated.",
    ],
    approach: [
      {
        title: "Define the live moments",
        body: "We identified the moments where fans need quick information and fast actions.",
      },
      {
        title: "Organise the game flow",
        body: "Team building, contests, and scores were structured into a familiar mobile rhythm.",
      },
      {
        title: "Design for engagement",
        body: "The interface balances energy, clarity, and the confidence needed for real-time participation.",
      },
    ],
    built: [
      "Fast team building and contest entry",
      "Live scores and contest context throughout the match",
      "Clear flows before a fan commits to a contest",
    ],
    outcome:
      "The platform gives fans an engaging place to follow the action, build teams, and participate in contests from a single mobile experience.",
  },
];

const withSections = (study: DemoCaseStudy): DemoCaseStudy => ({
  ...study,
  sections: study.sections ?? legacyNarrativeSections(study),
});

export const demoCaseStudiesResolved: DemoCaseStudy[] = demoCaseStudies.map(withSections);

export const getCaseStudy = (slug: string) =>
  demoCaseStudiesResolved.find((study) => study.slug === slug);


export const getNextDemoStudy = (slug: string) => {
  const featured = demoCaseStudiesResolved.filter((study) =>
    ["tajika", "all-deliveries", "guri-houses", "quick-savaari"].includes(study.slug),
  );
  const index = featured.findIndex((study) => study.slug === slug);
  if (index < 0) return featured[0];
  return featured[(index + 1) % featured.length];
};

/** Legacy shape used by the index browser for study.screens / study.name. */
export const caseStudyDetails: CaseStudyDetail[] = demoCaseStudiesResolved.map((demo) => {
  const study =
    caseStudies.find((item) => item.name === demo.client) ??
    ({
      name: demo.client,
      category: demo.industry,
      summary: demo.summary,
      tags: [],
      color: "from-[#10210a] to-[#1a3314]",
      logo: "",
      screens: demo.screens.map((screen) => screen.src),
    } as CaseStudySource);

  return {
    slug: demo.slug,
    study: {
      ...study,
      screens: demo.screens.map((screen) => screen.src),
      summary: demo.summary,
    },
    kicker: demo.industry,
    heroTitle: demo.title,
    heroAccent: "",
    challenge: demo.challenge[0] ?? "",
    result: demo.outcome,
    metrics: demo.facts.map((fact) => [fact.value, fact.label] as [string, string]),
    outcomes: demo.built.map((item, i) => {
      const step = demo.approach[i];
      return [step?.title ?? `Item ${i + 1}`, item] as [string, string];
    }),
    steps: demo.approach.map((step, i) => [
      String(i + 1).padStart(2, "0"),
      step.title,
      step.body,
    ]),
  };
});

/** Featured studies shown in the Case Studies index browser (live UX, local slugs). */
export type CaseStudyIndexEntry = {
  slug: string;
  industry: string;
  previewTitle: string;
  previewSummary: string;
  previewTags: string[];
  /** Optional phone-app screenshot for the index preview (overrides study.screens[0]). */
  previewImage?: string;
};

const bySlug = (slug: string) => {
  const study = caseStudyDetails.find((item) => item.slug === slug);
  if (!study) throw new Error(`Missing case study for index: ${slug}`);
  return study;
};

export const caseStudyIndexEntries: (CaseStudyIndexEntry & { detail: CaseStudyDetail })[] = [
  {
    slug: "tajika",
    industry: "Home services",
    previewTitle: "Booking a home professional without the phone tag",
    previewSummary:
      "Tajika lets a household browse services, see what is available nearby, and book a professional from the phone.",
    previewTags: ["Product design", "Android", "iOS"],
    detail: bySlug("tajika"),
  },
  {
    slug: "all-deliveries",
    industry: "Logistics",
    previewTitle: "One place to send a parcel, shop, or hire a vehicle",
    previewSummary:
      "All Deliveries covers parcel delivery, shop-for-me orders, and vehicle hire with a driver, on the phone and on the web.",
    previewTags: ["Mobile app", "Web", "Operations panel"],
    previewImage: "/images/all-deliveries-login.png",
    detail: bySlug("all-deliveries"),
  },
  {
    slug: "guri-houses",
    industry: "Real estate",
    previewTitle: "Property listings a buyer can actually read",
    previewSummary:
      "Guri Houses is a property app for browsing listings, booking a viewing, and reaching the owner without a chain of forwards.",
    previewTags: ["UI/UX", "Android", "iOS"],
    detail: bySlug("guri-houses"),
  },
  {
    slug: "quick-savaari",
    industry: "Mobility",
    previewTitle: "A ride request that shows the fare before the trip",
    previewSummary:
      "Quick Savaari is a ride-booking app built around a short path: where you are going, what it costs, and how to confirm.",
    previewTags: ["Product design", "Android", "iOS"],
    detail: bySlug("quick-savaari"),
  },
];

export const caseStudyIndustries = [
  "All",
  ...Array.from(new Set(caseStudyIndexEntries.map((entry) => entry.industry))),
] as const;
