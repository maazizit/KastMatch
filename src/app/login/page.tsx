import type { Metadata } from "next";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connecte-toi à KastMatch pour accéder à ton espace talent ou réalisateur.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Connexion — KastMatch",
    description: "Accède à ton espace casting KastMatch.",
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
