export type ServiceDetail = {
  eyebrow: string;
  headline: string;
  accent: string;
  intro: string;
  sections: { title: string; body: string[] }[];
  highlights: string[];
  stack: string[];
};

export const serviceDetails: Record<string, ServiceDetail> = {
  "mobile-apps": {
    eyebrow: "Mobile Application Development",
    headline: "Mobile apps your customers",
    accent: "love to open",
    intro:
      "ALET India is one of the leading mobile application development companies, with an expert team of Android and iOS developers working on the latest technologies. We build robust, scalable, and innovative apps for businesses of every size, with a modern, customer-driven approach focused on productivity, creativity, and cost effectiveness.",
    sections: [
      {
        title: "Android App Development",
        body: [
          "ALET India has a strong team of Android developers and testers who make sure every Android app we deliver is reliable, flawless, high performing, and built to a very high standard.",
          "Keeping pace with the growing popularity of Android apps — for entertainment, social networking, and enterprise use — we create contemporary mobile solutions for businesses across the globe. Our designers are known for outstanding UI with a minimalist approach and Material Design that fits Android devices perfectly.",
          "From retail, communications, and banking to insurance, healthcare, and government, organisations across industries must meet customer expectations for fast, convenient ways to transact and access information. Mobile apps have become an essential part of every business.",
        ],
      },
      {
        title: "iOS App Development",
        body: [
          "ALET India is backed by a highly talented team of iOS developers who are experts in Apple-exclusive technologies. Our designers craft outstanding UI with a minimalist approach that feels natural on iOS devices.",
          "For complex iOS applications, we have strategists and full-stack iPhone developers who know the latest iOS SDKs and frameworks, and deliver comprehensive iOS app development services.",
          "We build apps across the Apple ecosystem — iPhone, iPad, Apple Watch, and Apple TV — with deep experience in UIKit, Core Graphics, Core Animation, Core Data, Foundation, Game Controllers, and cloud integration.",
        ],
      },
    ],
    highlights: [
      "Native Android & iOS",
      "Material & Human Interface design",
      "Play Store & App Store launch",
      "Ongoing support & upgrades",
    ],
    stack: ["Kotlin", "Java", "Swift", "React Native", "Flutter", "Firebase"],
  },
  "cross-platform": {
    eyebrow: "Cross-functional Application Development",
    headline: "One codebase,",
    accent: "every platform",
    intro:
      "Our cross-functional teams bring business analysts, UI/UX experts, developers, database engineers, and testers together to remove development hassles. Apps built with cross-platform technologies like React Native, Flutter, and NativeScript reach a larger audience with a consistent experience — while keeping development costs far lower than building separate apps for each platform.",
    sections: [
      {
        title: "Hybrid Application Development",
        body: [
          "Hybrid development lets an app run on multiple platforms with the same content and functionality, whether it is Android or iOS.",
          "Keeping consistency across many platforms and devices is one of the biggest challenges for businesses and developers, especially for BYOD solutions where the target platform is unknown. Hybrid apps solve this to a large extent, and can still use native capabilities like the accelerometer, camera, audio, and GPS.",
        ],
      },
      {
        title: "Same Code, Different Architecture",
        body: [
          "ALET India provides complete, end-to-end hybrid app development, combining the latest frameworks available for different mobile devices.",
          "We deliver high-performing, robust, feature-packed, secure, and easy-to-use hybrid apps for IT companies and business organisations. With HTML5, CSS3, Angular, and modern JavaScript frameworks, our cross-platform apps perform anywhere.",
        ],
      },
    ],
    highlights: [
      "Android + iOS from one codebase",
      "Lower build & maintenance cost",
      "Faster time to market",
      "Native device features",
    ],
    stack: ["React Native", "Flutter", "Ionic", "NativeScript", "Angular", "TypeScript"],
  },
  "web-apps": {
    eyebrow: "Web Application Development",
    headline: "Web platforms built to",
    accent: "scale with you",
    intro:
      "ALET India has a team of expert professionals in web application design and software development. We learn about your business and requirements first, then craft original, custom concepts to the written specification — using off-the-shelf solutions or building custom software where it fits best.",
    sections: [
      {
        title: "Custom Web Applications",
        body: [
          "From automating web workflows to building challenging web interfaces, we make it easy and reliable for your business to reach customers anywhere in the world.",
          "Every application is designed around your business goals, with a fully responsive, dynamic front end and a secure, scalable back end.",
        ],
      },
      {
        title: "CRM, Web Panels & Dynamic Websites",
        body: [
          "We help businesses select and implement the best-fit CRM for their industry, build custom CRM systems and admin panels, and optimise existing CRM solutions to drive adoption and team productivity.",
          "Dynamic websites and admin dashboards give your team full control over content, orders, users, and reports.",
        ],
      },
      {
        title: "E-Commerce Systems",
        body: [
          "We build powerful, on-demand e-commerce applications with a world-class user experience, thinking from both the customer and the admin perspective.",
          "Our developers design simple yet powerful features — catalogues, carts, payments, and order tracking — so shoppers enjoy a seamless flow from browsing to checkout.",
        ],
      },
    ],
    highlights: [
      "Fully responsive design",
      "Custom CRM & admin panels",
      "E-commerce & payments",
      "Secure, scalable back ends",
    ],
    stack: ["React", "Next.js", "Node.js", "Laravel", "PHP", "MySQL"],
  },
  "graphic-design": {
    eyebrow: "Graphic Designing",
    headline: "Designs that attract and",
    accent: "leave an impact",
    intro:
      "Design that attracts and creates an impact is what ALET India has delivered since 2017. Whether you are a startup or an established enterprise, we turn your requirements into functional designs that make an impression on your customers.",
    sections: [
      {
        title: "Custom Graphics",
        body: [
          "We understand the importance of design in the digital world of business. Our experienced graphic designers bring fresh, innovative ideas and transform a thought into an imaginative visual.",
          "You share a brief, and our creative team works persistently to create an inspired design that matches your vision.",
        ],
      },
      {
        title: "Generic Beautiful Designs",
        body: [
          "Our designers make every visual element carry the message, so each design is both beautiful and practical.",
          "From retail and banking to healthcare and government, every industry needs clear, consistent visuals that customers instantly recognise.",
        ],
      },
      {
        title: "Crafting the Best Design Ideas",
        body: [
          "We have helped many clients build strong visibility for their brands through our design work — logos, brand identities, marketing creatives, and app graphics.",
          "Contact us and we will deliver incomparable graphic design services within an agreed timeline.",
        ],
      },
    ],
    highlights: [
      "Logos & brand identity",
      "Social media creatives",
      "App & web graphics",
      "Print & marketing collateral",
    ],
    stack: ["Photoshop", "Illustrator", "Figma", "After Effects", "CorelDRAW", "Canva"],
  },
  "ui-design": {
    eyebrow: "UX/UI Designing",
    headline: "User-friendly experiences,",
    accent: "elegantly designed",
    intro:
      "UI/UX design is one of ALET India's core services. We follow an innovative, research-first design process: we take the time to learn about your project, your users, and what they want from a web or mobile app — then design interfaces that are both useful and visually satisfying.",
    sections: [
      {
        title: "User-Friendly Experience",
        body: [
          "Great UI is increasingly recognised as an essential tool to increase engagement and create products that are both valuable and visually appealing.",
          "We create the best front-end experiences for web and mobile apps with our creative and experienced team of UI/UX designers.",
        ],
      },
      {
        title: "Elegant Designing",
        body: [
          "We set strategic goals for every project based on known knowledge gaps and user expectations. UI design goes far beyond making a site look good — first impressions matter, and a confusing interface sends users to competitors.",
          "Even the shape of a button decides whether users understand what to do next, so we take great care that every design meets your users' expectations.",
        ],
      },
      {
        title: "Unmatched Quality",
        body: [
          "UI design is the craft of building interfaces — apps and websites — with a focus on look and style, including voice-controlled interfaces.",
          "Our designers stay creative while thinking from the user's perspective, anticipating what the user expects at every step.",
        ],
      },
    ],
    highlights: [
      "User research & personas",
      "Wireframes & prototypes",
      "Design systems",
      "Usability testing",
    ],
    stack: ["Figma", "Adobe XD", "Sketch", "Framer", "Miro", "Zeplin"],
  },
  "digital-marketing": {
    eyebrow: "Digital Marketing",
    headline: "Grow your reach with",
    accent: "real results",
    intro:
      "ALET India is a leading online marketing company offering a complete range of services to help your business grow. From SEO, SMO, SMM, and PPC to ORM and content marketing, we build the right mix into a result-oriented digital plan so your website and app reach the top — and stay there.",
    sections: [
      {
        title: "Search Engine Optimisation",
        body: [
          "No guesswork, just real results. We take time to understand your business and create a plan to reach the top ranks in search engines like Google and Bing.",
          "That means more traffic, more conversions, and more revenue — with a dedicated SEO team committed to steady results built over time.",
        ],
      },
      {
        title: "Social Media Marketing",
        body: [
          "Almost every business can benefit from social media marketing, but knowing which platform to invest in — Facebook, Instagram, X, LinkedIn — is the hard part. We tell you how much to spend and where.",
          "We combine innovative ideas with delightful content that keeps your customers engaged, driving traffic from Facebook, LinkedIn, Instagram, Pinterest, YouTube, and more.",
        ],
      },
      {
        title: "Pay Per Click",
        body: [
          "PPC advertising is a manageable, cost-effective way to earn a top spot in Google and Bing results and on the platforms where your audience spends the most time.",
          "Our ads team is experienced with Google Ads and Microsoft Ads, and focused on maximum return on investment through more leads and sales.",
        ],
      },
      {
        title: "Social Media Optimisation",
        body: [
          "We promote your brand on social platforms like Facebook, X, and LinkedIn with custom, targeted campaigns.",
          "Optimised social profiles help you reach a vast audience and become more visible, with a positive impact on website traffic and sales.",
        ],
      },
    ],
    highlights: [
      "SEO & content marketing",
      "Social media marketing",
      "Google & Bing ads",
      "Monthly performance reports",
    ],
    stack: ["Google Ads", "Meta Ads", "Search Console", "Analytics", "SEMrush", "LinkedIn Ads"],
  },
  "ai-data": {
    eyebrow: "AI & Data Solutions",
    headline: "Practical AI that makes",
    accent: "your data useful",
    intro:
      "You don't need a data science department to benefit from AI. ALET India builds simple, practical AI and data tools — smart chatbots, clear dashboards, and easy automation — that help your team answer customers faster and make better decisions.",
    sections: [
      {
        title: "AI Chatbots & Assistants",
        body: [
          "We build chatbots for your website, app, or WhatsApp that answer common questions, capture leads, and hand over to your team when needed.",
          "Bots are trained on your own content — FAQs, product catalogues, and policies — so answers stay accurate and on-brand.",
        ],
      },
      {
        title: "Data Dashboards & Reports",
        body: [
          "We connect your sales, orders, and marketing data into clean dashboards so you can see what is working at a glance.",
          "Automated reports land in your inbox daily or weekly, without anyone building spreadsheets by hand.",
        ],
      },
      {
        title: "Process Automation",
        body: [
          "Repetitive tasks like data entry, invoice processing, and lead routing can be automated with AI, saving your team hours every week.",
          "We start small with one workflow, prove the value, and then scale automation across your business.",
        ],
      },
    ],
    highlights: [
      "Website & WhatsApp chatbots",
      "Business dashboards",
      "Workflow automation",
      "Secure data handling",
    ],
    stack: ["OpenAI", "Python", "LangChain", "Power BI", "Looker Studio", "Zapier"],
  },
  salesforce: {
    eyebrow: "Salesforce Solutions",
    headline: "Your customers, sales and service in",
    accent: "one trusted CRM",
    intro:
      "ALET India sets up, customises, and integrates Salesforce so your sales, service, and customer data stay organised in one place. Whether you are moving from spreadsheets or improving an existing org, we make Salesforce work the way your team works.",
    sections: [
      {
        title: "Sales Cloud Setup & Customisation",
        body: [
          "We configure leads, opportunities, pipelines, and approval flows around your actual sales process.",
          "Custom dashboards give managers a real-time view of targets, forecasts, and team performance.",
        ],
      },
      {
        title: "Service Cloud & Support",
        body: [
          "Bring every customer request — email, web, phone, and chat — into one queue with case routing and SLAs.",
          "Knowledge articles and automation help your support team resolve issues faster and keep customers happy.",
        ],
      },
      {
        title: "Custom Apps & Integrations",
        body: [
          "We build custom objects, Lightning components, and Apex logic when out-of-the-box features are not enough.",
          "Salesforce is integrated with your website, ERP, payment gateway, and marketing tools so data flows without manual work.",
        ],
      },
    ],
    highlights: [
      "Implementation & migration",
      "Custom objects & flows",
      "Third-party integrations",
      "Admin support & training",
    ],
    stack: ["Sales Cloud", "Service Cloud", "Apex", "Lightning", "Flows", "MuleSoft"],
  },
  gaming: {
    eyebrow: "Game Development",
    headline: "Games players",
    accent: "keep coming back to",
    intro:
      "From casual and board games to multiplayer and immersive titles, ALET India designs, builds, and launches games for mobile and cross-platform play. Our team handles everything from game design and art to gameplay programming, backend, and store launch.",
    sections: [
      {
        title: "Mobile & Casual Games",
        body: [
          "We build fun, polished casual games — board games like Ludo, puzzles, and hyper-casual titles — that are easy to pick up and hard to put down.",
          "Every game is optimised for smooth performance on a wide range of Android and iOS devices.",
        ],
      },
      {
        title: "Multiplayer & Real-Time Play",
        body: [
          "Real-time multiplayer, matchmaking, leaderboards, tournaments, and in-game wallets keep players engaged and competing.",
          "Scalable game servers handle peak traffic so matches stay fast and fair.",
        ],
      },
      {
        title: "3D & Immersive Titles",
        body: [
          "Using Unity and Unreal, we create 3D games with realistic physics, detailed environments, and tuned AI behaviour — like our Sniper Game project.",
          "Modular level design and rapid iteration tools help us refine maps and gameplay quickly.",
        ],
      },
    ],
    highlights: [
      "Game design & art",
      "Real-time multiplayer",
      "Monetisation & ads",
      "Store launch & live ops",
    ],
    stack: ["Unity", "Unreal Engine", "C#", "Photon", "Firebase", "Blender"],
  },
};

