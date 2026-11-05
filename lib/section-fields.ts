/**
 * The editable fields of each wired page section, with the website's own copy as defaults.
 * Stored values live in public.page_sections (content.fields), keyed "page path#section key".
 * The admin content editor builds its forms from this list.
 */
import { about as codeAbout, hero as codeHero } from "@/lib/content";
import { privacyPolicy, refundPolicy, termsConditions, type LegalSection } from "@/lib/pages";

export type FieldType = "text" | "textarea" | "paragraphs" | "image" | "images" | "link" | "policy" | "items" | "htmlTexts";
type Image = { src: string; alt: string };
type LinkValue = { label: string; href: string };
type Field =
  | { type: "text" | "textarea"; label: string; default: string }
  | { type: "paragraphs"; label: string; default: string[] }
  | { type: "image"; label: string; default: Image }
  | { type: "images"; label: string; default: Image[] }
  | { type: "link"; label: string; default: LinkValue }  | { type: "policy"; label: string; default: LegalSection[] }  | { type: "htmlTexts"; label: string; default: readonly string[] }
  | { type: "items"; label: string; default: readonly Readonly<Record<string, string | readonly string[]>>[] };

const text = (label: string, value: string) => ({ type: "text", label, default: value }) as const;
const textarea = (label: string, value: string) => ({ type: "textarea", label, default: value }) as const;
const paragraphs = (label: string, value: string[]) => ({ type: "paragraphs", label, default: value }) as const;
const image = (label: string, src: string, alt = "") => ({ type: "image", label, default: { src, alt } }) as const;
const images = (label: string, value: Image[]) => ({ type: "images", label, default: value }) as const;
const link = (label: string, value: LinkValue) => ({ type: "link", label, default: value }) as const;
/** The words of a custom-designed HTML block, in page order (see lib/html-texts.ts). Empty = the design's own words. */
const htmlWords = (label: string) => ({ type: "htmlTexts", label, default: [] as readonly string[] }) as const;
/** A list of cards; every card has the same named parts (e.g. title, text, points). */
const items = <T extends Record<string, string | readonly string[]>>(label: string, value: readonly T[]) => ({ type: "items", label, default: value }) as const;
/** Policy text: headed parts, each with paragraphs and an optional bullet list. */
const policy = (label: string, value: LegalSection[]) => ({ type: "policy", label, default: value }) as const;
const legalHero = (crumb: string, title: string, accent: string, intro: string, photo: string) => ({
  crumb: text("Breadcrumb", crumb),
  title: text("Heading", title),
  accent: text("Heading (highlighted part)", accent),
  intro: textarea("Text under the heading", intro),
  image: image("Background photo", photo),
});

