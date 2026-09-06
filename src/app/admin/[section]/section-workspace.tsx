"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import AdminRecordModal from "./admin-record-modal";
import SectionList from "./section-list";

type RecordValues = Record<string, string | number | null>;

const actions: Record<string, string> = { teams: "Add team", participants: "Add participant", events: "Add event", results: "Add result" };

export default function SectionWorkspace({ section, action }: { section: string; action?: string }) {
  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: RecordValues | null } | null>(action === "new" ? { mode: "add" } : null);
  const [reloadKey, setReloadKey] = useState(0);
  const [notice, setNotice] = useState("");

  function openAdd() { setModal({ mode: "add" }); }
  function closeModal() { setModal(null); }
  function saved() { setReloadKey((value) => value + 1); setNotice(`${actions[section].replace("Add ", "")} added successfully.`); window.setTimeout(() => setNotice(""), 3000); }

  if (!actions[section]) return <section className="admin-panel empty-admin-panel"><p className="eyebrow">Ready to connect</p><h2>Your {section} appear here.</h2><p>Connect your Supabase project to load and manage live festival data from this screen.</p></section>;
  return <><div className="section-action-row"><button className="clay-button button-dark" type="button" onClick={openAdd}><Plus size={16} /> {actions[section]}</button></div><SectionList section={section} reloadKey={reloadKey} onEdit={(record) => setModal({ mode: "edit", record })} />{notice && <div className="success-toast" role="status">{notice}</div>}{modal && <AdminRecordModal section={section} mode={modal.mode} record={modal.record} onClose={closeModal} onSaved={saved} />}</>;
}