export type ServiceLayout = "split" | "immersive" | "editorial";

export type ServiceVisual = {
  layout: ServiceLayout;
  theme: [string, string];
  gallery: [string, string, string];
  screens?: string[];
  stat: { value: string; label: string };
};

export const serviceVisuals: Record<string, ServiceVisual> = {
  "mobile-apps": {
    layout: "split",
    theme: ["#4f46e5", "#06b6d4"],
    gallery: ["/images/pages/phone-apps.jpg", "/images/mobile-dev.jpg", "/images/pages/developers.jpg"],
    screens: [
      "/images/work/tajika-1.png",
      "/images/QUICK-SAWARI.png",
      "/images/work/tajika-2.png",
      "/images/Refult.png",
      "/images/work/tajika-3.png",
    ],
    stat: { value: "2", label: "Platforms, one team" },
  },
  "cross-platform": {
    layout: "immersive",
    theme: ["#0d9488", "#22d3ee"],
    gallery: ["/images/pages/developers.jpg", "/images/services/cross-platform.jpg", "/images/pages/code.jpg"],
    screens: ["/images/work/app-1.png", "/images/QUICK-SAWARI-2.png", "/images/work/app-3.png"],
    stat: { value: "1", label: "Codebase for every device" },
  },
  "web-apps": {
    layout: "editorial",
    theme: ["#2563eb", "#7c3aed"],
    gallery: ["/images/services/web-apps.jpg", "/images/pages/typing.jpg", "/images/pages/developer-woman.jpg"],
    screens: ["/images/ALL-DEIVERIES.png"],
    stat: { value: "100%", label: "Responsive builds" },
  },
  "graphic-design": {
    layout: "split",
    theme: ["#db2777", "#f97316"],
    gallery: ["/images/services/graphic-design.jpg", "/images/pages/design-desk.jpg", "/images/pages/brainstorm.jpg"],
    stat: { value: "2017", label: "Designing brands since" },
  },
  "ui-design": {
    layout: "immersive",
    theme: ["#7c3aed", "#ec4899"],
    gallery: ["/images/services/ui-design.jpg", "/images/pages/women-coding.jpg", "/images/pages/meeting.jpg"],
    screens: ["/images/GURI-HOUSES.png", "/images/REFULT-2.png", "/images/GURI-HOUSES-2.png"],
    stat: { value: "Figma", label: "Prototype before code" },
  },
  "digital-marketing": {
    layout: "editorial",
    theme: ["#ea580c", "#eab308"],
    gallery: ["/images/pages/social-apps.jpg", "/images/services/digital-marketing.jpg", "/images/pages/presentation.jpg"],
    stat: { value: "SEO", label: "SMM · PPC · SMO" },
  },
  "ai-data": {
    layout: "split",
    theme: ["#0891b2", "#8b5cf6"],
    gallery: ["/images/pages/ai-abstract.jpg", "/images/services/ai-data.jpg", "/images/industries/ai.jpg"],
    stat: { value: "24/7", label: "AI assistants" },
  },
  salesforce: {
    layout: "immersive",
    theme: ["#0284c7", "#38bdf8"],
    gallery: ["/images/pages/team-meeting.jpg", "/images/industries/salesforce.jpg", "/images/industries/crm.jpg"],
    stat: { value: "360°", label: "Customer view" },
  },
  gaming: {
    layout: "editorial",
    theme: ["#16a34a", "#a855f7"],
    gallery: ["/images/pages/controller.jpg", "/images/services/gaming.jpg", "/images/pages/retro-gaming.jpg"],
    screens: ["/images/sniper-game.png"],
    stat: { value: "Unity", label: "& Unreal Engine" },
  },
};

