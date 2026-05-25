import { useState, useEffect, useCallback } from "react";

// ── SuperAdminPage ─────────────────────────────────────────────────────────────
// Accessible via ?superadmin in the URL.
// Password = SUPER_ADMIN_PASSWORD env var (plain text, hashed server-side).
export default function SuperAdminPage({ setPage }) {
  const [authed, setAuthed]     = useState(false);
  const [password, setPassword] = useState("");
  const [authErr, setAuthErr]   = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Store password in memory for subsequent API calls
  const [adminPwd, setAdminPwd] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthErr(false);
    try {
      const res = await fetch("/api/super-admin", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.ok) {
        setAdminPwd(password);
        setAuthed(true);
      } else {
        setAuthErr(true);
        setPassword("");
      }
    } catch {
      setAuthErr(true);
    }
    setAuthLoading(false);
  };

  if (!authed) {
    return (
      <div className="bl-admin-login">
        <div className="bl-admin-login-card">
          <div className="bl-admin-login-logo">🏗️</div>
          <h1 className="bl-admin-login-title">Super Admin</h1>
          <p className="bl-admin-login-sub">Gestion de la plateforme Barba Luxe</p>
          <form onSubmit={handleLogin} className="bl-admin-login-form">
            <input
              type="password"
              placeholder="Mot de passe super admin"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`bl-admin-input${authErr ? " error" : ""}`}
              autoFocus
            />
            {authErr && <p className="bl-admin-error">Mot de passe incorrect</p>}
            <button type="submit" className="bl-admin-btn-primary" disabled={authLoading || !password}>
              {authLoading ? "Vérification…" : "Accéder"}
            </button>
          </form>
          <button className="bl-admin-btn-ghost" onClick={() => setPage("home")}>← Retour à la boutique</button>
        </div>
      </div>
    );
  }

  return <SuperAdminDashboard adminPwd={adminPwd} setPage={setPage} />;
}

