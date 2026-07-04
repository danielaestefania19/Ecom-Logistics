import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";

// ─── Invite form component ─────────────────────────────────────────────────────
function InviteForm({ session, onSuccess }) {
  const [form, setForm]       = useState({ email: "", full_name: "", company: "", asana_project_id: "", stripe_customer_id: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/admin-invite-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": supabaseAnon,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setSuccess(true);
      setForm({ email: "", full_name: "", company: "", asana_project_id: "", stripe_customer_id: "" });
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-third/30 focus:border-third transition";

  return (
    <form onSubmit={submit} className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-primary font-bold text-base mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 text-third" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
        Invite New Client
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Email <span className="text-red-400">*</span></label>
          <input name="email" type="email" required value={form.email} onChange={handle} placeholder="client@company.com" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
          <input name="full_name" value={form.full_name} onChange={handle} placeholder="Jane Smith" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Company</label>
          <input name="company" value={form.company} onChange={handle} placeholder="Acme LLC" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Asana Project ID <span className="text-gray-400 font-normal">(optional)</span></label>
          <input name="asana_project_id" value={form.asana_project_id} onChange={handle} placeholder="1234567890123456" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Stripe Customer ID <span className="text-gray-400 font-normal">(optional)</span></label>
          <input name="stripe_customer_id" value={form.stripe_customer_id} onChange={handle} placeholder="cus_..." className={inputCls} />
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
          ✓ Invitation sent! The client will receive an email to set their password.
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-primary hover:bg-third text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send Invitation"}
      </button>
    </form>
  );
}

// ─── Edit client modal ──────────────────────────────────────────────────────────
function EditModal({ client, onClose, onSaved }) {
  const [form, setForm]       = useState({ full_name: client.full_name ?? "", company: client.company ?? "", asana_project_id: client.asana_project_id ?? "", stripe_customer_id: client.stripe_customer_id ?? "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.from("clients").update({
      full_name: form.full_name || null,
      company: form.company || null,
      asana_project_id: form.asana_project_id || null,
      stripe_customer_id: form.stripe_customer_id || null,
    }).eq("id", client.id);
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSaved();
    onClose();
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-third/30 focus:border-third transition";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-primary">Edit Client</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <form onSubmit={save} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
            <input name="full_name" value={form.full_name} onChange={handle} className={inputCls} placeholder="Jane Smith" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Company</label>
            <input name="company" value={form.company} onChange={handle} className={inputCls} placeholder="Acme LLC" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Asana Project ID</label>
            <input name="asana_project_id" value={form.asana_project_id} onChange={handle} className={inputCls} placeholder="1234567890123456" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Stripe Customer ID</label>
            <input name="stripe_customer_id" value={form.stripe_customer_id} onChange={handle} className={inputCls} placeholder="cus_..." />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold text-sm py-2.5 rounded-xl hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-third text-white font-semibold text-sm py-2.5 rounded-xl transition disabled:opacity-50">
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Client row ────────────────────────────────────────────────────────────────
function ClientRow({ client, onEdit }) {
  const displayName = client.full_name || client.email?.split("@")[0] || "—";
  return (
    <div className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-100 last:border-0 items-center hover:bg-gray-50 transition">
      <div className="col-span-1">
        <div className="w-8 h-8 rounded-full bg-third/10 flex items-center justify-center text-third font-bold text-sm">
          {displayName[0]?.toUpperCase()}
        </div>
      </div>
      <div className="col-span-3 min-w-0">
        <p className="text-sm font-medium text-primary truncate">{displayName}</p>
        <p className="text-xs text-gray-400 truncate">{client.email}</p>
      </div>
      <div className="col-span-3 min-w-0">
        <p className="text-sm text-gray-600 truncate">{client.company || <span className="text-gray-300">—</span>}</p>
      </div>
      <div className="col-span-2 min-w-0">
        {client.asana_project_id
          ? <span className="text-xs font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded-full">linked</span>
          : <span className="text-xs text-gray-300">not set</span>}
      </div>
      <div className="col-span-2 min-w-0">
        {client.stripe_customer_id
          ? <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">linked</span>
          : <span className="text-xs text-gray-300">not set</span>}
      </div>
      <div className="col-span-1 flex justify-end">
        <button
          onClick={() => onEdit(client)}
          className="text-gray-400 hover:text-third transition"
          title="Edit client"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main Admin component ───────────────────────────────────────────────────────
const Admin = () => {
  const { session, clientProfile } = useAuth();
  const [clients, setClients]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editTarget, setEditTarget] = useState(null);

  // Guard: non-admins see a forbidden message
  if (clientProfile && !clientProfile.is_admin) {
    return (
      <div className="text-center py-20">
        <p className="text-primary font-semibold">Access denied</p>
        <p className="text-gray-400 text-sm mt-1">This page is for admins only.</p>
      </div>
    );
  }

  const fetchClients = useCallback(async () => {
    setLoading(true);
    // Join with auth.users to get email — use a view or RPC
    // For simplicity we fetch clients + look up emails via a secure RPC
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setClients(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <svg className="w-6 h-6 text-third" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Client Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">Invite new clients and manage their integrations.</p>
      </div>

      {/* Invite form */}
      <div className="mb-8">
        <InviteForm session={session} onSuccess={fetchClients} />
      </div>

      {/* Client list */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="col-span-1" />
          <span className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Client</span>
          <span className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Company</span>
          <span className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Asana</span>
          <span className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Stripe</span>
          <div className="col-span-1" />
        </div>

        {loading && (
          <div className="px-5 py-8 text-center text-gray-400 text-sm animate-pulse">Loading clients…</div>
        )}

        {!loading && clients.length === 0 && (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">No clients yet. Send your first invitation above.</div>
        )}

        {!loading && clients.map((c) => (
          <ClientRow key={c.id} client={c} onEdit={setEditTarget} />
        ))}
      </div>

      {/* Edit modal */}
      {editTarget && (
        <EditModal
          client={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={fetchClients}
        />
      )}
    </div>
  );
};

export default Admin;
