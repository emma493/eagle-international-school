import React, { useEffect, useState } from "react";
import { apiJson } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

/** Shared by Headmaster (teachers & parents) and Admin (staff + emergency recovery). */
export default function AccountsPage({ roles, title }: { roles: string[]; title: string }) {
  const { showToast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ full_name: "", role: roles[0], email: "", phone: "", password: "" });
  const [filter, setFilter] = useState("");

  const load = () => apiJson("/api/accounts").then((r) => setList(r.accounts)).catch((e) => showToast("error", "Could not load accounts", e.message));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiJson("/api/accounts", { method: "POST", body: JSON.stringify(form) });
      showToast("success", "Account created", form.full_name);
      setForm({ ...form, full_name: "", email: "", phone: "", password: "" }); load();
    } catch (err: any) { showToast("error", "Could not create account", err.message); }
  };
  const reset = async (a: any) => {
    const password = window.prompt(`New password for ${a.full_name} (min 6 characters)`);
    if (!password) return;
    try { await apiJson(`/api/accounts/${a.id}/reset-password`, { method: "POST", body: JSON.stringify({ password }) }); showToast("success", "Password reset", a.full_name); }
    catch (err: any) { showToast("error", "Reset failed", err.message); }
  };
  const toggle = async (a: any) => {
    try { await apiJson(`/api/accounts/${a.id}/active`, { method: "PATCH", body: JSON.stringify({ is_active: !a.is_active }) }); load(); }
    catch (err: any) { showToast("error", "Update failed", err.message); }
  };
  const shown = list.filter((a) => roles.includes(a.role) && (a.full_name + (a.phone || "") + (a.email || "")).toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="p-4 md:p-6"><div className="max-w-4xl mx-auto">
      <h1 className="text-display font-bold text-text-primary mb-6 sentence-case">{title}</h1>
      <form onSubmit={create} className="card p-6 shadow-card mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className="input" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{roles.map((r) => <option key={r}>{r}</option>)}</select>
        <input className="input" placeholder="Phone (024XXXXXXX)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="input" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" type="password" placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn-primary" type="submit">Create account</button>
      </form>
      <div className="card p-6 shadow-card">
        <input className="input" placeholder="Search by name or phone" value={filter} onChange={(e) => setFilter(e.target.value)} />
        {shown.length === 0 ? <p className="text-text-secondary text-sm">No accounts yet.</p> : (
          <table className="w-full text-sm"><thead><tr className="text-left text-text-secondary"><th className="py-2">Name</th><th>Role</th><th>Login</th><th></th></tr></thead>
            <tbody>{shown.map((a) => (
              <tr key={a.id} className="border-t border-divider">
                <td className="py-3">{a.full_name}{!a.is_active && <span className="ml-2 text-alert-red text-xs">disabled</span>}</td>
                <td>{a.role}</td><td>{a.phone || a.email}</td>
                <td className="text-right space-x-2"><button className="btn-secondary h-9 px-3 text-xs" onClick={() => reset(a)}>Reset password</button>
                  <button className="btn-secondary h-9 px-3 text-xs" onClick={() => toggle(a)}>{a.is_active ? "Disable" : "Enable"}</button></td>
              </tr>))}</tbody></table>)}
      </div>
    </div></div>
  );
}
