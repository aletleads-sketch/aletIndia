import { aliDifferenceMarkup, aliDifferenceStyle } from "@/lib/ali-difference-html";
import { applyHtmlTexts } from "@/lib/html-texts";
import { loadFields } from "@/lib/site-content";
import { BASE_PATH } from "@/lib/site-path";

export async function AboutDifference() {
  const { texts } = await loadFields("/about-us#our_difference");
  const contactHref = `${BASE_PATH}/contact-us`.replace(/\/{2,}/g, "/") || "/contact-us";
  const markup = applyHtmlTexts(aliDifferenceMarkup, texts).replaceAll("__CONTACT__", contactHref);

  return (
    <div className="w-full overflow-hidden bg-[#f4f7fd]">
      <style dangerouslySetInnerHTML={{ __html: aliDifferenceStyle }} />
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
