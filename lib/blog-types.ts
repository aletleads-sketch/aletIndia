export type BlogBlock =
  | { type: "p"; html: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "img"; src: string; alt: string };

export type BlogSection = {
  /** Empty string = intro section with no h2. */
  heading: string;
  blocks: BlogBlock[];
};

export type BlogPost = {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  tag: string;
  categories: string[];
  author: string;
  sections: BlogSection[];
};
