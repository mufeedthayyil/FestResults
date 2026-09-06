import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SectionWorkspace from "./section-workspace";

const sectionCopy: Record<string, { title: string; description: string; action: string }> = {
  teams: { title: "Manage teams", description: "Add houses, assign colours and keep the championship roster current.", action: "Add team" },
  participants: { title: "Manage participants", description: "Search registrations and assign every participant to their house.", action: "Add participant" },
  events: { title: "Manage events", description: "Create individual and team competitions with automatic point rules.", action: "Add event" },
  results: { title: "Manage results", description: "Save drafts, publish winners and keep the public results portal current.", action: "Add result" },
  settings: { title: "Settings", description: "Configure festival details, access and publishing preferences.", action: "Save settings" },
  import: { title: "Import data", description: "Upload a CSV preview before adding teams, participants, events or results.", action: "Choose CSV file" },
};

export default async function AdminSection({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<{ action?: string }> }) {
  const { section } = await params;
  const { action } = await searchParams;
  const content = sectionCopy[section] ?? { title: "Admin workspace", description: "This workspace section is ready for Supabase data.", action: "Get started" };
  return <main className="admin-shell"><aside className="admin-sidebar"><Link className="brand" href="/"><span className="brand-mark">✦</span><span>Auralis <em>26</em></span></Link><p className="admin-label">Workspace</p><nav className="admin-nav"><Link href="/admin">Dashboard</Link><Link className={section === "teams" ? "selected" : ""} href="/admin/teams">Teams</Link><Link className={section === "participants" ? "selected" : ""} href="/admin/participants">Participants</Link><Link className={section === "events" ? "selected" : ""} href="/admin/events">Events</Link><Link className={section === "results" ? "selected" : ""} href="/admin/results">Results</Link><Link className={section === "settings" ? "selected" : ""} href="/admin/settings">Settings</Link></nav></aside><section className="admin-main"><Link className="text-button" href="/admin"><ArrowLeft size={15} /> Back to dashboard</Link><div className="admin-topbar section-page-heading"><div><p className="eyebrow">Admin workspace</p><h1>{content.title}</h1><p className="section-intro">{content.description}</p></div></div><SectionWorkspace section={section} action={action} /></section></main>;
}
