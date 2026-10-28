import { assetPath } from "@/lib/site-path";
import { HtmlEmbed } from "@/components/html-embed";

export function AboutJourney() {
  return (
    <section aria-label="Our journey" className="w-full overflow-hidden bg-[#ededf0]">
      <HtmlEmbed
        title="ALET India journey from 2017 to today"
        src={assetPath("/alet-india-journey.html")}
        className="block w-full border-0"
        fallbackHeight={790}
      />
    </section>
  );
}
