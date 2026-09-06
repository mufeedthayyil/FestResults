"use client";

import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Option = { id: string; name: string };

const formTitles: Record<string, string> = {
  teams: "Add a team",
  participants: "Add a participant",
  events: "Add an event",
  results: "Add a result",
};

export default function AdminCreateForm({ section }: { section: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [teams, setTeams] = useState<Option[]>([]);
  const [events, setEvents] = useState<Option[]>([]);
  const [participants, setParticipants] = useState<Option[]>([]);

  useEffect(() => {
    if (section !== "participants" && section !== "results") return;
    const loadOptions = async () => {
      const client = createClient();
      const [teamsResponse, eventsResponse, participantsResponse] = await Promise.all([
        client.from("teams").select("id, name").eq("active", true).order("name"),
        client.from("events").select("id, event_name").eq("active", true).order("event_name"),
        client.from("participants").select("id, full_name").eq("active", true).order("full_name"),
      ]);
      if (teamsResponse.data) setTeams(teamsResponse.data);
      if (eventsResponse.data) setEvents(eventsResponse.data.map((event) => ({ id: event.id, name: event.event_name })));
      if (participantsResponse.data) setParticipants(participantsResponse.data.map((participant) => ({ id: participant.id, name: participant.full_name })));
    };
    void loadOptions();
  }, [section]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Saving...");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const client = createClient();
    let error: { message: string } | null = null;

    if (section === "teams") {
      ({ error } = await client.from("teams").insert({ name: values.name, short_name: values.short_name, description: values.description || null }));
    } else if (section === "participants") {
      ({ error } = await client.from("participants").insert({ register_number: values.register_number, full_name: values.full_name, team_id: values.team_id, class_name: values.class_name || null, department: values.department || null }));
    } else if (section === "events") {
      ({ error } = await client.from("events").insert({ event_name: values.event_name, event_code: values.event_code, category: values.category, event_type: values.event_type, max_participants: values.max_participants ? Number(values.max_participants) : null, points_for_first: Number(values.points_for_first), points_for_second: Number(values.points_for_second), points_for_third: Number(values.points_for_third) }));
    } else if (section === "results") {
      if ((values.participant_id && values.team_id) || (!values.participant_id && !values.team_id)) {
        setMessage("Choose either a participant or a team.");
        return;
      }
      ({ error } = await client.from("results").insert({ event_id: values.event_id, participant_id: values.participant_id || null, team_id: values.team_id || null, position: Number(values.position), points: Number(values.points), grade: values.grade || null, remarks: values.remarks || null, status: values.status }));
    }

    if (error) { setMessage(error.message); return; }
    router.push(`/admin/${section}`);
    router.refresh();
  }

  if (!formTitles[section]) return null;

  return <section className="admin-panel admin-form-panel"><button className="text-button form-back" type="button" onClick={() => router.push(`/admin/${section}`)}><ArrowLeft size={15} /> Cancel</button><p className="eyebrow">New record</p><h2>{formTitles[section]}</h2><form className="admin-create-form" onSubmit={handleSubmit}>
    {section === "teams" && <><label>Team name<input name="name" placeholder="Blue House" required /></label><label>Short name<input name="short_name" placeholder="BLU" required /></label><label>Description<textarea name="description" placeholder="A short description" rows={3} /></label></>}
    {section === "participants" && <><label>Register number<input name="register_number" placeholder="AR-001" required /></label><label>Full name<input name="full_name" placeholder="Participant name" required /></label><label>Team<select name="team_id" required><option value="">Choose a team</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label><label>Class<input name="class_name" placeholder="Final year" /></label><label>Department<input name="department" placeholder="Department" /></label></>}
    {section === "events" && <><label>Event name<input name="event_name" placeholder="Photography" required /></label><label>Event code<input name="event_code" placeholder="PHOTO" required /></label><label>Category<input name="category" placeholder="Visual arts" required /></label><label>Event type<select name="event_type" defaultValue="INDIVIDUAL"><option value="INDIVIDUAL">Individual</option><option value="TEAM">Team</option></select></label><label>Maximum participants<input name="max_participants" type="number" min="1" placeholder="Optional" /></label><div className="form-grid"><label>1st points<input name="points_for_first" type="number" min="0" defaultValue="10" required /></label><label>2nd points<input name="points_for_second" type="number" min="0" defaultValue="8" required /></label><label>3rd points<input name="points_for_third" type="number" min="0" defaultValue="6" required /></label></div></>}
    {section === "results" && <><label>Event<select name="event_id" required><option value="">Choose an event</option>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</select></label><label>Participant<select name="participant_id"><option value="">No participant</option>{participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.name}</option>)}</select></label><label>Team<select name="team_id"><option value="">No team</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label><div className="form-grid"><label>Position<input name="position" type="number" min="1" max="99" required /></label><label>Points<input name="points" type="number" min="0" required /></label></div><label>Grade<input name="grade" placeholder="A" /></label><label>Status<select name="status" defaultValue="draft"><option value="draft">Draft</option><option value="published">Published</option></select></label><label>Remarks<textarea name="remarks" rows={3} placeholder="Optional notes" /></label></>}
    <div className="form-actions"><button className="clay-button button-dark" type="submit"><Save size={16} /> Save {section.slice(0, -1)}</button><span className="form-message">{message}</span></div>
  </form></section>;
}