export const SECTION_FIELDS = {
  "_shared#footer": {
    headline: text("Headline", "Have an idea?"),
    headlineAccent: text("Headline (highlighted part)", "Let's turn it into reality."),
    buttonLabel: text("Button text", "Inquire Now"),
    copyright: text("Copyright line", "Copyright © 2026 ALET INDIA. All rights reserved."),
  },

  "/about-us#hero": {
    crumb: text("Breadcrumb", "About Us"),
    image: image("Background photo", "/images/pages/team-table.jpg", "ALET India team collaborating around a table"),
    title: text("Heading", "Rooted in experience."),
    accent: text("Heading (highlighted part)", "Driven by what’s next."),
    text: textarea("Text under the heading", "Building digital possibilities since 2017. We turn ideas into technology that helps businesses innovate, adapt, and move forward."),
  },
  "/about-us#intro": {
    heading: text("Heading", "Building digital possibilities since 2017"),
    tagline: text("Small line under the heading", "Ideas deserve more than a"),
    taglineAccent: text("Small line (highlighted part)", "good beginning."),
    paragraphs: paragraphs("Paragraphs", [
      "Every great digital experience begins with an idea. At Alet India Softwares, we turn those ideas into technology that helps businesses move forward.",
      "Established in 2017, Alet India Softwares is an India-based software development and digital solutions company committed to helping businesses innovate, adapt, and grow.",
      "From custom mobile applications and web platforms to intuitive digital experiences and application modernization, we combine technology, creativity, and business understanding to deliver solutions built around real-world challenges.",
      "Our philosophy is simple: Build with purpose. Improve continuously. Innovate for the future.",
    ]),
  },
  "/about-us#who_we_are": {
    photos: images("Photos (3)", [
      { src: "/images/pages/office.jpg", alt: "" },
      { src: "/images/pages/team-meeting.jpg", alt: "" },
      { src: "/images/pages/coworking.jpg", alt: "" },
    ]),
    yearsLabel: text("Word under the years badge", "Years"),
    eyebrow: text("Small label", "Who we are"),
    title: text("Heading", "Engineers at heart."),
    accent: text("Heading (highlighted part)", "Problem-solvers by nature."),
    paragraphs: paragraphs("Paragraphs", [
      "We believe technology is most powerful when it solves a meaningful problem.",
      "Behind every application is a business objective. Behind every interface is a human experience. And behind every successful digital product is a combination of thoughtful planning, strong engineering, and continuous improvement.",
      "At Alet India Softwares, we bring these elements together to create digital experiences that are practical, scalable, and designed around the people who use them.",
      "We work with entrepreneurs, startups, and businesses looking to launch new products, improve existing systems, or take their digital capabilities to the next level.",
      "Our focus is not simply on what we build, but on why it matters to your business.",
    ]),
  },
  "/about-us#our_story": {
    eyebrow: text("Small label", "Our story"),
    title: text("Heading", "A journey that began with"),
    accent: text("Heading (highlighted part)", "a vision."),
  },
  "/about-us#our_mission": {
    image: image("Background photo", "/images/pages/presentation.jpg"),
    eyebrow: text("Small label", "Our mission"),
    title: text("Heading", "Turn every idea into a product that is"),
    accent: text("Heading (highlighted part)", "fast, beautiful, and built to last."),
    text: textarea(
      "Text",
      "Stay competitive and let ALET India transform your business application requirements. Our award-winning software development service offers custom mobile and web app development for entrepreneurs and small businesses. From design to development, testing, and support, we provide end-to-end software development services and build your apps with trusted frameworks.",
    ),
    button: link("Button", { label: "Start a project", href: "/contact-us" }),
  },
  "/about-us#client_logos": {
    heading: text("Heading", "Trusted by growing businesses"),
  },

  "/privacy-policy#hero": legalHero("Privacy Policy", "Privacy &", "Cookie Policy", "How Alet India collects, uses, and protects your personal information.", "/images/pages/security.jpg"),
  "/privacy-policy#policy": { sections: policy("Policy text", privacyPolicy) },
  "/terms-conditions#hero": legalHero("Terms & Conditions", "Terms &", "Conditions", "The terms that apply when you use www.aletindia.com and our services.", "/images/pages/signing.jpg"),
  "/terms-conditions#policy": { sections: policy("Policy text", termsConditions) },
  "/refund-policy#hero": legalHero("Refund Policy", "Payment", "Refund Policy", "When and how Alet India Softwares processes project refunds and cancellations.", "/images/pages/blog-laptop.jpg"),
  "/refund-policy#policy": { sections: policy("Policy text", refundPolicy) },
  "_shared#stats_bar": {
    yearsLabel: text("Label: years", "Years of Experience"),
    clientsLabel: text("Label: clients", "Happy Clients"),
    projectsLabel: text("Label: projects", "Projects Delivered"),
    countriesLabel: text("Label: countries", "Countries Served"),
  },
  "_shared#process": {
    eyebrow: text("Small label", "Our Innovative Ideology"),
    title: text("Heading", "Requirements to"),
    accent: text("Heading (highlighted part)", "delivery"),
    text: text("Text under the heading", "That makes us a top performer in the industry."),
  },
  "_shared#testimonials": {
    eyebrow: text("Heading", "Words of appreciation from our clients"),
  },
  "_shared#contact_form": {
    eyebrow: text("Small label", "Contact us"),
    titleHome: text("Heading on Home", "Let's build something"),
    accentHome: text("Heading on Home (highlighted part)", "remarkable"),
    titleServices: text("Heading on Services", "Have a project in"),
    accentServices: text("Heading on Services (highlighted part)", "mind?"),
    titleServicePages: text("Heading on each service page", "Let's discuss your"),
    accentServicePages: text("Heading on each service page (highlighted part)", "project"),
    titlePortfolio: text("Heading on Portfolio", "Have a product in"),
    accentPortfolio: text("Heading on Portfolio (highlighted part)", "mind?"),
    titleCaseStudies: text("Heading on Case Studies", "Have a project with a"),
    accentCaseStudies: text("Heading on Case Studies (highlighted part)", "story to tell?"),
    text: textarea("Text", "Tell us about your project, budget, and timeline. We'll review your inquiry and get back with next steps."),
    card1Label: text("Card 1 label", "Avg. response"),
    card1Value: text("Card 1 value", "Under 24 hrs"),
    card2Label: text("Card 2 label", "Free consult"),
    card2Value: text("Card 2 value", "No obligation"),
    points: paragraphs("Points", [
      "Mobile, web, UI/UX & marketing under one roof",
      "Dedicated project manager from day one",
      "Transparent timelines and milestone updates",
    ]),
    phoneLabel: text("Label: phone", "Phone"),
    emailLabel: text("Label: email", "Email"),
    addressLabel: text("Label: address", "Address"),
    callButton: text("Call button (the phone number follows it)", "Call"),
    image: image("Picture", "/images/pages/alet-india-contact-us.png", "Contact ALET India"),
  },
  "_shared#journey_timeline": {
    eyebrow: text("Small label", "Our Journey"),
    title: text("Heading", "From 2017 to Today"),
    text: textarea("Text under the heading", "How ALET India grew from a simple vision into a long-term technology partner for businesses of every size."),
    steps: items("Steps (4)", [
      { tag: "2017", title: "Where It All Began", text: "ALET India started with a vision to make dependable, high-quality technology solutions accessible to businesses of different sizes." },
      { tag: "Growth", title: "Growing Beyond Boundaries", text: "We expanded from individual development projects into mobile, web, user experience, and digital services for diverse markets." },
      { tag: "Evolution", title: "Evolving With Technology", text: "Our focus grew from building new products to enhancing platforms, modernising technology, and supporting the full product lifecycle." },
      { tag: "Today", title: "Building for Tomorrow", text: "We continue to bring clarity to complex ideas and create digital solutions with lasting value as a technology partner, not only a vendor." },
    ]),
  },
  "_shared#solution_lifecycle": {
    eyebrow: text("Small label", "Alet India Solution"),
    titleLine1: text("Heading, line 1", "From first idea"),
    titleLine2: text("Heading, line 2", "to the"),
    accentLine1: text("Heading, highlighted line 1", "next"),
    accentLine2: text("Heading, highlighted line 2", "upgrade"),
    text: textarea("Text", "A continuous cycle — we build, refine, and raise the bar so your product keeps winning in a changing digital world."),
    button: link("Button", { label: "Let's Build Together", href: "/contact-us" }),
    stats: items("Numbers (3; the first number counts the years by itself)", [
      { value: "", line1: "Years", line2: "Experience" },
      { value: "500+", line1: "Projects", line2: "Delivered" },
      { value: "98%", line1: "Client", line2: "Satisfaction" },
    ]),
    script: text("Handwritten words", "Ideas"),
    scriptAccent: text("Handwritten words (second part)", "into Impact"),
    cards: items("Cards (3)", [
      {
        title: "Development",
        text: "We turn your ideas into robust, scalable and high-performing digital products tailored to your business goals.",
        points: ["Requirement analysis & planning", "Modern technology stack", "Clean and scalable architecture", "Quality-driven development", "On-time delivery"],
        note1: "Turn Ideas",
        note2: "Into Reality",
      },
      {
        title: "Enhancement",
        text: "We continuously improve your product based on user feedback, market trends and new opportunities.",
        points: ["Feature enhancements", "Performance optimization", "UI/UX improvements", "Security & reliability upgrades", "Analytics & data-driven improvements"],
        note1: "Make Your Product",
        note2: "Even Stronger",
      },
      {
        title: "Upgrade",
        text: "We help you adopt the latest technology, migrate to modern platforms and scale your product for future growth.",
        points: ["Technology upgrades", "Migration & modernization", "Scalability & infrastructure improvements", "Integration with new tools and APIs", "Long-term support & maintenance"],
        note1: "Stay Ahead",
        note2: "with Latest Technology",
      },
    ]),
  },
  "/about-us#our_difference": {
    texts: htmlWords("Words in the \"What Makes Us Different\" design, in order"),
  },
  "/about-us#story_journey": {
    texts: htmlWords("Words in the \"Our Journey\" story design, in order"),
  },
  "_shared#inquire_form": {
    popupEyebrow: text("Popup: small label", "Contact us"),
    popupTitle: text("Popup: heading", "Have an idea? Let's turn it into reality."),
    popupText: text("Popup: text", "Tell us about your project, budget, and timeline. We'll get back with next steps."),
    nameLabel: text("Name label", "Full name"),
    namePlaceholder: text("Name hint", "Your full name"),
    emailLabel: text("Email label", "Business email"),
    emailPlaceholder: text("Email hint", "you@company.com"),
    phoneLabel: text("Phone label", "Phone number"),
    phonePlaceholder: text("Phone hint", "Mobile number"),
    serviceLabel: text("Service label", "Service required"),
    budgetLabel: text("Budget label", "Estimated budget (optional)"),
    budgets: paragraphs("Budget choices", ["Under $10,000", "$10,000–$20,000", "$20,000–$50,000", "$50,000–$1M", "Not decided"]),
    startLabel: text("Start date label", "Expected start date"),
    startDates: paragraphs("Start date choices (the second one is picked by default)", ["Immediately", "Within 1–3 months", "Within 3–6 months", "Just exploring"]),
    detailsLabel: text("Project details label", "Project details"),
    detailsPlaceholder: text("Project details hint", "Tell us about your goals, timeline, or any links that help."),
    submit: text("Send button", "Submit inquiry"),
    sending: text("Send button while sending", "Sending…"),
    captchaMissing: text("Message: verification not answered", "Please answer the human verification question before sending your enquiry."),
    sendFailed: text("Message: could not send", "Unable to send your enquiry right now."),
    tryAgain: text("Message after an error (email follows)", "Please try again, or email us at"),
    successTitle: text("After sending: heading", "Inquiry ready"),
    successText: textarea("After sending: text", "Thank you. Your enquiry has been safely added to the ALET India team's CRM. We'll be in touch shortly."),
    writeAnother: text("After sending: link", "Write another inquiry"),
    captchaTitle: text("Verification: heading", "Human verification"),
    captchaLoading: text("Verification: loading", "Loading a quick question…"),
    captchaUnavailable: text("Verification: unavailable", "Human verification is unavailable."),
    captchaNew: text("Verification: new question link", "New question"),
    captchaPlaceholder: text("Verification: answer hint", "Type your answer"),
    captchaHelp: text("Verification: small print", "This one-time question expires shortly and helps keep spam out."),
  },
  "/#hero": {
    since: text("Badge: word before the founding year", "Since"),
    titleBefore: text("Heading, first words", "Your Trusted"),
    titleAccent: text("Heading, highlighted word", "Technology"),
    titleAfter: text("Heading, last words", "Partner"),
    subtitle: text("Line under the heading", "Mobile App & Web Development Company in New Delhi"),
    weBuild: text("Words before the changing words", "We build"),
    text: textarea("Text", codeHero.paragraphs[0]),
    primaryButton: link("Main button", { label: "Get a Free Consultation", href: "#contact" }),
    secondaryButton: link("Second button", { label: "View Our Work", href: "#work" }),
    people: images("Client photos (3)", [
      { src: "/images/people/rk.jpg", alt: "" },
      { src: "/images/people/aadi.jpg", alt: "" },
      { src: "/images/people/mayank.png", alt: "" },
    ]),
    trustBold: text("Trust line, bold part", "500+ clients"),
    trustText: text("Trust line, rest", "across 20+ countries trust ALET India"),
    image: image("Main picture", "/images/hero-technologies.jpg", "AI, cloud, web, mobile and modern technology services"),
    phoneLeft: image("Phone picture, left", "/images/work/tajika-1.png", "Tajika mobile app"),
    phoneRight: image("Phone picture, right", "/images/all_deliveries_home.png", "All Deliveries mobile app home"),
    badge1Value: text("Badge 1 number", "500+"),
    badge1Label: text("Badge 1 text", "Projects delivered"),
    badge2Title: text("Badge 2 title", "Clutch"),
    badge2Label: text("Badge 2 text", "Clients say we deliver"),
  },
  "/#client_logos": {
    heading: text("Heading", "Driving technology for our clients"),
  },
  "/#services": {
    eyebrow: text("Small label", "Our Services"),
    title: text("Heading", "Building digital products that"),
    accent: text("Heading (highlighted part)", "grow your business"),
    text: textarea("Text", codeHero.paragraphs[1]),
    explore: text("Card link text", "Explore"),
  },
  "/#work": {
    eyebrow: text("Small label", "Portfolio"),
    title: text("Heading", "Products we've"),
    accent: text("Heading (highlighted part)", "brought to life"),
    text: text("Text", "Real apps for real clients — drag or scroll to explore."),
    link: link("Link", { label: "View all projects", href: "/portfolio" }),
  },
  "/#industries": {
    eyebrow: text("Small label", "Industries"),
    title: text("Heading", "Your industry doesn't matter."),
    accent: text("Heading (highlighted part)", "We make it real."),
    text: textarea("Text", "We have built apps for almost every category of the App Store, from travel and pharma to fantasy sports and on-demand delivery."),
  },
  "/#about": {
    eyebrow: text("Small label", codeAbout.title),
    titleBefore: text("Heading, first words", "You can be"),
    titleAccent: text("Heading, highlighted word", "bigger"),
    titleAfter: text("Heading, last words", "with ALET INDIA"),
    tagline: text("Line under the heading", "Take the first step towards your success."),
    intro: textarea("Text", `${codeAbout.paragraphs[0].split(". ").slice(0, 2).join(". ").replace(/\.$/, "")}.`),
    readMore: text("Read more button", "Read our full story"),
    link: link("Link", { label: "More about ALET India", href: "/about-us" }),
  },
  "/#faqs": {
    eyebrow: text("Small label", "FAQs"),
    title: text("Heading", "Questions,"),
    accent: text("Heading (highlighted part)", "answered"),
    stillCurious: text("Text before the email", "Still curious? Write to"),
    image: image("Picture", "/images/pages/faq-question.jpg", "A man raising his hand to ask a question"),
  },
  "_shared#hero_buttons": {
    homeCrumb: text("Breadcrumb: first link", "Home"),
    primary: link("Main button on page headers", { label: "Get a Free Consultation", href: "/contact-us" }),
    secondary: link("Second button on page headers", { label: "View Our Work", href: "/portfolio" }),
  },
  "/services#hero": {
    eyebrow: text("Small label", "Capabilities"),
    title: text("Heading", "Technology that moves your business"),
    accent: text("Heading (highlighted part)", "forward."),
    text: textarea("Text", "From mobile and web apps to design, marketing, AI, Salesforce, and games — explore everything ALET India builds for your business."),
  },
  "_shared#service_page": {
    portfolioEyebrow: text("Screens block: small label", "From our portfolio"),
    portfolioTitle: text("Screens block: heading", "Screens from apps we've shipped"),
    stackEyebrow: text("Stack block: small label", "Our stack"),
    stackTitle: text("Stack block: heading", "Technologies"),
    stackAccent: text("Stack block: heading (highlighted part)", "we trust"),
    moreEyebrow: text("More services: small label", "More services"),
    moreSplitTitle: text("More services heading (layout 1)", "Explore"),
    moreSplitAccent: text("More services heading, highlighted (layout 1)", "other services"),
    moreImmersiveTitle: text("More services heading (layout 2)", "Keep"),
    moreImmersiveAccent: text("More services heading, highlighted (layout 2)", "exploring"),
    moreEditorialTitle: text("More services heading (layout 3)", "You may"),
    moreEditorialAccent: text("More services heading, highlighted (layout 3)", "also need"),
    explore: text("Service card link", "Explore"),
    deliverEyebrow: text("What we deliver: small label", "What we deliver"),
    deliverTitle: text("What we deliver: heading", "Built for"),
    deliverAccent: text("What we deliver: heading (highlighted part)", "real results"),
    craftedEyebrow: text("Screens showcase: small label", "Crafted by ALET"),
    craftedTitle: text("Screens showcase: heading", "Interfaces people"),
    craftedAccent: text("Screens showcase: heading (highlighted part)", "enjoy using"),
    craftedText: textarea("Screens showcase: text", "A look at screens we designed and built for clients across real estate, fashion, sports, and travel."),
    craftedLink: link("Screens showcase: button", { label: "See the full portfolio", href: "/portfolio" }),
    overviewEyebrow: text("Overview: small label", "Overview"),
    liveEyebrow: text("Live project: small label", "Live project"),
    liveTitle: text("Live project: heading", "Built and launched"),
    liveAccent: text("Live project: heading (highlighted part)", "by ALET"),
    liveTab: text("Live project: browser tab", "Courier & Logistics"),
    liveImageAlt: text("Live project: picture description", "All Deliveries website built and launched by ALET"),
    recentEyebrow: text("Recent projects: small label", "Portfolio"),
    recentTitle: text("Recent projects: heading", "Recent"),
    recentAccent: text("Recent projects: heading (highlighted part)", "projects"),
    recentTextBefore: text("Recent projects: text before the service name", "Explore selected"),
    recentTextAfter: textarea("Recent projects: text after the service name", "work, with the product thinking, interface craft, and delivery detail visible in every project."),
  },
  "/portfolio#hero": {
    crumb: text("Breadcrumb", "Portfolio"),
    title: text("Heading", "Products we've"),
    accent: text("Heading (highlighted part)", "brought to life"),
    text: textarea("Text", "Real apps for real clients — from on-demand delivery and ride booking to fashion stores, fantasy sports, and multiplayer games."),
    projectsLabel: text("Number label: projects (counted)", "Featured projects"),
    industriesLabel: text("Number label: industries (counted)", "Industries served"),
    countriesValue: text("Number: countries", "20+"),
    countriesLabel: text("Number label: countries", "Countries"),
    wall: images("Background screens (9, in 3 columns)", [
      "/images/work/tajika-1.png", "/images/QUICK-SAWARI.png", "/images/GURI-HOUSES.png",
      "/images/all_deliveries_home.png", "/images/Refult.png", "/images/cricket-fantasybuzz-1.png",
      "/images/QUICK-SAWARI-2.png", "/images/work/tajika-2.png", "/images/REFULT-2.png",
    ].map((src) => ({ src, alt: "" }))),
  },
  "/portfolio#project_spotlight": {
    eyebrow: text("Small label (shows the first project)", "Project spotlight"),
  },
  "/portfolio#case_studies": {
    eyebrow: text("Small label", "Case studies"),
    title: text("Heading", "Browse our"),
    accent: text("Heading (highlighted part)", "work"),
    filters: paragraphs("Filter names (All, mobile, web, games)", ["All", "Mobile Apps", "Web", "Games"]),
  },
  "/portfolio#industries": {
    eyebrow: text("Small label", "Industries"),
    title: text("Heading", "Sectors we"),
    accent: text("Heading (highlighted part)", "build for"),
  },
  "/career#hero": {
    crumb: text("Breadcrumb", "Career"),
    title: text("Heading", "Open roles at ALET India"),
    textBefore: textarea("Text (the careers email follows it)", "Developers, designers, and marketers. Pick a role, read what the week looks like, and send your resume to"),
    button: text("Button", "Browse openings"),
  },
  "/career#why_join": {
    eyebrow: text("Small label", "Why join"),
    title: text("Heading", "Work you can point to"),
    perks: items("Cards (4)", [
      { title: "Shipped products", body: "Apps and platforms already used by clients in 20+ countries.", image: "/images/pages/phone-apps.jpg" },
      { title: "A modern stack", body: "Kotlin, Swift, Flutter, React, and Next.js on live client work.", image: "/images/pages/code.jpg" },
      { title: "New Delhi studio", body: "A close team building together since 2017.", image: "/images/pages/team-laptops.jpg" },
      { title: "Room to grow", body: "Own a feature, then a product, with leads who review your work.", image: "/images/pages/presentation.jpg" },
    ]),
  },
  "/career#openings": {
    eyebrow: text("Small label", "Open positions"),
    title: text("Heading", "Pick a role"),
    textBefore: textarea("Text (the careers email follows it)", "Select a job to see the work and the skills. Apply by email and we will reply from"),
  },
  "/career#no_match": {
    eyebrow: text("Small label", "No match?"),
    title: text("Heading", "Send your resume anyway"),
    text: textarea("Text", "If your work fits mobile, web, design, or marketing, write to us. We keep strong profiles for the next opening."),
    image: image("Picture", "/images/pages/coworking.jpg", "ALET India studio"),
    footnote: text("Line under the box", "Looking for a project instead of a role?"),
    footnoteLink: link("Link in that line", { label: "Talk to the team", href: "/contact-us" }),
  },
  "/contact-us#hero": {
    crumb: text("Breadcrumb", "Contact Us"),
    title: text("Heading", "Let's talk about"),
    accent: text("Heading (highlighted part)", "your idea"),
    text: textarea("Text", "Share your project, budget, and timeline — our team replies within 24 hours with next steps and a free consultation."),
    callLabel: text("Card label: phone", "Call us"),
    salesLabel: text("Card label: sales email", "Sales"),
    careersLabel: text("Card label: careers email", "Careers"),
    visitLabel: text("Card label: address", "Visit us"),
    visitValue: text("Short address on the card", "Mayur Vihar Phase I, New Delhi"),
    image: image("Picture", "/images/pages/contact-desk.jpg", "Planning a project on a laptop"),
    responseLabel: text("Badge label", "Avg. response"),
    responseValue: text("Badge value", "Under 24 hrs"),
    people: images("Client photos (3)", [
      { src: "/images/people/aadi.jpg", alt: "" },
      { src: "/images/people/rk.jpg", alt: "" },
      { src: "/images/people/insight.png", alt: "" },
    ]),
    clientsBadge: text("Client photos text", "500+ happy clients"),
  },
  "/contact-us#contact_form": {
    eyebrow: text("Small label", "Send an inquiry"),
    title: text("Heading", "Tell us about your"),
    accent: text("Heading (highlighted part)", "project"),
    officeImage: image("Office picture", "/images/pages/office-2.jpg", "Modern office workspace"),
    officeLabel: text("Office label", "Our office"),
    mapTitle: text("Map description", "ALET India office location"),
  },
  "/contact-us#faq": {
    eyebrow: text("Small label", "FAQ"),
    title: text("Heading", "Before you"),
    accent: text("Heading (highlighted part)", "reach out"),
    image: image("Picture", "/images/pages/video-call.jpg"),
  },
  "/blogs#hero": {
    crumb: text("Breadcrumb", "Blogs"),
    eyebrow: text("Small label", "The ALET journal"),
    title: text("Heading", "Notes from building products"),
    countText: text("Text after the number of articles", "articles on design, startups, cost, and how to choose a build."),
  },
  "/blogs#journal": {
    categories: paragraphs("Filter categories (first one shows all)", ["All", "Mobile Application Development", "Software Development", "Web Application", "Augmented Reality", "Online Ticketing System"]),
    read: text("Featured article link", "Read"),
    empty: text("When a category has no articles", "No articles in this category yet."),
    loadMore: text("Load more button", "Load more"),
  },
  "/blogs/[slug]#article": {
    homeCrumb: text("Breadcrumb: first link", "Home"),
    blogsCrumb: text("Breadcrumb: second link", "Blogs"),
    minRead: text("Words after the reading minutes", "min read"),
    ctaEyebrow: text("Side box: small label", "Build it"),
    ctaTitle: text("Side box: heading", "Want this thinking applied to your product?"),
    ctaButton: link("Side box: button", { label: "Talk to ALET", href: "/contact-us" }),
    previous: text("Label: previous article", "Previous"),
    next: text("Label: next article", "Next"),
    moreTitle: text("Related articles heading", "More from the journal"),
    allArticles: link("All articles link", { label: "All articles", href: "/blogs" }),
  },
  "/case-studies#hero": {
    crumb: text("Breadcrumb", "Case Studies"),
    eyebrowBefore: text("Small label (number of studies follows)", "Demo files ·"),
    eyebrowAfter: text("Small label, after the number", "studies"),
    title: text("Heading", "How a product"),
    accent: text("Heading (highlighted part)", "actually got made"),
    text: textarea("Text", "Pick an industry, then open a file. These are working demos of real ALET products, written as the story of the build rather than a results report."),
    openStudy: text("Card button", "Open the full study"),
    footnote: text("Line under the browser", "Want something in this shape for your own product?"),
    footnoteLink: link("Link in that line", { label: "Start a conversation.", href: "/contact-us" }),
  },
  "/case-studies/[slug]#study": {
    homeCrumb: text("Breadcrumb: first link", "Home"),
    listCrumb: text("Breadcrumb: second link", "Case Studies"),
    kindLabel: text("Words after the industry", "Case study"),
    navTitle: text("Side menu heading", "In this file"),
    nav: items("Side menu items (links to the parts of a study)", [
      { id: "challenge", label: "The Challenge" },
      { id: "strategy", label: "Our Understanding & Strategy" },
      { id: "solution", label: "The Solution We Developed" },
      { id: "technology", label: "Technology & Implementation" },
      { id: "results", label: "Results & Business Impact" },
      { id: "next", label: "What's Next?" },
    ]),
    screensTitle: text("Screens: heading", "Walk the screens"),
    screensText: textarea("Screens: text", "Tap a frame to bring that screen forward. These are the product views from the build."),
    ctaTitle: text("Box: heading", "Have a similar business idea?"),
    ctaText: textarea("Box: text", "Let's turn your vision into a connected digital experience."),
    ctaButton: link("Box: button", { label: "Start your project", href: "/contact-us" }),
    nextLabel: text("Next study: small label", "Next file"),
    readNext: text("Next study: link (client name follows)", "Read"),
  },
  "/career#job_board": {
    hiring: text("Badge on the selected job", "Hiring now"),
    experience: text("Label: experience", "Experience"),
    location: text("Label: location", "Location"),
    doTitle: text("List heading: work", "What you will do"),
    bringTitle: text("List heading: skills", "What you bring"),
    apply: text("Apply button", "Apply for this role"),
  },
  "_shared#policy_sidebar": {
    appliesTo: text("Line under the heading", "Applies to all ALET India services"),
    onThisPage: text("Contents label", "On this page"),
    policiesLabel: text("Policies label", "Policies"),
    questionImage: image("Side photo", "/images/pages/video-call.jpg"),
    questionTitle: text("Side box heading", "Have a question?"),
    questionLink: link("Side box link", { label: "Contact our team →", href: "/contact-us" }),
    contactNote: text("Note under the policy", "Questions about this policy? Write to"),
    contactEmail: text("Email for policy questions", "info@aletindia.com"),
    orCall: text("Words before the phone number", "or call"),
  },
} as const satisfies Record<string, Record<string, Field>>;

