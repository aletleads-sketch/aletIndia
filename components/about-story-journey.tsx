import { assetPath } from "@/lib/site-path";
import { HtmlEmbed } from "@/components/html-embed";

export function AboutStoryJourney() {
  return (
    <section aria-label="ALET India story" className="w-full overflow-hidden bg-[#f3f5fa] pt-2 md:pt-8">
      <HtmlEmbed
        title="ALET India story and growth journey"
        src={assetPath("/embeds/our-journey")}
        className="block w-full border-0"
        fallbackHeight={1233}
      />
    </section>
  );
}
