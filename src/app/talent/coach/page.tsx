import { Suspense } from "react";
import { SiteNav } from "@/components/site-nav";
import { AuthGate } from "@/components/auth-gate";
import { CoachClient } from "./coach-client";

export default function TalentCoachPage() {
  return (
    <div className="cinema-stage min-h-[100svh]">
      <SiteNav />
      <AuthGate role="TALENT">
        <Suspense
          fallback={
            <p className="p-10 text-center text-mist-dim">
              Chargement du coach…
            </p>
          }
        >
          <CoachClient />
        </Suspense>
      </AuthGate>
    </div>
  );
}
