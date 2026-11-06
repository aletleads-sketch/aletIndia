/**
 * The website's lists (one database table each) and how their forms look.
 * A spec describes one value: a column of the row, or a part of a JSON column.
 */
export type Spec =
  | { key: string; label: string; type: "text" | "textarea" | "html" | "number" | "boolean" | "image" | "lines" | "date"; hint?: string }
  | { key: string; label: string; type: "select"; options: string[]; hint?: string }
  | { key: string; label: string; type: "object"; fields: Spec[]; hint?: string }
  | { key: string; label: string; type: "list"; fields: Spec[]; titleKey?: string; hint?: string }
  /** A list of {src, alt} pictures, or of plain picture paths when `plain` is set. */
  | { key: string; label: string; type: "images"; plain?: boolean; hint?: string }
  /** Each entry has a kind (`type`) and shows only the parts that kind uses. */
  | { key: string; label: string; type: "blocks"; kinds: Record<string, Spec[]>; hint?: string };

export type ListSchema = {
  table: string;
  label: string;
  /** What the rows are called, e.g. "service". */
  noun: string;
  /** Column shown as the row's name in the list. */
  title: string;
  subtitle?: string;
  /** Columns read and written (besides id). */
  fields: Spec[];
  order: string;
  /** Values for a new row. */
  blank: Record<string, unknown>;
  /** Where the list shows on the website, for the "Open on website" link. */
  page: (row: Record<string, unknown>) => string;
  /** Extra warning shown above the form. */
  note?: string;
  /** Column holding the picture shown in the list, and how it fits. */
  thumb?: string;
  thumbFit?: "cover" | "contain";
};

/** Lists shown together as tabs, because the sidebar groups them. */
export const LIST_GROUPS = [["projects", "case_studies"], ["faqs", "testimonials", "client_logos", "industries"]];

const status: Spec = { key: "status", label: "Shown on the website?", type: "select", options: ["published", "draft", "review", "archived"], hint: "Only “published” rows appear on the website. “review” means waiting for someone to check it." };
const order: Spec = { key: "sort_order", label: "Order", type: "number", hint: "Smaller numbers come first." };

const caseBlocks = {
  p: [{ key: "text", label: "Paragraph", type: "textarea" }],
  h3: [{ key: "text", label: "Small heading", type: "text" }],
  ul: [{ key: "items", label: "Bullet points", type: "lines" }],
  image: [
    { key: "src", label: "Picture", type: "image" },
    { key: "alt", label: "Picture description", type: "text" },
  ],
} satisfies Record<string, Spec[]>;

const blogBlocks = {
  p: [{ key: "html", label: "Paragraph (may contain <strong>, <em> and <a href> links)", type: "html" }],
  h3: [{ key: "text", label: "Small heading", type: "text" }],
  ul: [{ key: "items", label: "Bullet points (may contain <strong> and links)", type: "lines" }],
  ol: [{ key: "items", label: "Numbered points (may contain <strong> and links)", type: "lines" }],
  img: [
    { key: "src", label: "Picture", type: "image" },
    { key: "alt", label: "Picture description", type: "text" },
  ],
} satisfies Record<string, Spec[]>;

