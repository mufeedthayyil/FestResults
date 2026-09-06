import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

const sectionCopy: Record<string, { title: string; description: string; action: string }> = {
  teams: { title: "Manage teams", description: "Add houses, assign colours and keep the championship roster current.", action: "Add team" },
  participants: { title: "Manage participants", description: "Search registrations and assign every participant to their house.", action: "Add participant" },
  events: { title: "Manage events", description: "Create individual and team competitions with automatic point rules.", action: "Add event" },
  results: { title: "Manage results", description: "Save drafts, publish winners and keep the public results portal current.", action: "Add result" },
  settings: { title: "Settings", description: "Configure festival details, access and publishing preferences.", action: "Save settings" },
  import: { title: "Import data", description: "Upload a CSV preview before adding teams, participants, events or results.", action: "Choose CSV file" },
};

export default async function AdminSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const content = sectionCopy[section] ?? { title: "Admin workspace", description: "This workspace section is ready for Supabase data.", action: "Get started" };
  return <main className="admin-shell"><aside className="admin-sidebar"><Link className="brand" href="/"><span className="brand-mark">✦</span><span>Auralis <em>26</em></span></Link><p className="admin-label">Workspace</p><nav className="admin-nav"><Link href="/admin">Dashboard</Link><Link href="/admin/teams">Teams</Link><Link href="/admin/participants">Participants</Link><Link href="/admin/events">Events</Link><Link className={section === "results" ? "selected" : ""} href="/admin/results">Results</Link><Link href="/admin/settings">Settings</Link></nav></aside><section className="admin-main"><Link className="text-button" href="/admin"><ArrowLeft size={15} /> Back to dashboard</Link><div className="admin-topbar section-page-heading"><div><p className="eyebrow">Admin workspace</p><h1>{content.title}</h1><p className="section-intro">{content.description}</p></div><Link className="clay-button button-dark" href={`/admin/${section}?action=new`}><Plus size={16} /> {content.action}</Link></div><section className="admin-panel empty-admin-panel"><p className="eyebrow">Ready to connect</p><h2>Your {section} appear here.</h2><p>Connect your Supabase project to load and manage live festival data from this screen.</p></section></section></main>;
}