export const aboutApproach = [
  {
    title: "Focusing on your needs",
    body: "Our developers channel their skills into building products that focus on your business requirements and empower your business functions.",
    image: "/images/pages/brainstorm.jpg",
  },
  {
    title: "Apps for every audience",
    body: "We build apps for your specific audience — niche, global, or local — so your product reaches the right people.",
    image: "/images/pages/phone-apps.jpg",
  },
  {
    title: "Aesthetic appeal",
    body: "We keep design consistent across every platform, so your app looks and feels great on Android, iOS, and the web.",
    image: "/images/pages/design-desk.jpg",
  },
];

export const careers = {
  email: "hr@aletindia.com",
  openings: [
    {
      id: "senior-android-developer",
      title: "Senior Android Developer",
      department: "Engineering",
      type: "Full time",
      location: "New Delhi",
      experience: "3–4 years",
      image: "/images/services/mobile-apps.jpg",
      summary:
        "Lead Android builds for client apps — from architecture and Kotlin code to Play Store releases.",
      responsibilities: [
        "Design and build applications for the Android platform.",
        "Own features end to end, from screen flow to API integration and release.",
        "Fix bugs, improve performance, and keep apps stable after launch.",
        "Review code and help junior developers ship cleaner work.",
      ],
      skills: [
        "Strong Kotlin and Java",
        "Android Studio, Jetpack, and Material Design",
        "REST APIs, local databases, and Firebase",
        "Git and Play Store publishing",
      ],
    },
    {
      id: "ios-developer",
      title: "iOS Developer",
      department: "Engineering",
      type: "Full time",
      location: "New Delhi",
      experience: "2–4 years",
      image: "/images/pages/phone-apps.jpg",
      summary:
        "Build iPhone and iPad apps that feel native, from SwiftUI screens to App Store submission.",
      responsibilities: [
        "Build and maintain iOS apps in Swift for client products.",
        "Match designs closely and keep interactions smooth on iPhone and iPad.",
        "Integrate APIs, push notifications, and in-app payments.",
        "Prepare builds, TestFlight releases, and App Store listings.",
      ],
      skills: [
        "Swift and SwiftUI or UIKit",
        "Xcode, Instruments, and the App Store Connect flow",
        "REST APIs and local persistence",
        "Care for accessibility and Human Interface Guidelines",
      ],
    },
    {
      id: "flutter-developer",
      title: "Flutter Developer",
      department: "Engineering",
      type: "Full time",
      location: "New Delhi · Hybrid",
      experience: "2–3 years",
      image: "/images/services/cross-platform.jpg",
      summary:
        "Ship one Flutter codebase to Android and iOS without losing the feel of a native app.",
      responsibilities: [
        "Build cross-platform apps in Flutter for Android and iOS.",
        "Create reusable widgets and keep UI consistent with the design files.",
        "Connect apps to REST APIs, maps, and device features.",
        "Profile performance and fix platform-specific issues.",
      ],
      skills: [
        "Flutter and Dart",
        "State management such as Riverpod or Bloc",
        "REST APIs and Firebase",
        "Experience releasing apps on both stores",
      ],
    },
    {
      id: "web-application-developer",
      title: "Web Application Developer",
      department: "Engineering",
      type: "Full time",
      location: "New Delhi",
      experience: "2–5 years",
      image: "/images/services/web-apps.jpg",
      summary:
        "Build responsive websites, admin panels, and web apps with React, Next.js, and Node.",
      responsibilities: [
        "Develop responsive front ends and the APIs behind them.",
        "Build admin panels for orders, users, and content.",
        "Keep pages fast, accessible, and easy to maintain.",
        "Work with designers so the shipped UI matches the approved screens.",
      ],
      skills: [
        "React and Next.js",
        "TypeScript, HTML, and CSS",
        "Node.js or PHP and a SQL database",
        "Git and comfortable deploying web apps",
      ],
    },
    {
      id: "ui-ux-designer",
      title: "UI/UX Designer",
      department: "Design",
      type: "Full time",
      location: "New Delhi",
      experience: "2–4 years",
      image: "/images/services/ui-design.jpg",
      summary:
        "Turn product ideas into clear flows, wireframes, and polished mobile and web interfaces.",
      responsibilities: [
        "Research user flows and turn briefs into wireframes.",
        "Design mobile and web screens in Figma, ready for development.",
        "Build simple prototypes so clients can click through a feature.",
        "Work with developers during build so spacing, type, and states stay intact.",
      ],
      skills: [
        "Figma, components, and auto layout",
        "Mobile and web UI patterns",
        "A portfolio of shipped app or web screens",
        "Clear writing for labels, empty states, and errors",
      ],
    },
    {
      id: "digital-marketing-executive",
      title: "Digital Marketing Executive",
      department: "Marketing",
      type: "Full time",
      location: "New Delhi",
      experience: "1–3 years",
      image: "/images/services/digital-marketing.jpg",
      summary:
        "Plan and run SEO, social, and paid campaigns for ALET and for client products.",
      responsibilities: [
        "Plan content and campaigns for search and social channels.",
        "Set up and report on Google and Meta ads.",
        "Track leads, traffic, and what to change next month.",
        "Write clear posts, landing pages, and campaign updates.",
      ],
      skills: [
        "SEO basics and Google Search Console",
        "Meta Ads or Google Ads",
        "Social content for LinkedIn and Instagram",
        "Comfortable reading simple analytics reports",
      ],
    },
  ],
};

