import { assetPath } from "@/lib/site-path";
import { HtmlEmbed } from "@/components/html-embed";

export function AboutSolutionsJourney() {
  return (
    <section className="w-full overflow-hidden bg-[#f6f8fd]">
      <HtmlEmbed
        title="Alet India solution lifecycle"
        src={`${assetPath("/alet-india-cycle.html")}?v=8`}
        className="block w-full border-0"
        fallbackHeight={684}
      />
    </section>
  );
}
