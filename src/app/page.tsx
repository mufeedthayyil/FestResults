"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Crown,
  Menu,
  Search,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ResultCard = { id: string; event: string; category: string; subject: string; place: string; points: number; tone: string };
type LeaderboardRow = { rank: number; name: string; points: number; wins: number; tone: string };

const tones = ["coral", "sky", "lilac"];
const leaderboardTones = ["leader-coral", "leader-sky", "leader-lilac", "leader-neutral"];

function PlaceBadge({ place }: { place: string }) {
  return <span className={`place-badge place-${place.toLowerCase().replace("st", "").replace("nd", "").replace("rd", "")}`}>{place}</span>;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"team" | "individual">("team");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({ participants: 0, teams: 0, events: 0, published: 0 });
  const [teamResults, setTeamResults] = useState<ResultCard[]>([]);
  const [individualResults, setIndividualResults] = useState<ResultCard[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const results = activeTab === "team" ? teamResults : individualResults;

  useEffect(() => {
    const loadPublicData = async () => {
      const client = createClient();
      const [teams, participants, events, published, resultRows, leaderboardRows] = await Promise.all([
        client.from("teams").select("id", { count: "exact", head: true }).eq("active", true),
        client.from("participants").select("id", { count: "exact", head: true }).eq("active", true),
        client.from("events").select("id", { count: "exact", head: true }).eq("active", true),
        client.from("results").select("id", { count: "exact", head: true }).eq("status", "published"),
        client.from("results").select("id, position, points, status, events(event_name, category, event_type), teams(name), participants(full_name, register_number)").eq("status", "published").order("created_at", { ascending: false }).limit(6),
        client.from("overall_leaderboard").select("overall_rank, team_name, total_points, first_places").order("overall_rank").limit(6),
      ]);
      setStats({ participants: participants.count ?? 0, teams: teams.count ?? 0, events: events.count ?? 0, published: published.count ?? 0 });
      if (resultRows.data) {
        const mapped = resultRows.data.map((result, index) => ({ id: result.id, event: result.events?.[0]?.event_name ?? "Untitled event", category: result.events?.[0]?.category ?? "Festival", subject: result.events?.[0]?.event_type === "TEAM" ? result.teams?.[0]?.name ?? "Team result" : result.participants?.[0]?.full_name ?? "Participant result", place: `${result.position}${result.position === 1 ? "st" : result.position === 2 ? "nd" : result.position === 3 ? "rd" : "th"}`, points: result.points, tone: tones[index % tones.length] }));
        setTeamResults(mapped.filter((result) => resultRows.data?.find((source) => source.id === result.id)?.events?.[0]?.event_type === "TEAM").slice(0, 3));
        setIndividualResults(mapped.filter((result) => resultRows.data?.find((source) => source.id === result.id)?.events?.[0]?.event_type === "INDIVIDUAL").slice(0, 3));
      }
      if (leaderboardRows.data) setLeaderboard(leaderboardRows.data.map((team, index) => ({ rank: team.overall_rank, name: team.team_name, points: team.total_points, wins: team.first_places, tone: leaderboardTones[index % leaderboardTones.length] })));
    };
    void loadPublicData();
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Auralis Arts Fest home">
          <span className="brand-mark"><Sparkles size={17} strokeWidth={2.4} /></span>
          <span>Auralis <em>26</em></span>
        </a>
        <nav className={menuOpen ? "nav-links nav-open" : "nav-links"}>
          <a className="active" href="#results" onClick={() => setMenuOpen(false)}>Results</a>
          <a href="#championship" onClick={() => setMenuOpen(false)}>Championship</a>
          <a href="#festival" onClick={() => setMenuOpen(false)}>The festival</a>
          <a href="#search" onClick={() => setMenuOpen(false)}>Search</a>
        </nav>
        <div className="header-actions">
          <Link className="admin-link" href="/admin/login">Admin portal <ArrowUpRight size={15} /></Link>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section page-width">
          <div className="hero-copy reveal-up">
            <p className="eyebrow"><span className="eyebrow-dot" /> College arts festival <span className="eyebrow-year">2026</span></p>
            <h1>Make room<br /><span>for brilliance.</span></h1>
            <p className="hero-description">A living archive of the voices, ideas and performances shaping our campus this year.</p>
            <div className="hero-actions">
              <a className="clay-button button-dark" href="#results">Explore results <ArrowUpRight size={17} /></a>
              <a className="text-button" href="#search">Find a participant <Search size={16} /></a>
            </div>
          </div>
          <div className="hero-art reveal-up delay-one" aria-label="Abstract Auralis festival artwork">
            <div className="art-sun" />
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-leaf leaf-one" />
            <div className="art-leaf leaf-two" />
            <span className="art-label">A / 26</span>
            <span className="art-caption">A celebration<br />in full colour</span>
          </div>
        </section>

        <section className="stats-strip page-width reveal-up delay-two" aria-label="Festival statistics">
          <div className="stat-item"><span className="stat-icon coral-icon"><Users size={18} /></span><strong>{stats.participants}</strong><span>participants</span></div>
          <div className="stat-item"><span className="stat-icon sky-icon"><Trophy size={18} /></span><strong>{stats.teams}</strong><span>teams</span></div>
          <div className="stat-item"><span className="stat-icon lilac-icon"><Sparkles size={18} /></span><strong>{stats.events}</strong><span>events</span></div>
          <div className="stat-item"><span className="stat-icon mint-icon"><CalendarDays size={18} /></span><strong>{stats.published}</strong><span>results live</span></div>
        </section>

        <section className="results-section page-width" id="results">
          <div className="section-heading">
            <div><p className="eyebrow">The latest</p><h2>Results, in their<br /><i>best light.</i></h2></div>
            <p className="section-intro">Every result tells a story. Browse the latest wins or search the complete festival record.</p>
          </div>
          <div className="results-toolbar">
            <div className="segmented-control" role="tablist" aria-label="Result type">
              <button className={activeTab === "team" ? "selected" : ""} onClick={() => setActiveTab("team")} role="tab" aria-selected={activeTab === "team"}>Team events</button>
              <button className={activeTab === "individual" ? "selected" : ""} onClick={() => setActiveTab("individual")} role="tab" aria-selected={activeTab === "individual"}>Individual events</button>
            </div>
            <button className="filter-button">This week <ChevronDown size={15} /></button>
          </div>
          <div className="result-grid">
            {results.filter((result) => `${result.event} ${result.subject}`.toLowerCase().includes(query.toLowerCase())).map((result) => (
              <article className={`result-card ${result.tone}`} key={result.event}>
                <div className="result-card-top"><span>{result.category}</span><span className="result-live">Published</span></div>
                <h3>{result.event}</h3>
                <div className="result-card-bottom">
                  <div><small>{activeTab === "team" ? "Team" : "Participant"}</small><strong>{result.subject}</strong></div>
                  <div className="result-place"><PlaceBadge place={result.place} /><strong>{result.points}<small> pts</small></strong></div>
                </div>
              </article>
            ))}
          </div>
          <div className="results-footer"><span>Showing the latest published results</span><a href="#results">View all results <ArrowUpRight size={16} /></a></div>
        </section>

        <section className="search-band" id="search">
          <div className="page-width search-layout">
            <div><p className="eyebrow">Looking for someone?</p><h2>Find your<br /><i>moment.</i></h2></div>
            <div className="search-panel">
              <label htmlFor="participant-search">Search participants or register numbers</label>
              <div className="search-input-wrap"><Search size={19} /><input id="participant-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “Amina” or “AF-2048”" /><span>⌘ K</span></div>
              <p>Search across all published results, teams and events.</p>
            </div>
          </div>
        </section>

        <section className="championship-section page-width" id="championship">
          <div className="section-heading championship-heading"><div><p className="eyebrow">The leaderboard</p><h2>Overall<br /><i>championship.</i></h2></div><a className="text-button" href="#championship">Full leaderboard <ArrowUpRight size={16} /></a></div>
          <div className="leaderboard-card">
            <div className="leaderboard-header"><span>Rank</span><span>House</span><span>Points</span><span>Wins</span></div>
            {leaderboard.map((team) => <div className={`leaderboard-row ${team.tone}`} key={team.name}><strong className="rank">{team.rank === 1 ? <Crown size={17} /> : `0${team.rank}`}</strong><div className="house-name"><span className="house-avatar">{team.name.charAt(0)}</span><strong>{team.name}</strong></div><strong className="house-points">{team.points}<small> pts</small></strong><span className="house-wins">{team.wins} first places</span></div>)}
          </div>
        </section>
      </main>

      <footer className="site-footer page-width" id="festival"><div className="brand"><span className="brand-mark"><Sparkles size={17} /></span><span>Auralis <em>26</em></span></div><p>Annual college arts festival · 14—18 February 2026</p><span className="footer-note">Made for the ones who make.</span></footer>
    </div>
  );
}