export type SectionId = keyof typeof SECTION_FIELDS;
type Widen<T> = T extends string ? string : T extends readonly (infer U)[] ? Widen<U>[] : T extends object ? { -readonly [K in keyof T]: Widen<T[K]> } : T;
export type SectionValues<Id extends SectionId> = { [K in keyof (typeof SECTION_FIELDS)[Id]]: Widen<(typeof SECTION_FIELDS)[Id][K] extends { default: infer D } ? D : never> };

const filled = (value: unknown): boolean => {
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("src" in record) return typeof record.src === "string" && record.src.trim() !== "";
    if ("href" in record) return typeof record.label === "string" && record.label.trim() !== "";
    return true;
  }
  return false;
};

/** Stored values over the defaults; anything empty or missing keeps the website's own copy. */
export function mergeFields<Id extends SectionId>(id: Id, stored: Record<string, unknown> | null | undefined): SectionValues<Id> {
  const fields = SECTION_FIELDS[id] as Record<string, Field>;
  const values: Record<string, unknown> = {};
  for (const [name, field] of Object.entries(fields)) {
    const value = stored?.[name];
    values[name] = filled(value) ? value : field.default;
  }
  return values as SectionValues<Id>;
}

/** Defaults only (what the code shows), e.g. for seeding the database. */
export const defaultFields = <Id extends SectionId>(id: Id) => mergeFields(id, null);
