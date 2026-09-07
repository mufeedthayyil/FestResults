"use client";

import { X, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Option = { id: string; name: string };
type RecordValues = Record<string, string | number | null | undefined>;

type Props = {
  section: string;
  mode: "add" | "edit";
  record?: RecordValues | null;
  onClose: () => void;
  onSaved: () => void;
};

const titles: Record<string, string> = { teams: "team", participants: "participant", events: "event", results: "result" };

function withTimeout<T>(request: PromiseLike<T>, milliseconds = 6000) {
  return Promise.race([
    Promise.resolve(request),
    new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error("The request timed out. Check your Supabase connection and sign-in status.")), milliseconds)),
  ]);
}

export default function AdminRecordModal({ section, mode, record, onClose, onSaved }: Props) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [closing, setClosing] = useState(false);
  const [teams, setTeams] = useState<Option[]>([]);
  const [events, setEvents] = useState<Option[]>([]);
  const [participants, setParticipants] = useState<Option[]>([]);

  async function getAdminCheck() {
    try {
      const client = createClient();
      const { data, error } = await withTimeout(client.auth.getUser());
      if (error || !data.user) return "Your session has expired. Sign in again before saving.";
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : "Unable to verify admin access.";
    }
  }

  useEffect(() => {
    document.body.classList.add("modal-open");
    const loadOptions = async () => {
      const client = createClient();
      const accessError = await getAdminCheck();
      const [teamsResponse, eventsResponse, participantsResponse] = await Promise.all([
        client.from("teams").select("id, name").eq("active", true).order("name"),
        client.from("events").select("id, event_name").eq("active", true).order("event_name"),
        client.from("participants").select("id, full_name").eq("active", true).order("full_name"),
      ]);
      if (accessError) setMessage(accessError);
      if (teamsResponse.error) setMessage(teamsResponse.error.message);
      else if (section === "participants" && !teamsResponse.data?.length) setMessage("No active teams are available. Add or activate a team before adding a participant.");
      if (teamsResponse.data) setTeams(teamsResponse.data);
      if (eventsResponse.data) setEvents(eventsResponse.data.map((item) => ({ id: item.id, name: item.event_name })));
      if (participantsResponse.data) setParticipants(participantsResponse.data.map((item) => ({ id: item.id, name: item.full_name })));
    };
    void loadOptions();
    return () => { document.body.classList.remove("modal-open"); };
  }, [section]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape" && (!dirty || window.confirm("Discard your unsaved changes?"))) onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dirty, onClose]);

  function requestClose() {
    if (!dirty || window.confirm("Discard your unsaved changes?")) {
      setClosing(true);
      window.setTimeout(onClose, 160);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    setMessage("Checking admin access...");
    const accessError = await getAdminCheck();
    if (accessError) { setSaving(false); setMessage(accessError); return; }
    const values = Object.fromEntries(new FormData(form).entries());
    const client = createClient();
    let response: { error: { message: string } | null };
    setMessage("Saving to Supabase...");
    try {
      if (section === "teams") {
        response = mode === "edit" ? await withTimeout(client.from("teams").update({ name: values.name, short_name: values.short_name, description: values.description || null }).eq("id", record?.id)) : await withTimeout(client.from("teams").insert({ name: values.name, short_name: values.short_name, description: values.description || null }));
      } else if (section === "participants") {
        response = mode === "edit" ? await withTimeout(client.from("participants").update({ register_number: values.register_number, full_name: values.full_name, team_id: values.team_id, class_name: values.class_name || null, department: values.department || null }).eq("id", record?.id)) : await withTimeout(client.from("participants").insert({ register_number: values.register_number, full_name: values.full_name, team_id: values.team_id, class_name: values.class_name || null, department: values.department || null }));
      } else if (section === "events") {
        response = mode === "edit" ? await withTimeout(client.from("events").update({ event_name: values.event_name, event_code: values.event_code, category: values.category, event_type: values.event_type, max_participants: values.max_participants ? Number(values.max_participants) : null, points_for_first: Number(values.points_for_first), points_for_second: Number(values.points_for_second), points_for_third: Number(values.points_for_third) }).eq("id", record?.id)) : await withTimeout(client.from("events").insert({ event_name: values.event_name, event_code: values.event_code, category: values.category, event_type: values.event_type, max_participants: values.max_participants ? Number(values.max_participants) : null, points_for_first: Number(values.points_for_first), points_for_second: Number(values.points_for_second), points_for_third: Number(values.points_for_third) }));
      } else {
        if ((values.participant_id && values.team_id) || (!values.participant_id && !values.team_id)) { setSaving(false); setMessage("Choose either a participant or a team."); return; }
        response = mode === "edit" ? await withTimeout(client.from("results").update({ event_id: values.event_id, participant_id: values.participant_id || null, team_id: values.team_id || null, position: Number(values.position), points: Number(values.points), grade: values.grade || null, remarks: values.remarks || null, status: values.status }).eq("id", record?.id)) : await withTimeout(client.from("results").insert({ event_id: values.event_id, participant_id: values.participant_id || null, team_id: values.team_id || null, position: Number(values.position), points: Number(values.points), grade: values.grade || null, remarks: values.remarks || null, status: values.status }));
      }
    } catch (error) {
      setSaving(false);
      setMessage(error instanceof Error ? error.message : "Unable to save this record.");
      return;
    }
    setSaving(false);
    if (response.error) {
      const errorMessage = response.error.message.toLowerCase().includes("row-level security")
        ? "Supabase rejected this save. Apply the authenticated-user RLS migration and check that your session is active."
        : response.error.message;
      setMessage(errorMessage);
      return;
    }
    onSaved();
    onClose();
  }

  const title = `${mode === "edit" ? "Edit" : "Add"} ${titles[section]}`;
  return <div className={`modal-backdrop ${closing ? "modal-backdrop-closing" : ""}`} onMouseDown={(event) => { if (event.target === event.currentTarget) requestClose(); }}><section className={`admin-modal ${closing ? "modal-closing" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><p className="eyebrow">{mode === "edit" ? "Update record" : "New record"}</p><h2 id="modal-title">{title}</h2></div><button className="modal-close" type="button" onClick={requestClose} aria-label="Close dialog"><X size={18} /></button></div><form className="admin-create-form" onChange={() => setDirty(true)} onSubmit={handleSubmit}>
    {section === "teams" && <><label>Team name<input name="name" defaultValue={record?.name as string ?? ""} placeholder="Blue House" required /></label><label>Short name<input name="short_name" defaultValue={record?.short_name as string ?? ""} placeholder="BLU" required /></label><label>Description<textarea name="description" defaultValue={record?.description as string ?? ""} placeholder="A short description" rows={3} /></label></>}
    {section === "participants" && <><label>Register number<input name="register_number" defaultValue={record?.register_number as string ?? ""} placeholder="AR-001" required /></label><label>Full name<input name="full_name" defaultValue={record?.full_name as string ?? ""} placeholder="Participant name" required /></label><label>Team<select name="team_id" defaultValue={record?.team_id as string ?? ""} required><option value="">{teams.length ? "Choose a team" : "No active teams available"}</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label><label>Class<input name="class_name" defaultValue={record?.class_name as string ?? ""} placeholder="Final year" /></label><label>Department<input name="department" defaultValue={record?.department as string ?? ""} placeholder="Department" /></label></>}
    {section === "events" && <><label>Event name<input name="event_name" defaultValue={record?.event_name as string ?? ""} placeholder="Photography" required /></label><label>Event code<input name="event_code" defaultValue={record?.event_code as string ?? ""} placeholder="PHOTO" required /></label><label>Category<input name="category" defaultValue={record?.category as string ?? ""} placeholder="Visual arts" required /></label><label>Event type<select name="event_type" defaultValue={record?.event_type as string ?? "INDIVIDUAL"}><option value="INDIVIDUAL">Individual</option><option value="TEAM">Team</option></select></label><label>Maximum participants<input name="max_participants" defaultValue={record?.max_participants as number ?? ""} type="number" min="1" placeholder="Optional" /></label><div className="form-grid"><label>1st points<input name="points_for_first" defaultValue={record?.points_for_first as number ?? 10} type="number" min="0" required /></label><label>2nd points<input name="points_for_second" defaultValue={record?.points_for_second as number ?? 8} type="number" min="0" required /></label><label>3rd points<input name="points_for_third" defaultValue={record?.points_for_third as number ?? 6} type="number" min="0" required /></label></div></>}
    {section === "results" && <><label>Event<select name="event_id" defaultValue={record?.event_id as string ?? ""} required><option value="">Choose an event</option>{events.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Participant<select name="participant_id" defaultValue={record?.participant_id as string ?? ""}><option value="">No participant</option>{participants.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Team<select name="team_id" defaultValue={record?.team_id as string ?? ""}><option value="">No team</option>{teams.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><div className="form-grid"><label>Position<input name="position" defaultValue={record?.position as number ?? ""} type="number" min="1" max="99" required /></label><label>Points<input name="points" defaultValue={record?.points as number ?? ""} type="number" min="0" required /></label></div><label>Grade<input name="grade" defaultValue={record?.grade as string ?? ""} placeholder="A" /></label><label>Status<select name="status" defaultValue={record?.status as string ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option></select></label><label>Remarks<textarea name="remarks" defaultValue={record?.remarks as string ?? ""} rows={3} placeholder="Optional notes" /></label></>}
    <div className="form-actions"><button className="text-button modal-cancel" type="button" onClick={requestClose}>Cancel</button><button className="clay-button button-dark" type="submit" disabled={saving}><Save size={16} /> {saving ? "Saving..." : `Save ${titles[section]}`}</button></div><p className={`form-message ${message && message !== "Saving..." ? "form-error" : ""}`} role="status">{message}</p>
  </form></section></div>;
}
