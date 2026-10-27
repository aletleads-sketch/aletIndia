import { caseStudies } from "@/lib/content";

type CaseStudySource = (typeof caseStudies)[number];

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

export const caseStudyDetails: CaseStudyDetail[] = [
  {
    slug: "all-deliveries", study: findStudy("All Deliveries"), kicker: "Courier & logistics",
    heroTitle: "A connected delivery experience,", heroAccent: "built for real life.",
    challenge: "All Deliveries needed one clear digital home for parcel bookings, shopping runs, vehicle hire, tracking, and the operations behind every order.",
    result: "The final product gives customers a direct route from need to booking, and gives the delivery business a professional digital foundation it can keep building on.",
    metrics: [["3", "Service types"], ["1", "Connected journey"], ["24/7", "Customer access"]],
    outcomes: [["One clear journey", "Book a parcel, shopping run, or vehicle in one familiar flow."], ["Live visibility", "Give customers useful order updates while the team manages every delivery from one panel."], ["Built to scale", "A responsive public website and operating dashboard designed for everyday growth."]],
    steps: [["01", "Understand the operation", "We mapped the customer journey from booking through pickup, payment, tracking, and delivery."], ["02", "Design the simple path", "We made the next action obvious on every screen, without losing the detail operations need."], ["03", "Build the connected product", "The website, customer experience, and internal workflow were designed to work together."]],
  },
  {
    slug: "tajika", study: findStudy("Tajika"), kicker: "Home services",
    heroTitle: "From a household need to", heroAccent: "a confident booking.",
    challenge: "Tajika needed to make a wide range of home services feel easy to discover, compare, schedule, and trust on a small screen.",
    result: "The product brings service discovery, time-slot selection, and professional booking into one calm experience that people can use without instruction.",
    metrics: [["1", "Simple booking flow"], ["3", "Core platforms"], ["24/7", "Service discovery"]],
    outcomes: [["Clear choices", "Customers can find the right service without navigating an overwhelming catalogue."], ["Confident booking", "A focused booking path makes selecting a professional and a time slot feel effortless."], ["Ready to grow", "A flexible mobile foundation supports new categories, locations, and service partners."]],
    steps: [["01", "Map the customer need", "We focused the journey around the everyday moment someone needs help at home."], ["02", "Reduce the decisions", "Service details, availability, and booking actions were arranged around what customers need first."], ["03", "Shape the product", "The mobile experience was designed for quick, comfortable use across Android and iOS."]],
  },
  {
    slug: "cricket-fabtasybuzz", study: findStudy("Cricket FabtasyBuzz"), kicker: "Fantasy sports",
    heroTitle: "Turn match-day excitement into", heroAccent: "a live digital experience.",
    challenge: "Cricket FabtasyBuzz needed to make team building, contests, live scoring, and payments feel immediate without making the experience feel complicated.",
    result: "The platform gives fans an engaging place to follow the action, build teams, and participate in contests from a single mobile experience.",
    metrics: [["Live", "Match scoring"], ["1", "Fan journey"], ["2", "Mobile platforms"]],
    outcomes: [["Fast decisions", "Fans can build a team and join the right contest without losing the momentum of match day."], ["Live context", "Scores and contest activity keep the product useful throughout the game."], ["Trusted participation", "Clear flows help users understand their choices before they enter a contest."]],
    steps: [["01", "Define the live moments", "We identified the moments where fans need quick information and fast actions."], ["02", "Organise the game flow", "Team building, contests, and scores were structured into a familiar mobile rhythm."], ["03", "Design for engagement", "The interface balances energy, clarity, and the confidence needed for real-time participation."]],
  },
  {
    slug: "guri-houses", study: findStudy("Guri Houses"), kicker: "Real estate",
    heroTitle: "Property discovery made", heroAccent: "personal and transparent.",
    challenge: "Guri Houses needed a mobile experience that made listings, booking details, and direct owner conversations simpler for people making important property decisions.",
    result: "A clean, trust-focused product makes it easier to explore homes, understand the details, and move from interest to a meaningful conversation.",
    metrics: [["1", "Property journey"], ["2", "User roles"], ["Mobile", "First experience"]],
    outcomes: [["Better context", "Listings present the details people need to make a more informed decision."], ["Direct connection", "Simple contact options reduce the distance between buyer, renter, and property owner."], ["A calmer search", "Clear visual hierarchy keeps a complex decision process feeling manageable."]],
    steps: [["01", "Study the property journey", "We arranged the experience around how people evaluate a home before they get in touch."], ["02", "Bring detail forward", "Important booking, pricing, and property information is easy to find at the right time."], ["03", "Build trust in the interface", "A calm layout and direct communication patterns help users act with confidence."]],
  },
  {
    slug: "quick-savaari", study: findStudy("Quick Savaari"), kicker: "Ride booking",
    heroTitle: "Everyday travel, made", heroAccent: "easy to book.",
    challenge: "Quick Savaari needed to give riders a fast, dependable way to understand their trip, book a cab, and feel comfortable with the fare and route details.",
    result: "The app makes a familiar travel task feel smoother: people can choose a ride, understand the essential information, and book with confidence.",
    metrics: [["1", "Booking experience"], ["Maps", "Built in"], ["2", "Mobile platforms"]],
    outcomes: [["Quick to book", "The route from opening the app to confirming a ride focuses on the essential choices."], ["Clear trip details", "Fare and ride information are presented when riders need them most."], ["Built for routine", "A consistent interface supports frequent, everyday use without unnecessary friction."]],
    steps: [["01", "Focus the travel task", "We centred the product around getting from a need for a ride to a confirmed booking quickly."], ["02", "Make costs visible", "The interface gives trip and fare context early, supporting a more confident decision."], ["03", "Refine the ride flow", "Maps, booking choices, and status details were designed to work as one familiar experience."]],
  },
  {
    slug: "sniper-game", study: findStudy("Sniper Game"), kicker: "Game development",
    heroTitle: "Precision gameplay with", heroAccent: "a purposeful world.",
    challenge: "Sniper Game needed a focused first-person experience that could make long-range play feel rewarding while allowing rapid testing and refinement of environments.",
    result: "The outcome is an immersive tactical concept with detailed visual environments, clear game goals, and room for continued gameplay iteration.",
    metrics: [["FPS", "Game format"], ["3D", "Game world"], ["Unity", "Development"]],
    outcomes: [["Focused gameplay", "Long-range mechanics and objectives give each encounter a clear purpose."], ["Detailed spaces", "Modular environments support visual immersion and level experimentation."], ["Ready to iterate", "The build supports ongoing improvements to levels, AI behaviour, and game feel."]],
    steps: [["01", "Set the tactical loop", "We defined the rhythm of observing, aiming, making a decision, and acting."], ["02", "Create the environment", "Level spaces were built to support sight lines, movement, and a sense of place."], ["03", "Test and refine", "The game structure leaves room to improve challenge, behaviours, and player feedback over time."]],
  },
];

export const getCaseStudy = (slug: string) => caseStudyDetails.find((caseStudy) => caseStudy.slug === slug);
