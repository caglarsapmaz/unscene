import { BackToTop } from "@/components/back-to-top";
import { Footer } from "@/components/footer";
import { Header, SkipLink } from "@/components/header";
import { How, Privacy } from "@/components/sections";
import { Workspace } from "@/components/workspace";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Unscene",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (modern web browser)",
  inLanguage: ["en", "tr"],
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: "Çağlar Sapmaz", url: "https://github.com/caglarsapmaz" },
};

export default function Home() {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main" className="flex-1">
        <Workspace />
        <How />
        <Privacy />
      </main>
      <Footer />
      <BackToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
