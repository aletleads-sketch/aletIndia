import { aliDifferenceMarkup, aliDifferenceStyle } from "@/lib/ali-difference-html";
import { BASE_PATH } from "@/lib/site-path";

export function AboutDifference() {
  const contactHref = `${BASE_PATH}/contact-us`.replace(/\/{2,}/g, "/") || "/contact-us";
  const markup = aliDifferenceMarkup.replaceAll("__CONTACT__", contactHref);

  return (
    <div className="w-full overflow-hidden bg-[#f4f7fd]">
      <style dangerouslySetInnerHTML={{ __html: aliDifferenceStyle }} />
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
