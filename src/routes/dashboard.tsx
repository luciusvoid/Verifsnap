import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/DashboardShell";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — VerifSnap Shelby" },
      { name: "description", content: "Save, organize and track your web archives." },
    ],
  }),
  component: DashboardShell,
});