// ── Dashboard (authenticated) ─────────────────────────────────────────────────
function SuperAdminDashboard({ adminPwd, setPage }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // Create form
  const [creating, setCreating] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPlan, setNewPlan]   = useState("free");
  const [createErr, setCreateErr] = useState("");
  const [createOk, setCreateOk]  = useState(false);

  // Reset password modal
  const [resetDomain, setResetDomain] = useState(null);
  const [resetPwd, setResetPwd] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const headers = {
    "Content-Type":  "application/json",
    "Authorization": `Bearer ${adminPwd}`,
  };

  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/super-admin", { headers });
      const data = await res.json();
      if (res.ok) setTenants(data.tenants || []);
      else setError(data.error || "Erreur de chargement");
    } catch {
      setError("Erreur réseau");
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPwd]);

  useEffect(() => { loadTenants(); }, [loadTenants]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateErr("");
    setCreateOk(false);
    if (!newDomain || !newPassword) { setCreateErr("Domaine et mot de passe requis"); return; }
    try {
      const res = await fetch("/api/super-admin", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action:   "create",
          domain:   newDomain.trim().toLowerCase(),
          password: newPassword,
          config: { plan: newPlan },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateOk(true);
        setNewDomain("");
        setNewPassword("");
        setNewPlan("free");
        setCreating(false);
        loadTenants();
      } else {
        setCreateErr(data.error || "Erreur lors de la création");
      }
    } catch {
      setCreateErr("Erreur réseau");
    }
  };

  const handleSetPlan = async (domain, plan) => {
    try {
      await fetch("/api/super-admin", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "set-plan", domain, plan }),
      });
      loadTenants();
    } catch {}
  };

  const handleDelete = async (domain) => {
    if (!window.confirm(`Supprimer le tenant "${domain}" ? Cette action est irréversible.`)) return;
    try {
      await fetch("/api/super-admin", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "delete", domain }),
      });
      loadTenants();
    } catch {}
  };

  const handleResetPassword = async () => {
    if (!resetPwd) { setResetMsg("Entrez un mot de passe"); return; }
    try {
      const res = await fetch("/api/super-admin", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "reset-password", domain: resetDomain, password: resetPwd }),
      });
      if (res.ok) { setResetMsg("Mot de passe mis à jour ✓"); setResetPwd(""); }
      else { const d = await res.json(); setResetMsg(d.error || "Erreur"); }
    } catch {
      setResetMsg("Erreur réseau");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0a06", color: "#f7f2eb", fontFamily: "Georgia, serif" }}>
      {/* Header */}
      <div style={{ background: "#1c1209", borderBottom: "1px solid #3a2a1a", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "22px" }}>🏗️</span>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#c9a96e" }}>Barba <em>Luxe</em> — Super Admin</div>
            <div style={{ fontSize: "12px", color: "rgba(247,242,235,0.45)", marginTop: "2px" }}>Gestion de la plateforme multi-tenant</div>
          </div>
        </div>
        <button onClick={() => setPage("home")} style={{ background: "none", border: "1px solid rgba(201,169,110,0.3)", color: "#c9a96e", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>
          ← Boutique démo
        </button>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Tenants total", value: tenants.length, icon: "🏪" },
            { label: "Plan Pro", value: tenants.filter(t => t.plan === "pro").length, icon: "⭐" },
            { label: "Plan Gratuit", value: tenants.filter(t => t.plan !== "pro").length, icon: "🆓" },
          ].map(s => (
            <div key={s.label} style={{ background: "#1c1209", border: "1px solid #3a2a1a", borderRadius: "10px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "26px", marginBottom: "6px" }}>{s.icon}</div>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "#c9a96e" }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "rgba(247,242,235,0.5)", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Create tenant button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ color: "#c9a96e", fontSize: "18px", margin: 0 }}>Tenants ({tenants.length})</h2>
          <button
            onClick={() => { setCreating(!creating); setCreateErr(""); setCreateOk(false); }}
            style={{ background: creating ? "transparent" : "#c9a96e", color: creating ? "#c9a96e" : "#1c1209", border: "1px solid #c9a96e", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}
          >
            {creating ? "✕ Annuler" : "+ Créer un tenant"}
          </button>
        </div>

        {/* Create form */}
        {creating && (
          <div style={{ background: "#1c1209", border: "1px solid #c9a96e", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
            <h3 style={{ color: "#c9a96e", marginTop: 0, marginBottom: "20px" }}>Nouveau tenant</h3>
            <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", alignItems: "end" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "rgba(247,242,235,0.6)" }}>
                Domaine *
                <input
                  placeholder="ahmed-barber.be"
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  className="bl-admin-input"
                  style={{ marginTop: "4px" }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "rgba(247,242,235,0.6)" }}>
                Mot de passe admin *
                <input
                  type="password"
                  placeholder="Mot de passe client"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="bl-admin-input"
                  style={{ marginTop: "4px" }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "rgba(247,242,235,0.6)" }}>
                Plan
                <select value={newPlan} onChange={e => setNewPlan(e.target.value)} className="bl-admin-input" style={{ marginTop: "4px" }}>
                  <option value="free">Gratuit</option>
                  <option value="pro">Pro</option>
                </select>
              </label>
              <button type="submit" className="bl-admin-btn-primary" style={{ height: "42px" }}>
                Créer
              </button>
            </form>
            {createErr && <p style={{ color: "#e74c3c", marginTop: "12px", fontSize: "13px" }}>{createErr}</p>}
            {createOk  && <p style={{ color: "#2ecc71", marginTop: "12px", fontSize: "13px" }}>✓ Tenant créé avec succès</p>}
          </div>
        )}

        {/* Error */}
        {error && <div style={{ background: "#2d0f0f", border: "1px solid #e74c3c", borderRadius: "8px", padding: "12px 16px", color: "#e74c3c", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}

        {/* Tenant table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "rgba(247,242,235,0.4)" }}>Chargement…</div>
        ) : tenants.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "rgba(247,242,235,0.4)", border: "1px dashed #3a2a1a", borderRadius: "12px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏪</div>
            <p>Aucun tenant créé pour le moment.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {tenants.map(t => (
              <div key={t.domain} style={{ background: "#1c1209", border: "1px solid #3a2a1a", borderRadius: "10px", padding: "20px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
                {/* Info */}
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "15px", color: "#f7f2eb" }}>{t.shopName || t.domain}</span>
                    {t.shopNameItalic && <em style={{ color: "#c9a96e", fontSize: "14px" }}>{t.shopNameItalic}</em>}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(247,242,235,0.45)", marginTop: "4px" }}>
                    🌐 {t.domain} &nbsp;·&nbsp; Créé le {t.createdAt ? new Date(t.createdAt).toLocaleDateString("fr-BE") : "—"}
                  </div>
                </div>

                {/* Plan badge */}
                <div>
                  <span style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    background: t.plan === "pro" ? "rgba(201,169,110,0.2)" : "rgba(247,242,235,0.08)",
                    color:      t.plan === "pro" ? "#c9a96e"               : "rgba(247,242,235,0.5)",
                    border:     `1px solid ${t.plan === "pro" ? "#c9a96e" : "rgba(247,242,235,0.15)"}`,
                  }}>
                    {t.plan === "pro" ? "⭐ Pro" : "Gratuit"}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {t.plan === "pro" ? (
                    <button onClick={() => handleSetPlan(t.domain, "free")} style={{ padding: "6px 12px", fontSize: "12px", background: "transparent", border: "1px solid rgba(247,242,235,0.2)", color: "rgba(247,242,235,0.6)", borderRadius: "6px", cursor: "pointer" }}>
                      Passer Gratuit
                    </button>
                  ) : (
                    <button onClick={() => handleSetPlan(t.domain, "pro")} style={{ padding: "6px 12px", fontSize: "12px", background: "rgba(201,169,110,0.15)", border: "1px solid #c9a96e", color: "#c9a96e", borderRadius: "6px", cursor: "pointer" }}>
                      ⭐ Passer Pro
                    </button>
                  )}
                  <button
                    onClick={() => { setResetDomain(t.domain); setResetMsg(""); setResetPwd(""); }}
                    style={{ padding: "6px 12px", fontSize: "12px", background: "transparent", border: "1px solid rgba(247,242,235,0.2)", color: "rgba(247,242,235,0.6)", borderRadius: "6px", cursor: "pointer" }}
                  >
                    🔑 MDP
                  </button>
                  <button
                    onClick={() => handleDelete(t.domain)}
                    style={{ padding: "6px 12px", fontSize: "12px", background: "transparent", border: "1px solid rgba(231,76,60,0.4)", color: "#e74c3c", borderRadius: "6px", cursor: "pointer" }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset password modal */}
      {resetDomain && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={e => { if (e.target === e.currentTarget) setResetDomain(null); }}>
          <div style={{ background: "#1c1209", border: "1px solid #3a2a1a", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "400px", margin: "16px" }}>
            <h3 style={{ color: "#c9a96e", marginTop: 0 }}>Réinitialiser le mot de passe</h3>
            <p style={{ color: "rgba(247,242,235,0.6)", fontSize: "13px", marginBottom: "20px" }}>Tenant : <strong style={{ color: "#f7f2eb" }}>{resetDomain}</strong></p>
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={resetPwd}
              onChange={e => setResetPwd(e.target.value)}
              className="bl-admin-input"
              style={{ width: "100%", marginBottom: "12px", boxSizing: "border-box" }}
            />
            {resetMsg && <p style={{ fontSize: "13px", color: resetMsg.includes("✓") ? "#2ecc71" : "#e74c3c", margin: "8px 0" }}>{resetMsg}</p>}
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button onClick={handleResetPassword} className="bl-admin-btn-primary" style={{ flex: 1 }}>Confirmer</button>
              <button onClick={() => setResetDomain(null)} className="bl-admin-btn-ghost" style={{ flex: 1 }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
