export type BlogSection = {
  heading: string;
  paragraphs: string[];
  list?: string[];
};

export type BlogPost = {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  tag: string;
  author: string;
  sections: BlogSection[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "why-user-centric-design-is-key-to-app-success",
    date: "August 30, 2025",
    title: "Why user-centric design is key to app success",
    excerpt:
      "Clean code is not enough. Apps people return to are designed around a real job, a real screen, and a real moment of use.",
    image: "/images/services/ui-design.jpg",
    tag: "Design",
    author: "ALET India",
    sections: [
      {
        heading: "Features do not create habit",
        paragraphs: [
          "Most apps that stall after launch did not fail because the code was weak. They failed because the first screen asked people to do too much, or hid the one action the product exists for.",
          "User-centric design starts with that action. Who opens the app, what they need in under a minute, and what would make them close it. Everything else — extra menus, extra settings, extra onboarding slides — waits until that path is obvious.",
        ],
      },
      {
        heading: "What we look at before drawing screens",
        paragraphs: [
          "Before Figma, we write the job the app is hired to do. A delivery app is hired to book a pickup. A property app is hired to shortlist a home. If a screen does not help that job, it does not earn a place in the first release.",
        ],
        list: [
          "The one task a new user must finish on day one",
          "The information they already have, so we do not ask twice",
          "The moment they feel stuck, and the shortest way out",
          "What “done” looks like, so the app can confirm it clearly",
        ],
      },
      {
        heading: "Small decisions that change retention",
        paragraphs: [
          "Labels, empty states, and error messages are part of the product. “Something went wrong” teaches nothing. “Payment declined — try another card” lets the person continue.",
          "We also design the second visit, not only the first. Saved addresses, recent orders, and a home screen that resumes the last task are what turn a download into a habit.",
        ],
      },
    ],
  },
  {
    slug: "ui-ux-trends-for-mobile-apps",
    date: "August 23, 2025",
    title: "UI trends that still matter for mobile apps",
    excerpt:
      "Trends are useful when they make an app clearer. Here is what we keep, and what we skip, when we design for phones.",
    image: "/images/pages/design-desk.jpg",
    tag: "Design",
    author: "ALET India",
    sections: [
      {
        heading: "Clarity beats decoration",
        paragraphs: [
          "Glass effects, bold type, and large photography show up in every trend report. On a phone they only work when the next tap is still obvious. If a blur hides a button, we drop the effect.",
          "What we keep is simpler: one strong type scale, plenty of space around the primary button, and colour used for meaning — success, warning, brand — not for every card.",
        ],
      },
      {
        heading: "Patterns we use on client apps",
        paragraphs: [
          "These are the choices that keep showing up in apps we ship, because they survive both Android and iOS.",
        ],
        list: [
          "A bottom action for the main task, where the thumb already is",
          "Sheets for filters and confirmations, instead of a new full screen",
          "Skeleton states while data loads, so the layout does not jump",
          "Dark text on light surfaces for long reading, with brand colour as the accent",
        ],
      },
      {
        heading: "Design for the store screenshot too",
        paragraphs: [
          "People decide in the App Store and Play Store before they install. The first three screenshots should tell the story without a caption wall: what the app does, the main screen, and the result.",
        ],
      },
    ],
  },
  {
    slug: "startup-app-development-guide",
    date: "August 16, 2025",
    title: "A practical guide to launching a startup app",
    excerpt:
      "From the first brief to the store listing, this is the order we use so a first version ships before the idea changes.",
    image: "/images/pages/brainstorm.jpg",
    tag: "Startups",
    author: "ALET India",
    sections: [
      {
        heading: "Start with one release, not the whole vision",
        paragraphs: [
          "Founders often arrive with a map of ten features. The first release should prove one of them. A ride app can launch with booking and a driver list. Loyalty, referrals, and a wallet can wait until people are actually taking rides.",
          "We write that cut together: must-have, later, and never for version one. That list is what the timeline and the budget are built on.",
        ],
      },
      {
        heading: "The path we follow",
        paragraphs: [
          "A typical first build with ALET moves through the same stages, even when the product is different.",
        ],
        list: [
          "Discovery — users, screens, and the data the app must store",
          "Design — clickable flows before a line of production code",
          "Build — app, admin panel, and the APIs between them",
          "Test — real devices, payments, and the empty and error states",
          "Launch — store listings, analytics, and a plan for the first fixes",
        ],
      },
      {
        heading: "What to prepare before you call a team",
        paragraphs: [
          "You do not need a finished specification. A short note on who the app is for, three examples of apps you like, and a rough budget range is enough to start a useful conversation. We turn that into a scope you can approve.",
        ],
      },
    ],
  },
  {
    slug: "mobile-apps-across-industries",
    date: "August 11, 2025",
    title: "How mobile apps change healthcare, retail, and education",
    excerpt:
      "The same phone can book a consult, reorder a product, or finish a lesson. The design has to respect how different those jobs are.",
    image: "/images/industries/healthcare.jpg",
    tag: "Industries",
    author: "ALET India",
    sections: [
      {
        heading: "Healthcare: fewer steps, clearer status",
        paragraphs: [
          "Patients want to know what happens next: appointment booked, report ready, medicine on the way. A health app should surface that status before it surfaces a catalogue of services.",
          "We keep medical copy plain, avoid collecting data the visit does not need, and make consent and contact details easy to find.",
        ],
      },
      {
        heading: "Retail: from browse to a finished order",
        paragraphs: [
          "Shoppers leave when the cart, address, or payment step feels longer than the product page. Retail apps we build keep the catalogue visual and the checkout short: saved address, a familiar payment method, and a clear order number at the end.",
        ],
      },
      {
        heading: "Education: progress people can see",
        paragraphs: [
          "A course app earns the next open when a learner can see what is done and what is next. Short lessons, offline reading where the network is weak, and a simple progress marker do more than a crowded dashboard.",
        ],
      },
    ],
  },
  {
    slug: "why-your-business-needs-a-mobile-app",
    date: "July 19, 2025",
    title: "Why your business needs a mobile app",
    excerpt:
      "A website still matters. An app is for the customer who comes back — booking, tracking, reordering, or paying in a few taps.",
    image: "/images/industries/ecommerce.jpg",
    tag: "Business",
    author: "ALET India",
    sections: [
      {
        heading: "A website and an app do different jobs",
        paragraphs: [
          "A website is how new people find you. An app is how known customers come back. If your business depends on repeat orders, appointments, or live status, the phone is where that relationship lives.",
          "You do not need an app on day one of a company. You need one when the same customers are repeating a task that a mobile site makes clumsy.",
        ],
      },
      {
        heading: "What our client apps are actually for",
        paragraphs: [
          "Looking across the products we have shipped, the useful apps cluster around a few jobs.",
        ],
        list: [
          "Home services — browse, pick a slot, book a professional",
          "Delivery — place an order and follow it to the door",
          "Rides — see a fare and confirm a cab",
          "Fashion — browse a collection and check out without a desktop",
        ],
      },
      {
        heading: "Start from the repeat task",
        paragraphs: [
          "If you can name the action a customer repeats every week, that action is the app. Everything else can stay on the website until the repeat task is fast.",
        ],
      },
    ],
  },
  {
    slug: "what-app-development-costs",
    date: "July 12, 2025",
    title: "What actually drives app development cost",
    excerpt:
      "Price follows scope: screens, platforms, accounts, payments, and how polished the first release needs to be.",
    image: "/images/pages/typing.jpg",
    tag: "Business",
    author: "ALET India",
    sections: [
      {
        heading: "There is no single app price",
        paragraphs: [
          "Two apps can both be “a mobile app” and cost very different amounts. A catalogue with login is not the same product as live tracking, wallets, and a driver app beside the customer app.",
          "We estimate from a screen list and a platform choice, not from a one-line description. That is also how you compare two proposals fairly.",
        ],
      },
      {
        heading: "The pieces that move the number",
        paragraphs: ["These are the decisions that change a quote more than the hourly rate does."],
        list: [
          "One platform or two — native Android and iOS, or one Flutter or React Native codebase",
          "How many roles — customer only, or customer plus driver, vendor, or admin",
          "Payments, maps, chat, and push notifications",
          "Design from scratch versus building on an existing brand",
          "A web panel so your team can run the business after launch",
        ],
      },
      {
        heading: "How to keep the first budget honest",
        paragraphs: [
          "Ship the path that makes money or saves time. Park the nice-to-have screens. Ask for a range with assumptions written down, and for what is not included. A clear exclusion list prevents the surprise invoice later.",
        ],
      },
    ],
  },
  {
    slug: "cross-platform-apps-for-startups",
    date: "June 30, 2025",
    title: "When a startup should build cross-platform",
    excerpt:
      "One Flutter or React Native codebase can reach Android and iOS sooner. It is the right call when speed matters more than a fully native feel.",
    image: "/images/services/cross-platform.jpg",
    tag: "Development",
    author: "ALET India",
    sections: [
      {
        heading: "Two stores, one team",
        paragraphs: [
          "Startups rarely have separate Android and iOS teams. A cross-platform app lets one group ship both, fix a bug once, and keep the design matched.",
          "We use Flutter or React Native when the product is forms, lists, booking, and content. We suggest native when the app depends on heavy camera work, complex animation, or a platform feature the shared toolkit does not cover well.",
        ],
      },
      {
        heading: "What you still need besides the app",
        paragraphs: [
          "The shared app is only half the product. You still need an API, an admin place to manage users and orders, store accounts, and someone to answer the first week of bug reports. Budget for that, not only for screens.",
        ],
      },
      {
        heading: "A sensible first version",
        paragraphs: [
          "Pick the framework your team can support after we hand it over. Document the build steps. Release to a small group before the public store listing. Cross-platform saves time only if the first version stays small enough to learn from.",
        ],
      },
    ],
  },
  {
    slug: "pwa-vs-native-apps",
    date: "June 29, 2025",
    title: "Progressive web apps or native apps",
    excerpt:
      "A progressive web app is faster to ship from the browser. A native app is better when you need the stores, notifications, and offline use.",
    image: "/images/pages/code.jpg",
    tag: "Development",
    author: "ALET India",
    sections: [
      {
        heading: "Choose by the job, not the trend",
        paragraphs: [
          "A progressive web app (PWA) is a website that can be saved to the home screen, work with a weak connection, and feel closer to an app. It skips store review and updates the moment you deploy.",
          "A native or cross-platform app is installed from the Play Store or App Store. It is the better fit when customers expect an icon, reliable push notifications, and access to device features such as precise location or background updates.",
        ],
      },
      {
        heading: "A simple way to decide",
        paragraphs: ["Use this split when the brief is still open."],
        list: [
          "Choose a PWA for content, catalogues, and tools people open from a link",
          "Choose a store app for repeat use, payments on device, maps, and notifications",
          "Choose both only when the website and the app serve different moments",
        ],
      },
      {
        heading: "You can start on the web",
        paragraphs: [
          "Plenty of products should begin as a strong responsive site. When the same users return every day, that is the moment to invest in an installed app. We can design the flows so the later app does not throw away the first version.",
        ],
      },
    ],
  },
];

export function readingMinutes(post: BlogPost) {
  const words = post.sections
    .flatMap((section) => [section.heading, ...section.paragraphs, ...(section.list ?? [])])
    .join(" ")
    .split(/\s+/).length;
  return Math.max(3, Math.round(words / 180));
}

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function relatedPosts(slug: string) {
  const current = getBlogPost(slug);
  if (!current) return blogPosts.slice(0, 3);
  const same = blogPosts.filter((post) => post.slug !== slug && post.tag === current.tag);
  const rest = blogPosts.filter((post) => post.slug !== slug && post.tag !== current.tag);
  return [...same, ...rest].slice(0, 3);
}
