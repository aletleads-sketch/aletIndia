export type CaseStudy = {
  slug: string;
  client: string;
  title: string;
  industry: string;
  year: string;
  services: string[];
  summary: string;
  cover: string;
  coverAlt: string;
  screens: { src: string; alt: string }[];
  facts: { label: string; value: string }[];
  challenge: string[];
  approach: { title: string; body: string }[];
  built: string[];
  outcome: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "tajika-home-services",
    client: "Tajika",
    title: "Booking a home professional without the phone tag",
    industry: "Home services",
    year: "Demo",
    services: ["Product design", "Android", "iOS"],
    summary:
      "Tajika lets a household browse services, see what is available nearby, and book a professional from the phone.",
    cover: "/images/work/tajika-1.png",
    coverAlt: "Tajika home screen with service categories",
    screens: [
      { src: "/images/work/tajika-1.png", alt: "Tajika home screen" },
      { src: "/images/work/tajika-2.png", alt: "Tajika services screen" },
      { src: "/images/work/tajika-3.png", alt: "Tajika booking screen" },
    ],
    facts: [
      { label: "Product", value: "Consumer app" },
      { label: "Platforms", value: "Android & iOS" },
      { label: "Focus", value: "Book a visit" },
    ],
    challenge: [
      "Home services were scattered across calls and paper lists. A customer who wanted a cleaner, an electrician, or a painter had no single place to compare options and lock a time.",
      "The product had to feel obvious on a first open: where am I, what can I book, and what happens next.",
    ],
    approach: [
      {
        title: "Start from the booking",
        body: "We mapped the path from opening the app to confirming a visit, and cut anything that did not help that step.",
      },
      {
        title: "Make the catalogue scannable",
        body: "Services sit in a clear grid with plain names, so a person can find Beauty, Cleaning, or an electrician without reading a menu.",
      },
      {
        title: "Keep the location honest",
        body: "The home screen shows the neighbourhood first, so the catalogue feels local rather than generic.",
      },
    ],
    built: [
      "A home screen with the current area and a search entry",
      "A service grid covering everyday household jobs",
      "Screens for choosing a service and moving into a booking",
    ],
    outcome:
      "Tajika ships as a focused booking app: open it, pick a service, and move toward a confirmed visit without hunting through unrelated features.",
  },
  {
    slug: "all-deliveries",
    client: "All Deliveries",
    title: "One place to send a parcel, shop, or hire a vehicle",
    industry: "Logistics",
    year: "Demo",
    services: ["Mobile app", "Web", "Operations panel"],
    summary:
      "All Deliveries covers parcel delivery, shop-for-me orders, and vehicle hire with a driver, on the phone and on the web.",
    cover: "/images/all_deliveries_home.png",
    coverAlt: "All Deliveries app home with delivery choices",
    screens: [
      { src: "/images/all_deliveries_home.png", alt: "All Deliveries app home" },
      { src: "/images/all_deliveries_app1.jpeg", alt: "All Deliveries app screen" },
      { src: "/images/all_deliveries_app2.jpeg", alt: "All Deliveries second app screen" },
      { src: "/images/ALL-DEIVERIES.png", alt: "All Deliveries website" },
    ],
    facts: [
      { label: "Product", value: "App and website" },
      { label: "Jobs", value: "Parcel, shop, hire" },
      { label: "Desk", value: "Booking panel" },
    ],
    challenge: [
      "The business offered more than one kind of trip. A parcel, a shopping run, and a vehicle with a driver are different jobs, and they were easy to bury in one generic form.",
      "Customers also needed a site they could use from a laptop, and the team needed a panel for the bookings those orders create.",
    ],
    approach: [
      {
        title: "Lead with the job",
        body: "The home screen names the three jobs in plain language, each with its own short explanation, instead of one catch-all button.",
      },
      {
        title: "Match the phone and the site",
        body: "The website carries the same offer so a customer who is not in the app can still place an order.",
      },
      {
        title: "Leave a trail for the team",
        body: "Bookings land in a web panel, so dispatch is not a pile of chat messages.",
      },
    ],
    built: [
      "An app home for parcel delivery, shop-for-me, and vehicle hire",
      "A public website for the same services",
      "A web panel for managing bookings",
    ],
    outcome:
      "A customer can see the three services immediately and start the right one. The team has a panel for the orders that follow.",
  },
  {
    slug: "guri-houses",
    client: "Guri Houses",
    title: "Property listings a buyer can actually read",
    industry: "Real estate",
    year: "Demo",
    services: ["UI/UX", "Android", "iOS"],
    summary:
      "Guri Houses is a property app for browsing listings, booking a viewing, and reaching the owner without a chain of forwards.",
    cover: "/images/GURI-HOUSES.png",
    coverAlt: "Guri Houses property detail",
    screens: [
      { src: "/images/GURI-HOUSES.png", alt: "Guri Houses property detail" },
      { src: "/images/GURI-HOUSES-2.png", alt: "Guri Houses booking detail" },
    ],
    facts: [
      { label: "Product", value: "Property app" },
      { label: "Audience", value: "Buyers and owners" },
      { label: "Focus", value: "Listing to viewing" },
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
    title: "A ride request that shows the fare before the trip",
    industry: "Mobility",
    year: "Demo",
    services: ["Product design", "Android", "iOS"],
    summary:
      "Quick Savaari is a ride-booking app built around a short path: where you are going, what it costs, and how to confirm.",
    cover: "/images/QUICK-SAWARI.png",
    coverAlt: "Quick Savaari ride booking screen",
    screens: [
      { src: "/images/QUICK-SAWARI.png", alt: "Quick Savaari booking screen" },
      { src: "/images/QUICK-SAWARI-2.png", alt: "Quick Savaari trip screen" },
      { src: "/images/QUICK-SAWARI-3.png", alt: "Quick Savaari fare screen" },
    ],
    facts: [
      { label: "Product", value: "Ride booking" },
      { label: "Platforms", value: "Android & iOS" },
      { label: "Focus", value: "Fare before confirm" },
    ],
    challenge: [
      "Everyday cabs fail trust when the price appears after the rider is already committed. People wanted the fare, the route, and the confirm button in one glance.",
      "The interface also had to stay calm in a hurry: pickup, drop, and go.",
    ],
    approach: [
      {
        title: "Show the money early",
        body: "Fare details sit with the trip, not behind a later screen.",
      },
      {
        title: "Shorten the request",
        body: "The booking path stays on the essentials: where, which ride, confirm.",
      },
      {
        title: "Design for a glance",
        body: "Type, spacing, and colour keep the primary action obvious while someone is already on the move.",
      },
    ],
    built: [
      "A ride request with pickup and drop",
      "Fare details shown before confirmation",
      "A compact flow meant for a quick booking",
    ],
    outcome:
      "Quick Savaari asks for a destination, shows what the trip costs, and lets the rider confirm without a second hunt through the app.",
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}

export function industries() {
  return ["All", ...Array.from(new Set(caseStudies.map((study) => study.industry)))];
}
