import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/hero";
import { FinalCta } from "@/components/final-cta";
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
      <footer className="border-t border-frame bg-ink-elevated px-6 py-10 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 text-xs tracking-[0.25em] text-mist-dim uppercase sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-mist normal-case tracking-normal">
            Kast<span className="text-spot">Match</span>
          </p>
          <nav className="flex flex-wrap gap-4 normal-case tracking-normal">
            <Link href="/login" className="hover:text-spot">
              Connexion
            </Link>
            <Link href="/register" className="hover:text-spot">
              Inscription
            </Link>
            <Link href="/register?role=TALENT" className="hover:text-spot">
              Talent
            </Link>
            <Link href="/register?role=DIRECTOR" className="hover:text-spot">
              Réalisateur
            </Link>
          </nav>
          <p>Casting · Cinema · Private beta</p>
        </div>
      </footer>
    </main>
  );
}
