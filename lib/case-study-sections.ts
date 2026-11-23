/** Shared “In this file” nav — headings only (no explanations). */
export const caseStudyFileNav = [
  { id: "challenge", label: "The Challenge" },
  { id: "strategy", label: "Our Understanding & Strategy" },
  { id: "solution", label: "The Solution We Developed" },
  { id: "technology", label: "Technology & Implementation" },
  { id: "results", label: "Results & Business Impact" },
  { id: "next", label: "What's Next?" },
] as const;

export type CaseStudyContentBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "image"; src: string; alt: string };

export type CaseStudyNarrativeSection = {
  id: (typeof caseStudyFileNav)[number]["id"];
  title: string;
  subtitle?: string;
  blocks: CaseStudyContentBlock[];
};

/** All Deliveries — body copy from All Deliveries-Case Study.docx */
export const allDeliveriesSections: CaseStudyNarrativeSection[] = [
  {
    id: "challenge",
    title: "The Challenge",
    subtitle: "Simplifying Complex Logistics Operations Through a Connected Digital Experience",
    blocks: [
      {
        type: "p",
        text: "As digital services continue to evolve, customers increasingly expect convenient, transparent, and reliable ways to manage their everyday delivery and transportation needs.",
      },
      {
        type: "p",
        text: "The vision behind All Deliveries was to create a unified digital ecosystem where customers could access multiple logistics services without switching between different platforms.",
      },
      {
        type: "p",
        text: "However, building such an ecosystem presented several business and technical challenges.",
      },
      {
        type: "p",
        text: "The platform needed to support three distinct service models: Parcel Delivery, Shop for Me, and Rent Delivery Vehicle, each with its own booking process, operational workflows, pricing mechanisms, and fulfilment requirements.",
      },
      {
        type: "p",
        text: "Beyond customer convenience, the solution also needed to coordinate multiple operational participants, including delivery partners, shoppers, sales agents, and administrators.",
      },
      { type: "h3", text: "Key challenges included:" },
      {
        type: "ul",
        items: [
          "Designing a unified platform capable of supporting multiple logistics services with different business rules.",
          "Coordinating customers, delivery partners, shoppers, and sales agents through interconnected applications.",
          "Supporting online payments and Cash on Delivery (COD) across different service workflows.",
          "Providing order visibility, booking updates, and delivery tracking.",
          "Managing exceptions such as failed deliveries, cancellations, returns, and delivery reattempts.",
          "Creating a centralized administrative system for monitoring operations, managing participants, and tracking business activities.",
          "Developing a scalable technical foundation capable of accommodating future services and enhancements.",
        ],
      },
      {
        type: "p",
        text: "The challenge was not simply to develop individual mobile applications, but to establish a connected logistics ecosystem that could bring customers, service providers, and business operations together.",
      },
    ],
  },
  {
    id: "strategy",
    title: "Our Understanding & Strategy",
    subtitle: "Turning a Business Vision Into a Structured Digital Product",
    blocks: [
      {
        type: "p",
        text: "At Alet India, we approached All Deliveries by first understanding the client's broader business vision and the operational requirements behind each service.",
      },
      {
        type: "p",
        text: "Rather than treating Parcel Delivery, Shop for Me, and Rent Delivery Vehicle as isolated products, our strategy focused on designing an interconnected platform built around shared business capabilities and coordinated workflows.",
      },
      {
        type: "p",
        text: "Our team worked on translating business requirements into structured functional specifications, user journeys, application designs, and development priorities.",
      },
      {
        type: "p",
        text: "The strategy was guided by five key considerations.",
      },
      { type: "h3", text: "Business-Centric Requirement Analysis" },
      {
        type: "p",
        text: "Understanding how each logistics service would operate, including booking, service fulfilment, payments, cancellations, and exception handling.",
      },
      { type: "h3", text: "Multi-Actor Ecosystem Planning" },
      {
        type: "p",
        text: "Defining the responsibilities and interactions of customers, delivery partners, shoppers, sales agents, and administrators to establish coordinated operational workflows.",
      },
      { type: "h3", text: "Modular Product Architecture" },
      {
        type: "p",
        text: "Planning a technical foundation that supports shared capabilities while accommodating the distinct requirements of individual services and applications.",
      },
      { type: "h3", text: "Structured Agile Delivery" },
      {
        type: "p",
        text: "Organizing development activities through feature prioritization, sprint planning, continuous collaboration, testing, and iterative improvements.",
      },
      { type: "h3", text: "Scalability & Long-Term Product Evolution" },
      {
        type: "p",
        text: "Considering future integrations, operational enhancements, additional services, and changing business requirements throughout the development process.",
      },
      {
        type: "p",
        text: "This approach provided a structured foundation for translating the client's business objectives into an evolving digital product.",
      },
    ],
  },
  {
    id: "solution",
    title: "The Solution We Developed",
    subtitle: "One Platform. Three Core Services. Five Interconnected Applications.",
    blocks: [
      {
        type: "p",
        text: "All Deliveries is being developed as an integrated logistics platform that brings multiple on-demand services together within a connected digital ecosystem.",
      },
      {
        type: "p",
        text: "The solution is structured around three primary services.",
      },
      { type: "h3", text: "Parcel Delivery" },
      {
        type: "p",
        text: "A digital parcel booking and management service designed to allow customers to arrange shipments, select pickup and delivery locations, choose payment methods, and follow the progress of their deliveries.",
      },
      {
        type: "p",
        text: "The service also incorporates workflows for handling delivery exceptions, including unsuccessful deliveries, return requests, and reattempt scenarios.",
      },
      { type: "h3", text: "Shop for Me" },
      {
        type: "p",
        text: "An assisted shopping service designed to connect customers with designated shoppers who can purchase requested items and coordinate their delivery.",
      },
      {
        type: "p",
        text: "The service includes shopping requests, order management, communication of shopping progress, and payment-related workflows.",
      },
      { type: "h3", text: "Rent Delivery Vehicle" },
      {
        type: "p",
        text: "A vehicle rental service designed to allow customers to request delivery vehicles for transportation requirements.",
      },
      {
        type: "p",
        text: "The service includes vehicle selection, booking schedules, rental arrangements, and associated operational workflows.",
      },
      { type: "h3", text: "Five Interconnected Applications" },
      {
        type: "p",
        text: "To support these services, the platform is being developed through five specialized applications and interfaces.",
      },
      { type: "h3", text: "1. Customer Application" },
      {
        type: "p",
        text: "The customer-facing application serves as the central entry point for accessing the platform's services. Its scope includes customer registration, service selection, bookings, saved addresses, payment options, order tracking, booking history, and service-related notifications.",
      },
      { type: "h3", text: "2. Delivery Partner Application" },
      {
        type: "p",
        text: "Designed to support delivery partners in managing assigned delivery and transportation activities. Its operational workflows include delivery assignments, pickup and delivery updates, order status management, and delivery completion processes.",
      },
      { type: "h3", text: "3. Shopper Application" },
      {
        type: "p",
        text: "A specialized application for shoppers responsible for fulfilling assisted shopping requests. It supports shopping assignments, item procurement workflows, shopping status updates, and coordination of order fulfilment.",
      },
      { type: "h3", text: "4. Sales Agent Application" },
      {
        type: "p",
        text: "A dedicated application supporting sales agents engaged in customer acquisition, referrals, and promotional activities associated with the platform.",
      },
      { type: "h3", text: "5. Admin Panel" },
      {
        type: "p",
        text: "A centralized web-based administrative interface intended to provide operational oversight across the All Deliveries ecosystem. The administrative scope includes user and actor management, booking oversight, service configurations, transaction visibility, reporting, and operational monitoring.",
      },
      {
        type: "p",
        text: "Together, these applications are designed to provide a coordinated experience across customer interactions, service fulfilment, and business administration.",
      },
    ],
  },
  {
    id: "technology",
    title: "Technology & Implementation",
    subtitle: "Engineering a Scalable, Maintainable, and Integrated Digital Platform",
    blocks: [
      {
        type: "p",
        text: "Developing a multi-service logistics ecosystem requires more than designing user-facing applications. It demands reliable integration between business workflows, backend services, data management, payment systems, and operational infrastructure.",
      },
      {
        type: "p",
        text: "Our technical approach to All Deliveries focuses on building an integrated system with a foundation for maintainability and future expansion.",
      },
      {
        type: "image",
        src: "/images/all-deliveries-tech-stack.png",
        alt: "All Deliveries technology stack and implementation",
      },
      { type: "h3", text: "Technology Stack" },
      {
        type: "ul",
        items: [
          "Flutter for Customer, Delivery Partner, Shopper, and Sales Agent mobile apps.",
          "Next.js for the Admin Panel web experience.",
          "Node.js / NestJS for backend APIs and business logic.",
          "PostgreSQL for database management.",
          "Redis for caching and session management.",
          "Firebase for authentication and push notifications.",
          "Amazon S3 for file and media storage.",
          "AWS for cloud infrastructure, hosting, and deployment.",
          "Socket.IO for real-time order updates and notifications.",
        ],
      },
      { type: "h3", text: "System Architecture" },
      {
        type: "p",
        text: "Four Flutter apps and the Next.js Admin Panel connect to a shared Backend API & Business Logic layer (Node.js + NestJS), with services for authentication, order management, payment processing, notifications, and reporting — backed by PostgreSQL, Redis, S3, AWS, and Socket.IO.",
      },
      { type: "h3", text: "Third-Party Integrations" },
      {
        type: "ul",
        items: [
          "Google Maps for location and routing.",
          "Payment gateways for online payments.",
          "Twilio / SES for SMS and email alerts.",
          "Firebase Cloud Messaging for push notifications.",
        ],
      },
      { type: "h3", text: "Testing & Quality Assurance" },
      {
        type: "ul",
        items: [
          "Jest for unit testing.",
          "Supertest for integration testing.",
          "Flutter Test for mobile app testing.",
          "Playwright for end-to-end testing.",
          "k6 for performance testing.",
          "OWASP ZAP for security testing.",
        ],
      },
      { type: "h3", text: "Deployment & Infrastructure" },
      {
        type: "ul",
        items: [
          "AWS ECS / Fargate for containerized deployment.",
          "Docker for containerization.",
          "GitHub Actions for CI/CD.",
          "CloudWatch for monitoring and logs.",
          "Route 53 for DNS and domain management.",
          "Secrets Manager for secure credentials.",
        ],
      },
      { type: "h3", text: "Our Development Methodology" },
      {
        type: "p",
        text: "The project follows an iterative development approach involving requirement analysis, solution design, implementation, testing, feedback, and continuous refinement.",
      },
      {
        type: "p",
        text: "As the product evolves, additional requirements and enhancements are assessed through a structured change request process to maintain transparency around development priorities, effort, timelines, and business expectations.",
      },
    ],
  },
  {
    id: "results",
    title: "Results & Business Impact",
    subtitle: "Establishing the Foundation for a Connected Logistics Business",
    blocks: [
      {
        type: "p",
        text: "All Deliveries remains under active development, with work progressing across its five interconnected applications and core service workflows.",
      },
      {
        type: "p",
        text: "The development engagement has established a structured direction for bringing several logistics business models together within one coordinated platform.",
      },
      { type: "h3", text: "Key Development Outcomes" },
      { type: "h3", text: "Unified Multi-Service Product Structure" },
      {
        type: "p",
        text: "A shared digital product structure bringing Parcel Delivery, Shop for Me, and Rent Delivery Vehicle into one ecosystem.",
      },
      { type: "h3", text: "Defined Multi-Actor Operations" },
      {
        type: "p",
        text: "A coordinated application model addressing the operational requirements of customers, delivery partners, shoppers, sales agents, and administrators.",
      },
      { type: "h3", text: "Integrated Business Workflows" },
      {
        type: "p",
        text: "Development of interconnected workflows covering bookings, order management, service fulfilment, payment processing, and exception handling.",
      },
      { type: "h3", text: "Centralized Operational Visibility" },
      {
        type: "p",
        text: "Administrative and reporting capabilities designed to support oversight of transactions, participants, orders, and service activities.",
      },
      { type: "h3", text: "Foundation for Continuous Enhancement" },
      {
        type: "p",
        text: "A product structure designed to accommodate emerging requirements, additional integrations, new service capabilities, and ongoing technical improvements.",
      },
      { type: "h3", text: "Expected Business Value" },
      {
        type: "p",
        text: "Once deployed and operationally validated, the platform is intended to support:",
      },
      {
        type: "ul",
        items: [
          "More convenient access to multiple logistics services through a single customer experience.",
          "Better coordination between customers, delivery partners, shoppers, and administrative teams.",
          "Improved visibility into bookings, payments, and service fulfilment.",
          "Reduced dependency on disconnected operational processes.",
          "Greater flexibility to introduce new services and expand existing capabilities.",
        ],
      },
      {
        type: "p",
        text: "These are intended business benefits. Measurable operational improvements, adoption figures, and efficiency gains will be assessed after launch using verified performance data.",
      },
    ],
  },
  {
    id: "next",
    title: "What's Next?",
    subtitle: "Building Beyond the Initial Product Release",
    blocks: [
      {
        type: "p",
        text: "The All Deliveries roadmap extends beyond the initial development scope.",
      },
      {
        type: "p",
        text: "As the product progresses toward launch and future operations, the next phase is expected to focus on enhancing user convenience, strengthening operational processes, and expanding the platform's capabilities.",
      },
      { type: "h3", text: "Planned enhancements include:" },
      { type: "h3", text: "Wallet & Refund Management" },
      {
        type: "p",
        text: "Introducing wallet functionality and refund management workflows for eligible booking cancellations.",
      },
      { type: "h3", text: "Express Parcel Delivery" },
      {
        type: "p",
        text: "Enabling immediate parcel booking without requiring customers to select a scheduled pickup or delivery date and time.",
      },
      { type: "h3", text: "Advanced Undelivered Parcel Management" },
      {
        type: "p",
        text: "Enhancing unsuccessful delivery handling through return and reattempt workflows, updated payment calculations, and revenue allocation mechanisms.",
      },
      { type: "h3", text: "Digital Address Integration" },
      {
        type: "p",
        text: "Integrating a digital address code service to improve location identification and address validation.",
      },
      { type: "h3", text: "Enhanced Sales Agent Management" },
      {
        type: "p",
        text: "Introducing location-based filtering capabilities for active sales agents.",
      },
      { type: "h3", text: "Flexible Promotional Campaigns" },
      {
        type: "p",
        text: "Enabling multiple users to be associated with a single promotional code, supporting broader promotional initiatives.",
      },
      {
        type: "p",
        text: "Alongside these enhancements, continued development, testing, infrastructure management, performance optimization, and technical support will remain important to the platform's evolution.",
      },
      { type: "h3", text: "A Long-Term Approach to Digital Product Development" },
      {
        type: "p",
        text: "The All Deliveries project represents Alet India's approach to building technology around real business needs.",
      },
      {
        type: "p",
        text: "From understanding operational complexity to designing interconnected applications and supporting continuous enhancement, our focus remains on developing solutions that can evolve alongside our clients' ambitions.",
      },
      {
        type: "p",
        text: "Because successful digital products are not defined by launch alone, but by their ability to adapt, improve, and deliver lasting value.",
      },
    ],
  },
];

