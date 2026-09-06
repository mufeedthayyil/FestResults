"use client";

import { BarChart3, ClipboardList, LayoutDashboard, LogOut, Settings, ShieldCheck, Users, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const nav = [
  ["Dashboard", LayoutDashboard, "/admin"],
  ["Teams", Users, "/admin/teams"],
  ["Participants", ClipboardList, "/admin/participants"],
  ["Events", BarChart3, "/admin/events"],
  ["Results", Trophy, "/admin/results"],
  ["Settings", Settings, "/admin/settings"],
] as const;

export default function AdminDashboard() {
  const [stats, setStats] = useState({ teams: 0, participants: 0, events: 0, published: 0, drafts: 0 });
  const [recentResults, setRecentResults] = useState<{ event: string; status: string }[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const client = createClient();
      const [teams, participants, events, published, drafts, results] = await Promise.all([
        client.from("teams").select("id", { count: "exact", head: true }).eq("active", true),
        client.from("participants").select("id", { count: "exact", head: true }).eq("active", true),
        client.from("events").select("id", { count: "exact", head: true }).eq("active", true),
        client.from("results").select("id", { count: "exact", head: true }).eq("status", "published"),
        client.from("results").select("id", { count: "exact", head: true }).eq("status", "draft"),
        client.from("results").select("status, events(event_name)").order("created_at", { ascending: false }).limit(3),
      ]);
      setStats({ teams: teams.count ?? 0, participants: participants.count ?? 0, events: events.count ?? 0, published: published.count ?? 0, drafts: drafts.count ?? 0 });
      if (results.data) setRecentResults(results.data.map((result) => ({ event: result.events?.[0]?.event_name ?? "Untitled event", status: result.status })));
    };
    void loadDashboard();
  }, []);

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="brand" href="/"><span className="brand-mark">✦</span><span>Auralis <em>26</em></span></Link>
        <p className="admin-label">Workspace</p>
        <nav className="admin-nav">{nav.map(([label, Icon, href], index) => <Link className={index === 0 ? "selected" : ""} href={href} key={label}><Icon size={17} />{label}</Link>)}</nav>
        <Link className="admin-logout" href="/admin/login"><LogOut size={16} />Log out</Link>
      </aside>
      <section className="admin-main">
        <div className="admin-topbar"><div><p className="eyebrow">Sunday, 08 February 2026</p><h1>Good morning, Mira.</h1></div><Link className="clay-button button-dark" href="/">View public site <ShieldCheck size={16} /></Link></div>
        <div className="admin-stats"><div><span>Teams</span><strong>{stats.teams}</strong><small>Active teams</small></div><div><span>Participants</span><strong>{stats.participants}</strong><small>Across {stats.teams} teams</small></div><div><span>Events</span><strong>{stats.events}</strong><small>Active events</small></div><div><span>Published</span><strong>{stats.published}</strong><small>{stats.drafts} drafts waiting</small></div></div>
        <div className="admin-content-grid"><section className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">Needs attention</p><h2>Recent results</h2></div><Link href="/admin/results">View all</Link></div><div className="activity-list">{recentResults.length > 0 ? recentResults.map((result, index) => <div key={`${result.event}-${index}`}><span className={`activity-dot ${index === 0 ? "coral-dot" : index === 1 ? "sky-dot" : "lilac-dot"}`} /><p><strong>{result.event}</strong> is {result.status}<small>Latest database update</small></p></div>) : <p className="activity-empty">No results have been added yet.</p>}</div></section><section className="admin-panel quick-panel"><p className="eyebrow">Quick actions</p><h2>Keep things moving.</h2><Link href="/admin/results?action=new">+ Add a result <span>↗</span></Link><Link href="/admin/participants?action=new">+ Add a participant <span>↗</span></Link><Link href="/admin/import">Import from CSV <span>↗</span></Link></section></div>
      </section>
    </main>
  );
}
