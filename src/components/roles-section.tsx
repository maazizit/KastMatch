"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Film, UserRound } from "lucide-react";

const roles = [
  {
    id: "talent",
    href: "/register?role=TALENT",
    icon: UserRound,
    title: "Talent",
    body: "Agents Kast : tests, coach cinéma, pitch — même avatar IA partout.",
    cta: "Créer mon profil talent",
  },
  {
    id: "director",
    href: "/register?role=DIRECTOR",
    icon: Film,
    title: "Réalisateur",
    body: "Dashboard IA : scores de match, analyse vocale & micro-expressions, shortlist.",
    cta: "Publier un casting",
  },
] as const;

export function RolesSection() {
  return (
    <section className="relative border-t border-frame bg-white px-6 py-24 md:px-12">
      <div className="mx-auto max-w-5xl">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="font-display text-sm tracking-[0.35em] text-spot uppercase"
        >
          Deux entrées
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display mt-3 max-w-xl text-3xl tracking-tight text-mist md:text-4xl"
        >
          Une plateforme. Deux métiers. Un match.
        </motion.h2>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {roles.map((role, index) => (
            <motion.article
              key={role.id}
              id={role.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-frame bg-lens p-8 shadow-sm"
            >
              <role.icon className="h-6 w-6 text-spot" strokeWidth={1.5} />
              <h3 className="font-display mt-6 text-2xl text-mist">{role.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist-dim">
                {role.body}
              </p>
              <Link
                href={role.href}
                className="mt-8 inline-block text-sm font-semibold tracking-wide text-spot transition hover:text-[var(--spot-hover)]"
              >
                {role.cta} →
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
