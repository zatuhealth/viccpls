import { createFileRoute, redirect } from "@tanstack/react-router";

// Clinic sign-in moved to /admin/clinic; keep the old address working.
export const Route = createFileRoute("/clinic_/login")({
  ssr: false,
  staticData: { sitemap: false },
  beforeLoad: () => {
    throw redirect({ to: "/admin/clinic", replace: true });
  },
  component: () => null,
});
