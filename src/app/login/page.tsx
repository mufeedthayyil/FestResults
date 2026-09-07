"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Signing in...");
    const client = createClient();
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) { setMessage(error.message); return; }
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session?.user) { setMessage("Sign-in did not create a valid session."); return; }
    router.push("/admin");
  }
  return <main className="login-shell"><div className="login-art"><Link className="brand" href="/"><span className="brand-mark"><Sparkles size={17} /></span><span>Auralis <em>26</em></span></Link><div><p className="eyebrow">Festival operations</p><h1>Bring every<br /><i>moment</i> to light.</h1></div><span className="login-art-note">Auralis 26 · Festival workspace</span></div><section className="login-form"><p className="eyebrow">Welcome back</p><h2>Sign in to<br /><i>your workspace.</i></h2><form onSubmit={handleSubmit}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@college.edu" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required /></label><button className="clay-button button-dark" type="submit">Sign in <ArrowRight size={17} /></button></form><p className="login-help">{message || "Sign in to create and manage festival records."}</p></section></main>;
}
