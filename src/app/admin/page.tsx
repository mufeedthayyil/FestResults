"use client";

import { BarChart3, ClipboardList, LayoutDashboard, LogOut, Settings, ShieldCheck, Users, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminRecordModal from "./[section]/admin-record-modal";

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
  const [recentActivity, setRecentActivity] = useState<{ label: string; detail: string; type: string }[]>([]);
  const [modalSection, setModalSection] = useState<"participants" | "results" | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      const client = createClient();
      const [teams, participants, events, published, drafts, results, latestParticipants, latestTeams, latestEvents] = await Promise.all([
        client.from("teams").select("id", { count: "exact", head: true }).eq("active", true),
        client.from("participants").select("id", { count: "exact", head: true }).eq("active", true),
        client.from("events").select("id", { count: "exact", head: true }).eq("active", true),
        client.from("results").select("id", { count: "exact", head: true }).eq("status", "published"),
        client.from("results").select("id", { count: "exact", head: true }).eq("status", "draft"),
        client.from("results").select("status, events(event_name)").order("created_at", { ascending: false }).limit(3),
        client.from("participants").select("full_name, register_number, teams(name)").order("created_at", { ascending: false }).limit(2),
        client.from("teams").select("name, short_name").order("created_at", { ascending: false }).limit(2),
        client.from("events").select("event_name, event_code, category").order("created_at", { ascending: false }).limit(2),
      ]);
      setStats({ teams: teams.count ?? 0, participants: participants.count ?? 0, events: events.count ?? 0, published: published.count ?? 0, drafts: drafts.count ?? 0 });
      const activity = [
        ...(latestParticipants.data ?? []).map((participant) => ({ label: participant.full_name, detail: `${participant.register_number} · ${participant.teams?.[0]?.name ?? "Unassigned"}`, type: "participant" })),
        ...(latestTeams.data ?? []).map((team) => ({ label: team.name, detail: `${team.short_name} · New team`, type: "team" })),
        ...(latestEvents.data ?? []).map((event) => ({ label: event.event_name, detail: `${event.event_code} · ${event.category}`, type: "event" })),
        ...(results.data ?? []).map((result) => ({ label: result.events?.[0]?.event_name ?? "Untitled event", detail: `Result ${result.status}`, type: "result" })),
      ];
      setRecentActivity(activity.slice(0, 5));
    };
    void loadDashboard();
  }, [reloadKey]);

  function handleSaved() {
    setModalSection(null);
    setReloadKey((value) => value + 1);
    setNotice("Record added successfully.");
    window.setTimeout(() => setNotice(""), 3000);
  }

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
        <div className="admin-content-grid"><section className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">Needs attention</p><h2>Recent activity</h2></div><Link href="/admin/participants">View records</Link></div><div className="activity-list">{recentActivity.length > 0 ? recentActivity.map((activity, index) => <div key={`${activity.label}-${index}`}><span className={`activity-dot ${index % 3 === 0 ? "coral-dot" : index % 3 === 1 ? "sky-dot" : "lilac-dot"}`} /><p><strong>{activity.label}</strong><small>{activity.detail}</small></p></div>) : <p className="activity-empty">No records have been added yet.</p>}</div></section><section className="admin-panel quick-panel"><p className="eyebrow">Quick actions</p><h2>Keep things moving.</h2><button type="button" onClick={() => setModalSection("results")}>+ Add a result <span>↗</span></button><button type="button" onClick={() => setModalSection("participants")}>+ Add a participant <span>↗</span></button><Link href="/admin/import">Import from CSV <span>↗</span></Link></section></div>
        <div className="admin-content-grid"><section className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">Needs attention</p><h2>Recent activity</h2></div><Link href="/admin/participants">View records</Link></div><div className="activity-list">{recentActivity.length > 0 ? recentActivity.map((activity, index) => <div key={`${activity.label}-${index}`}><span className={`activity-dot ${index % 3 === 0 ? "coral-dot" : index % 3 === 1 ? "sky-dot" : "lilac-dot"}`} /><p><strong>{activity.label}</strong><small>{activity.detail}</small></p></div>) : <p className="activity-empty">No records have been added yet.</p>}</div></section><section className="admin-panel quick-panel"><p className="eyebrow">Quick actions</p><h2>Keep things moving.</h2><button type="button" onClick={() => setModalSection("results")}>+ Add a result <span>↗</span></button><button type="button" onClick={() => setModalSection("participants")}>+ Add a participant <span>↗</span></button><Link href="/admin/import">Import from CSV <span>↗</span></Link></section></div>
        {notice && <div className="success-toast" role="status">{notice}</div>}
        {modalSection && <AdminRecordModal section={modalSection} mode="add" onClose={() => setModalSection(null)} onSaved={handleSaved} />}
      </section>
    </main>
  );
}
