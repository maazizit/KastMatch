import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { FinalCta } from "@/components/final-cta";
import { HomeFooter } from "@/components/home-footer";
import { Marquee } from "@/components/marquee";
import { MatchDemo } from "@/components/match-demo";
import { RolesSection } from "@/components/roles-section";
import { TalentReel } from "@/components/talent-reel";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name} — Casting cinéma & matching IA`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${absoluteUrl("/")}/#website`,
      url: absoluteUrl("/"),
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "fr-FR",
      publisher: { "@id": `${absoluteUrl("/")}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${absoluteUrl("/")}/#organization`,
      name: siteConfig.name,
      url: absoluteUrl("/"),
      description: siteConfig.description,
      slogan: siteConfig.tagline,
    },
    {
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: siteConfig.description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
        description: "Private beta",
      },
    },
  ],
};

export default function Home() {
  return (
    <main className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Marquee />
      <RolesSection />
      <MatchDemo />
      <TalentReel />
      <FinalCta />
      <HomeFooter />
    </main>
  );
}