export type LegalSection = { heading?: string; paragraphs: string[]; list?: string[] };

export const privacyPolicy: LegalSection[] = [
  {
    heading: "Objective",
    paragraphs: [
      "This Privacy Statement sets out the privacy and data protection standards followed by Alet India Pvt Limited (\"Alet India\") and its entities around the world for the personal information of its clients, partners, employees (current or former employees and trainees), applicants, contractors, prospects, vendors, and current or former members of the Board of Directors whose personal information is processed by Alet India (\"Data Subjects\").",
      "This Privacy Statement explains the use and protection of personal information collected by Alet India. It applies to any personal information you provide to Alet India and, subject to local law, any personal information we collect from other sources. Throughout this Privacy Statement, \"Alet India\" refers to Alet India Pvt Limited, including its affiliates and subsidiaries (also referred to as \"we\", \"us\", or \"our\").",
    ],
  },
  {
    heading: "Scope of this Privacy Statement",
    paragraphs: [
      "This Privacy Statement covers our information practices, including how we collect, use, share, and protect the personal information you provide to us through our websites that link to this Privacy Statement (collectively, \"Alet India's websites\").",
      "We may also provide social media features on our websites that let you share Alet India information with your social networks and interact with Alet India on social media sites. Your use of these features may result in the collection or sharing of information about you, depending on the feature. We encourage you to review the privacy policies and settings of the social media sites you interact with.",
    ],
  },
  {
    heading: "Personal information you provide to us",
    paragraphs: [
      "We may collect personal information such as your first name, last name, email address, job title, organisation name, country, city, and phone number when you fill in forms or raise a query on our websites, send us emails, call us, or write to us.",
      "By using Alet India's websites, related microsites, and mobile applications, you consent to the processing of your information as explained in this statement. Our websites may contain links to other sites that are beyond our control and are not covered by this Privacy Statement. We encourage you to review the privacy statement of every site you visit.",
    ],
  },
  {
    heading: "Cookies and other technologies",
    paragraphs: [
      "A cookie is a small file, usually of letters and numbers, downloaded to a user's computer or mobile device when the user visits certain websites. Cookies are sent back to the originating website on each subsequent visit and let a website recognise a user's device. They are used for purposes such as site analytics, targeted advertising, recording user preferences, and authentication.",
    ],
    list: [
      "Strictly necessary cookies — required for the site to work and cannot be switched off. They are usually set in response to actions you take, such as setting privacy preferences, logging in, or filling in forms. They do not store personally identifiable information.",
      "Performance cookies — let us count visits and traffic sources so we can measure and improve the performance of our site. All information these cookies collect is aggregated and therefore anonymous.",
      "Functionality cookies — enable enhanced functionality and personalisation. They may be set by us or by third-party providers whose services we have added to our pages.",
      "Targeting cookies — may be set through our site by our advertising partners to build a profile of your interests and show you relevant adverts on other sites. They do not directly store personal information, but uniquely identify your browser and device.",
    ],
  },
  {
    heading: "Access and rectification",
    paragraphs: [
      "You have the right to request access to your personal information, and to correct any inaccuracies in it. You can send us a request at info@aletindia.com. Please include your current contact information, the information you want to access, and your request. We will try to respond, subject to reasonable limits provided by law, unless it infringes on the privacy of others. If we cannot meet your request, we will tell you the reason for refusal.",
      "You also have the option to file a complaint about suspected or actual infringement of your data protection rights with the relevant supervisory authority.",
    ],
  },
  {
    heading: "Anti-spam policy",
    paragraphs: [
      "Alet India treats the receipt, transmission, or distribution of spam (unsolicited bulk email) as a significant concern and has taken reasonable measures to limit spam in our computing environment. All email received by Alet India is subject to spam checks. Email identified as spam is rejected with sufficient information to the sender. Alet India reserves the right to reject and report suspicious spam to the relevant authorities.",
    ],
  },
  {
    heading: "Retention of personal information",
    paragraphs: [
      "We retain your personal information for as long as necessary to provide the services you have requested, or for other essential purposes such as performing a contract, complying with legal obligations, resolving disputes, and enforcing our policies.",
    ],
  },
  {
    heading: "Disclosure of information",
    paragraphs: [
      "To the extent permitted by law, we may share your personal information with agents, contractors, or partners of the Company in connection with services they perform for or with the Company — for example, hosting our databases, data processing, or mailing you information you requested. They are restricted from using this information for any other purpose. You may remove yourself from any such list at any time.",
      "The Company reserves the right to share your personal information in response to duly authorised requests from government authorities or where required by law, including where national, state, or company security is at issue, during a legal investigation, to establish our legal rights, or to prevent criminal activity, suspected fraud, or potential threats to anyone's physical safety.",
      "To the extent permitted by law, we may also transfer your information to a third party in connection with the sale, assignment, or other transfer of the business of this website, in which case we will require the buyer to treat your personal information in line with this Privacy Policy.",
      "This website may contain links to other sites that we believe offer useful information. The policies described here may not apply to those sites, and we suggest contacting them directly for information on their privacy practices.",
    ],
  },
  {
    heading: "Authenticity",
    paragraphs: [
      "Alet India is not responsible for the authenticity of personal information supplied to it by its service providers, whose duty it is to ensure that the information they or their representatives provide is genuine.",
    ],
  },
  {
    heading: "Grievance redressal",
    paragraphs: [
      "Any complaint about the processing of personal information should be sent to Alet India in writing at info@aletindia.com. Complaints will be addressed as quickly as reasonably possible.",
    ],
  },
  {
    heading: "Effective date and changes",
    paragraphs: [
      "This Privacy Statement is effective from April 2020 and replaces all existing policies on the subject.",
      "This Privacy Statement may change from time to time, and the updated statement will be published on this page. We will not reduce your rights under this Privacy Statement without your explicit consent. Please check this page regularly for the latest updates.",
    ],
  },
];

