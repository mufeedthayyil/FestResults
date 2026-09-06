import { BarChart3, ClipboardList, LayoutDashboard, LogOut, Settings, ShieldCheck, Users, Trophy } from "lucide-react";
import Link from "next/link";

const nav = [
  ["Dashboard", LayoutDashboard, "/admin"],
  ["Teams", Users, "/admin/teams"],
  ["Participants", ClipboardList, "/admin/participants"],
  ["Events", BarChart3, "/admin/events"],
  ["Results", Trophy, "/admin/results"],
  ["Settings", Settings, "/admin/settings"],
] as const;

export default function AdminDashboard() {
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
        <div className="admin-stats"><div><span>Teams</span><strong>12</strong><small>+2 this week</small></div><div><span>Participants</span><strong>438</strong><small>Across 12 teams</small></div><div><span>Events</span><strong>56</strong><small>8 categories</small></div><div><span>Published</span><strong>42</strong><small>14 drafts waiting</small></div></div>
        <div className="admin-content-grid"><section className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">Needs attention</p><h2>Recent activity</h2></div><Link href="/admin/results">View all</Link></div><div className="activity-list"><div><span className="activity-dot coral-dot" /><p><strong>Photography</strong> was published by Mira Thomas<small>12 minutes ago</small></p></div><div><span className="activity-dot sky-dot" /><p><strong>3 participants</strong> added to Blue House<small>42 minutes ago</small></p></div><div><span className="activity-dot lilac-dot" /><p><strong>Speech</strong> result saved as draft<small>1 hour ago</small></p></div></div></section><section className="admin-panel quick-panel"><p className="eyebrow">Quick actions</p><h2>Keep things moving.</h2><Link href="/admin/results">+ Add a result <span>↗</span></Link><Link href="/admin/participants">+ Add a participant <span>↗</span></Link><Link href="/admin/import">Import from CSV <span>↗</span></Link></section></div>
      </section>
    </main>
  );
}
