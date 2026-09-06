"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Row = Record<string, string | number | null>;

const sectionLabels: Record<string, string[]> = {
  teams: ["Team", "Short name", "Status"],
  participants: ["Register number", "Participant", "Team"],
  events: ["Event", "Code", "Category"],
  results: ["Event", "Result", "Status"],
};

export default function SectionList({ section, reloadKey, onEdit }: { section: string; reloadKey: number; onEdit: (record: Row) => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRows = async () => {
      const client = createClient();
      if (section === "teams") {
        const { data } = await client.from("teams").select("id, name, short_name, active").order("display_order").order("name");
        setRows((data ?? []).map((team) => ({ id: team.id, name: team.name, short_name: team.short_name, first: team.name, second: team.short_name, third: team.active ? "Active" : "Inactive" })));
      } else if (section === "participants") {
        const { data } = await client.from("participants").select("id, register_number, full_name, team_id, class_name, department, teams(name)").order("full_name");
        setRows((data ?? []).map((participant) => ({ id: participant.id, register_number: participant.register_number, full_name: participant.full_name, team_id: participant.team_id, class_name: participant.class_name, department: participant.department, first: participant.register_number, second: participant.full_name, third: participant.teams?.[0]?.name ?? "Unassigned" })));
      } else if (section === "events") {
        const { data } = await client.from("events").select("id, event_name, event_code, category, event_type, max_participants, points_for_first, points_for_second, points_for_third, active").order("event_name");
        setRows((data ?? []).map((event) => ({ id: event.id, event_name: event.event_name, event_code: event.event_code, category: event.category, event_type: event.event_type, max_participants: event.max_participants, points_for_first: event.points_for_first, points_for_second: event.points_for_second, points_for_third: event.points_for_third, first: event.event_name, second: event.event_code, third: event.category, status: event.active ? "Active" : "Inactive" })));
      } else if (section === "results") {
        const { data } = await client.from("results").select("id, event_id, participant_id, team_id, position, points, grade, remarks, status, events(event_name), teams(name), participants(full_name)").order("created_at", { ascending: false });
        setRows((data ?? []).map((result) => ({ id: result.id, event_id: result.event_id, participant_id: result.participant_id, team_id: result.team_id, position: result.position, points: result.points, grade: result.grade, remarks: result.remarks, first: result.events?.[0]?.event_name ?? "Untitled event", second: result.teams?.[0]?.name ?? result.participants?.[0]?.full_name ?? "Unknown", third: `${result.position}${result.position === 1 ? "st" : result.position === 2 ? "nd" : result.position === 3 ? "rd" : "th"} · ${result.points} pts`, status: result.status })));
      }
      setLoading(false);
    };
    void loadRows();
  }, [reloadKey, section]);

  if (!sectionLabels[section]) return null;
  const labels = sectionLabels[section];
  return <section className="admin-panel records-panel"><div className="records-heading"><div><p className="eyebrow">Live records</p><h2>{rows.length} {section}</h2></div><span>{loading ? "Loading..." : `${rows.length} records`}</span></div>{loading ? <p className="records-empty">Loading live data...</p> : rows.length === 0 ? <p className="records-empty">No {section} have been added yet.</p> : <div className="records-table"><div className="records-table-head">{labels.map((label) => <span key={label}>{label}</span>)}<span>Action</span></div>{rows.map((row) => <div className="records-table-row" key={String(row.id)}><strong>{row.first}</strong><span>{row.second}</span><span className={row.status === "Active" || row.status === "published" ? "record-status" : ""}>{row.third}{row.status && row.status !== "Active" ? ` · ${row.status}` : ""}</span><button className="record-edit" type="button" onClick={() => onEdit(row)}>Edit</button></div>)}</div>}</section>;
}