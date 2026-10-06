"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Portrait } from "./portrait";
import { cn } from "@/lib/cn";

const roles = [
  {
    id: "talent",
    href: "/register?role=TALENT",
    kicker: "Acte I",
    title: "Talent",
    body: "Agents Kast : tests, coach cinéma, pitch — même avatar IA partout.",
    cta: "Créer mon profil talent",
    tone: "gold",
    glow: "from-[#e3c27d33]",
  },
  {
    id: "director",
    href: "/register?role=DIRECTOR",
    kicker: "Acte II",
    title: "Réalisateur",
    body: "Dashboard IA : scores de match, analyse vocale & micro-expressions, shortlist.",
    cta: "Publier un casting",
    tone: "teal",
    glow: "from-[#4fd1b833]",
  },
] as const;

export function RolesSection() {
  const [active, setActive] = useState<string>("talent");

  return (
    <section className="relative bg-background px-6 py-28 md:px-14">
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="font-mono text-[11px] tracking-[0.4em] text-gold uppercase"
        >
          Deux entrées
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.05 }}
          className="font-display mt-4 max-w-3xl text-5xl leading-[0.98] font-light tracking-tight text-mist md:text-7xl"
        >
          Une plateforme. Deux métiers. <em className="text-gradient-spot italic">Un match.</em>
        </motion.h2>

        <div className="mt-16 flex flex-col gap-4 md:h-[560px] md:flex-row">
          {roles.map((role) => {
            const on = active === role.id;
            return (
              <motion.article
                key={role.id}
                id={role.id}
                layout
                onMouseEnter={() => setActive(role.id)}
                onFocus={() => setActive(role.id)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8 }}
                style={{ flexGrow: on ? 1.7 : 1, flexBasis: 0 }}
                className="group relative min-h-[420px] overflow-hidden rounded-3xl border border-frame bg-ink-elevated transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                <Portrait
                  tone={role.tone}
                  seed={role.id === "talent" ? 1 : 2}
                  className={cn(
                    "absolute inset-0 h-full w-full scale-105 transition duration-700",
                    on ? "scale-100 opacity-100 saturate-100" : "opacity-45 saturate-0",
                  )}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${role.glow} via-transparent to-transparent`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-8 md:p-10">
                  <p className="font-mono text-[11px] tracking-[0.35em] text-spot uppercase">{role.kicker}</p>
                  <h3 className="font-display mt-2 text-5xl font-light text-mist md:text-7xl">{role.title}</h3>
                  <div
                    className={cn(
                      "grid transition-all duration-700",
                      on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 md:opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist/80 md:text-base">{role.body}</p>
                      <Link
                        href={role.href}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-mist px-6 py-3 text-sm font-semibold text-ink transition hover:bg-spot hover:text-white"
                      >
                        {role.cta}
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