export const termsConditions: LegalSection[] = [
  {
    paragraphs: [
      "The following terms and conditions are deemed to be accepted by the User on use of the website www.aletindia.com. Please read them carefully before using the services of this site.",
      "The term \"User\" refers to the person browsing the site. The term \"Alet India\" refers to Alet India Softwares. The term \"Site\" refers to www.aletindia.com, owned and maintained by Alet India Softwares.",
    ],
  },
  {
    heading: "Updates to the Site",
    paragraphs: [
      "This Site is subject to periodic updates and revisions. Materials should only be considered current as of the date of initial publication, regardless of the date on which you access them. Alet India reserves the right to delete or change information on this Site without prior notice. Past financial performance should not be taken as an indication or guarantee of future performance.",
    ],
  },
  {
    heading: "Ownership of content",
    paragraphs: [
      "The domain www.aletindia.com is owned by Alet India. All content on this Site — including software, text, images, graphics, video, and audio — is the exclusive, proprietary material of Alet India.",
      "No material from this Site may be copied, modified, reproduced, republished, uploaded, transmitted, posted, or distributed in any form without prior written permission from Alet India. All rights not expressly granted are reserved.",
      "The information on this Site is not, and should not be interpreted as, an advertisement or a public offering of the securities of Alet India or any other security described here.",
    ],
  },
  {
    heading: "Unauthorised use",
    paragraphs: [
      "Unauthorised use of the materials on this Site may violate copyright, trademark, and other applicable laws, and could result in criminal or civil penalties. Alet India may monitor access to the Site.",
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      "Alet India will not be liable for damages of any kind — including, without limitation, direct, indirect, incidental, or consequential damages (including lost profits, business interruption, and loss of programs or data) — arising out of the use of or inability to use the Site, any information provided on the Site, or for any other reason.",
    ],
  },
  {
    heading: "Governing law",
    paragraphs: [
      "These terms are governed by the laws of the Republic of India, and the courts in Delhi, India have exclusive jurisdiction over any dispute arising from the use of this Site. Please continue only if you accept all of the conditions listed above, of your own free will and consent.",
    ],
  },
];