/** Lightweight narrative for studies that do not yet have a full case-study document. */
export function legacyNarrativeSections(input: {
  challenge: string[];
  approach: { title: string; body: string }[];
  built: string[];
  outcome: string;
}): CaseStudyNarrativeSection[] {
  return [
    {
      id: "challenge",
      title: "The Challenge",
      blocks: input.challenge.map((text) => ({ type: "p" as const, text })),
    },
    {
      id: "strategy",
      title: "Our Understanding & Strategy",
      blocks: input.approach.flatMap((step) => [
        { type: "h3" as const, text: step.title },
        { type: "p" as const, text: step.body },
      ]),
    },
    {
      id: "solution",
      title: "The Solution We Developed",
      blocks: [{ type: "ul", items: input.built }],
    },
    {
      id: "technology",
      title: "Technology & Implementation",
      blocks: [
        {
          type: "p",
          text: "The product was designed and built with a practical stack suited to the platforms and workflows described above, with testing and release practices aligned to the delivery scope.",
        },
      ],
    },
    {
      id: "results",
      title: "Results & Business Impact",
      blocks: [{ type: "p", text: input.outcome }],
    },
    {
      id: "next",
      title: "What's Next?",
      blocks: [
        {
          type: "p",
          text: "Continued refinement, new capabilities, and ongoing support remain available as the product evolves with the business.",
        },
      ],
    },
  ];
}
