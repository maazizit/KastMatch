import { SiteNav } from "@/components/site-nav";
import { CastingDashboard } from "@/components/casting-dashboard";
import { AuthGate } from "@/components/auth-gate";

export default function DirectorDashboardPage() {
  return (
    <div className="cinema-stage min-h-[100svh]">
      <SiteNav />
      <AuthGate role="DIRECTOR">
        <CastingDashboard />
      </AuthGate>
    </div>
  );
}