export const refundPolicy: LegalSection[] = [
  {
    paragraphs: [
      "Our Refund Policy defines the circumstances under which Alet India Softwares will process a refund for a project, and the procedure for claiming one. By signing up for any of our services, you confirm that you accept and agree to all the terms and conditions in this refund policy.",
    ],
  },
  {
    heading: "How projects are agreed",
    paragraphs: [
      "At Alet India Softwares (AIS), we first freeze the scope of the project through multiple meetings and brainstorming sessions on the business plan the client shares with us, and take approval on it. Only after finalising the scope of work and signing or approving the contract do we raise invoices and accept payment.",
    ],
  },
  {
    heading: "Before a refund is filed",
    paragraphs: [
      "Before any refund or cancellation is filed, our aim is to have a thorough discussion about the issues faced in the project and find common ground to resolve them. If the issues still persist, please email us at support@aletindia.com so we can have a final dialogue. A refund claim is filed only if we cannot reach common ground after these discussions.",
    ],
  },
  {
    heading: "Eligibility for refund",
    paragraphs: ["A refund can be considered only if all of the following are true:"],
    list: [
      "The claim is made within 12 hours of processing the payment for the project.",
      "The project has not been passed to the development team.",
      "No development work has been done on the project.",
      "No payment has been made to any third party directly or indirectly related to the project.",
    ],
  },
  {
    heading: "Cancellation charge",
    paragraphs: [
      "If the client meets all the refund criteria, payment will be returned to the client's account after deducting 35% of the total payment as a cancellation charge (excluding the transaction cost of initiating the refund).",
    ],
  },
  {
    heading: "Projects under development",
    paragraphs: [
      "Alet India Softwares declines all cancellation and refund requests filed while a project is under development. Any claim for a project under development will be settled by fixing the bugs or issues shared by the client, based on mutual agreement and the scope of work frozen before development began. In exceptional situations, Alet India Softwares will not return the amount paid, but it can be adjusted against another project the client wishes to have developed.",
    ],
  },
];