export const LIST_SCHEMAS: ListSchema[] = [
  {
    table: "services", thumb: "hero_image_url",
    label: "Services",
    noun: "service",
    title: "name",
    subtitle: "group_name",
    order: "sort_order",
    page: (row) => `/${row.slug ?? "services"}`,
    note: "The service name is also what the enquiry form saves on each lead, so rename a service only when you mean it.",
    blank: { status: "draft", group_name: "Development", channels: [], sort_order: 100 },
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "nav_label", label: "Name in menus", type: "text" },
      { key: "slug", label: "Page address", type: "text", hint: "e.g. mobile-app-development → /mobile-app-development. A new service also needs its page built by a developer." },
      { key: "service_key", label: "Internal key", type: "text", hint: "Used by the code; do not change for existing services." },
      { key: "group_name", label: "Group", type: "select", options: ["Development", "Designing", "Digital Marketing"] },
      { key: "summary", label: "Short description (cards)", type: "textarea" },
      { key: "hero_image_url", label: "Card picture", type: "image" },
      { key: "hero_image_alt", label: "Card picture description", type: "text" },
      { key: "channels", label: "Sub-services (footer and cards)", type: "lines" },
      {
        key: "body",
        label: "Service page text",
        type: "object",
        fields: [
          { key: "eyebrow", label: "Small label", type: "text" },
          { key: "headline", label: "Heading", type: "text" },
          { key: "accent", label: "Heading (highlighted part)", type: "text" },
          { key: "intro", label: "Introduction", type: "textarea" },
          { key: "sections", label: "Parts of the page", type: "list", titleKey: "title", fields: [
            { key: "title", label: "Heading", type: "text" },
            { key: "body", label: "Paragraphs", type: "lines" },
          ] },
          { key: "highlights", label: "Highlights", type: "lines" },
          { key: "stack", label: "Technologies", type: "lines" },
        ],
      },
      {
        key: "visual",
        label: "Service page design",
        type: "object",
        fields: [
          { key: "layout", label: "Layout", type: "select", options: ["split", "immersive", "editorial"] },
          { key: "theme", label: "Two colours (hex, e.g. #4f46e5)", type: "lines" },
          { key: "gallery", label: "Three pictures", type: "images", plain: true },
          { key: "screens", label: "App screens (optional)", type: "images", plain: true },
          { key: "stat", label: "Number badge", type: "object", fields: [
            { key: "value", label: "Number", type: "text" },
            { key: "label", label: "Text", type: "text" },
          ] },
        ],
      },
      status,
      order,
    ],
  },
  {
    table: "projects", thumb: "logo_url", thumbFit: "contain",
    label: "Portfolio projects",
    noun: "project",
    title: "name",
    subtitle: "industry",
    order: "sort_order",
    page: () => "/portfolio",
    blank: { status: "draft", project_type: "mobile", platforms: [], gallery: [], display: {}, featured: true, sort_order: 100 },
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "slug", label: "Short id", type: "text", hint: "Lowercase words with dashes, e.g. quick-savaari." },
      { key: "industry", label: "Category (shown on the card)", type: "text" },
      { key: "project_type", label: "Filter", type: "select", options: ["mobile", "web", "game"] },
      { key: "summary", label: "Description", type: "textarea" },
      { key: "platforms", label: "Tags", type: "lines" },
      { key: "logo_url", label: "Logo", type: "image" },
      { key: "gallery", label: "Screens", type: "images" },
      { key: "theme", label: "Card colours (Tailwind gradient, e.g. from-[#5b4bdb] to-[#8b5cf6])", type: "text" },
      { key: "display", label: "Card display", type: "object", fields: [
        { key: "landscape", label: "Wide screenshot (website)", type: "boolean" },
        { key: "mockup", label: "Screenshot already has a device frame", type: "boolean" },
      ] },
      status,
      order,
    ],
  },
  {
    table: "case_studies", thumb: "cover_image_url",
    label: "Case studies",
    noun: "case study",
    title: "client",
    subtitle: "industry",
    order: "sort_order",
    page: (row) => `/case-studies/${row.slug ?? ""}`,
    blank: { status: "draft", data: { facts: [], snapshot: [], screens: [], sections: [], challenge: [], approach: [], built: [], outcome: "" }, sort_order: 100 },
    fields: [
      { key: "client", label: "Client", type: "text" },
      { key: "slug", label: "Page address", type: "text", hint: "e.g. tajika → /case-studies/tajika" },
      { key: "industry", label: "Industry", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "cover_image_url", label: "Cover picture", type: "image" },
      {
        key: "data",
        label: "Study",
        type: "object",
        fields: [
          { key: "facts", label: "Facts under the heading", type: "list", titleKey: "label", fields: [
            { key: "label", label: "Label", type: "text" },
            { key: "value", label: "Value", type: "text" },
          ] },
          { key: "screens", label: "Screens", type: "images" },
          { key: "sections", label: "Parts of the study", type: "list", titleKey: "title", fields: [
            { key: "id", label: "Part", type: "select", options: ["challenge", "strategy", "solution", "technology", "results", "next"] },
            { key: "title", label: "Heading", type: "text" },
            { key: "subtitle", label: "Sub-heading (optional)", type: "text" },
            { key: "blocks", label: "Content", type: "blocks", kinds: caseBlocks },
          ] },
          { key: "snapshot", label: "Project snapshot (optional)", type: "list", titleKey: "label", fields: [
            { key: "label", label: "Label", type: "text" },
            { key: "value", label: "Value", type: "text" },
          ] },
          { key: "challenge", label: "Challenge (short, for cards)", type: "lines" },
          { key: "approach", label: "Approach (short, for cards)", type: "list", titleKey: "title", fields: [
            { key: "title", label: "Title", type: "text" },
            { key: "body", label: "Text", type: "textarea" },
          ] },
          { key: "built", label: "What was built (short)", type: "lines" },
          { key: "outcome", label: "Outcome (short)", type: "textarea" },
        ],
      },
      {
        key: "preview",
        label: "Card on the Case Studies page (leave the title empty to hide it there)",
        type: "object",
        fields: [
          { key: "industry", label: "Filter / industry", type: "text" },
          { key: "previewTitle", label: "Title", type: "text" },
          { key: "previewSummary", label: "Summary", type: "textarea" },
          { key: "previewTags", label: "Tags", type: "lines" },
          { key: "previewImage", label: "Picture (optional)", type: "image" },
        ],
      },
      status,
      order,
    ],
  },
  {
    table: "blogs", thumb: "cover_image_url",
    label: "Blogs",
    noun: "blog post",
    title: "title",
    subtitle: "category",
    order: "published_at.desc",
    page: (row) => `/blogs/${row.slug ?? ""}`,
    blank: { status: "draft", author_name: "Alet India Softwares", categories: [], content: { sections: [{ heading: "", blocks: [{ type: "p", html: "" }] }] } },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "Page address", type: "text", hint: "e.g. my-new-article → /blogs/my-new-article" },
      { key: "excerpt", label: "Short summary", type: "textarea" },
      { key: "published_at", label: "Date", type: "date" },
      { key: "author_name", label: "Author", type: "text" },
      { key: "category", label: "Main category", type: "text" },
      { key: "categories", label: "Categories (used by the filters)", type: "lines" },
      { key: "cover_image_url", label: "Cover picture", type: "image" },
      { key: "cover_image_alt", label: "Cover picture description", type: "text" },
      {
        key: "content",
        label: "Article",
        type: "object",
        fields: [
          { key: "sections", label: "Parts of the article", type: "list", titleKey: "heading", fields: [
            { key: "heading", label: "Heading (leave empty for the opening part)", type: "text" },
            { key: "blocks", label: "Content", type: "blocks", kinds: blogBlocks },
          ] },
        ],
      },
      status,
    ],
  },
  {
    table: "faqs",
    label: "FAQs",
    noun: "question",
    title: "question",
    subtitle: "topic",
    order: "topic,sort_order",
    page: (row) => (row.topic === "contact" ? "/contact-us" : "/"),
    blank: { status: "draft", topic: "home", sort_order: 100 },
    fields: [
      { key: "question", label: "Question", type: "text" },
      { key: "answer", label: "Answer", type: "textarea" },
      { key: "topic", label: "Shown on", type: "select", options: ["home", "contact"], hint: "home = Home page, contact = Contact page." },
      status,
      order,
    ],
  },
  {
    table: "testimonials", thumb: "image_url",
    label: "Testimonials",
    noun: "testimonial",
    title: "client_name",
    subtitle: "client_role",
    order: "sort_order",
    page: () => "/",
    blank: { status: "draft", image_fit: "cover", sort_order: 100 },
    fields: [
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "client_name", label: "Name", type: "text" },
      { key: "client_role", label: "Role / company", type: "text" },
      { key: "image_url", label: "Photo or logo", type: "image" },
      { key: "image_fit", label: "Picture fit", type: "select", options: ["cover", "contain"], hint: "cover for photos, contain for logos." },
      status,
      order,
    ],
  },
  {
    table: "client_logos", thumb: "logo_url", thumbFit: "contain",
    label: "Client logos",
    noun: "logo",
    title: "client_name",
    order: "sort_order",
    page: () => "/",
    blank: { status: "draft", sort_order: 100 },
    fields: [
      { key: "client_name", label: "Client", type: "text" },
      { key: "logo_url", label: "Logo", type: "image" },
      status,
      order,
    ],
  },
  {
    table: "industries", thumb: "image_url",
    label: "Industries",
    noun: "industry",
    title: "name",
    order: "sort_order",
    page: () => "/",
    blank: { status: "draft", sort_order: 100 },
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "image_url", label: "Picture", type: "image" },
      status,
      order,
    ],
  },
  {
    table: "careers", thumb: "image_url",
    label: "Jobs",
    noun: "job",
    title: "title",
    subtitle: "department",
    order: "sort_order",
    page: () => "/career",
    blank: { status: "draft", employment_type: "Full time", location: "New Delhi", description: { responsibilities: [], skills: [] }, sort_order: 100 },
    fields: [
      { key: "title", label: "Job title", type: "text" },
      { key: "slug", label: "Short id", type: "text", hint: "Lowercase words with dashes, e.g. senior-android-developer." },
      { key: "department", label: "Department (filter)", type: "text" },
      { key: "employment_type", label: "Type", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "experience", label: "Experience", type: "text" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "image_url", label: "Picture", type: "image" },
      { key: "description", label: "Details", type: "object", fields: [
        { key: "responsibilities", label: "What you will do", type: "lines" },
        { key: "skills", label: "What you bring", type: "lines" },
      ] },
      status,
      order,
    ],
  },
  {
    table: "menu_items",
    label: "Menus",
    noun: "link",
    title: "label",
    subtitle: "menu",
    order: "menu,sort_order",
    page: () => "/",
    blank: { menu: "header", visible: true, sort_order: 100 },
    fields: [
      { key: "label", label: "Text", type: "text" },
      { key: "href", label: "Link", type: "text", hint: "/about-us, /#contact or https://…" },
      { key: "menu", label: "Menu", type: "select", options: ["header", "footer_development", "footer_designing", "footer_marketing", "footer_company", "footer_legal", "footer_social", "portals"] },
      { key: "parent_id", label: "Inside (header only)", type: "select", options: [], hint: "Pick “Services” to put the link in the Services dropdown." },
      { key: "visible", label: "Shown", type: "boolean" },
      order,
    ],
  },
];

export const getListSchema = (table: string) => LIST_SCHEMAS.find((schema) => schema.table === table);
