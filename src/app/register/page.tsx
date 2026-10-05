import type { Metadata } from "next";
import { RegisterClient } from "./register-client";

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Inscris-toi sur KastMatch en tant que talent ou réalisateur. Matching IA, pitch vidéo et castings.",
  openGraph: {
    title: "Inscription — KastMatch",
    description: "Crée ton compte talent ou réalisateur sur KastMatch.",
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
