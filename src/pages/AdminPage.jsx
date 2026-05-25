import { useState, useRef } from "react";
import { useTenant, FREE_PRODUCT_LIMIT, resolveImg } from "../contexts/TenantContext.jsx";

const TABS = [
  { id: "identity", icon: "🏪", label: "Identité" },
  { id: "theme",    icon: "🎨", label: "Thème" },
  { id: "products", icon: "📦", label: "Produits" },
  { id: "contact",  icon: "📬", label: "Contact" },
  { id: "shipping", icon: "🚚", label: "Livraison" },
  { id: "password", icon: "🔒", label: "Sécurité" },
  { id: "plan",     icon: "⭐", label: "Abonnement" },
];

// ── Admin Login Screen ────────────────────────────────────────────────────────
function AdminLogin({ onLogin, onBack }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(false);
    const ok = await onLogin(pwd);
    setLoading(false);
    if (!ok) { setErr(true); setPwd(""); }
  };

  return (
    <div className="bl-admin-login">
      <div className="bl-admin-login-card">
        <div className="bl-admin-login-logo">⚙️</div>
        <h1 className="bl-admin-login-title">Panel Admin</h1>
        <p className="bl-admin-login-sub">Accès réservé au propriétaire de la boutique</p>
        <form onSubmit={handleSubmit} className="bl-admin-login-form">
          <input
            type="password"
            placeholder="Mot de passe admin"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            className={`bl-admin-input${err ? " error" : ""}`}
            autoFocus
          />
          {err && <p className="bl-admin-error">Mot de passe incorrect</p>}
          <button type="submit" className="bl-admin-btn-primary" disabled={loading || !pwd}>
            {loading ? "Vérification…" : "Accéder"}
          </button>
        </form>
        <button className="bl-admin-btn-ghost" onClick={onBack}>← Retour à la boutique</button>
        <p className="bl-admin-hint">Mot de passe par défaut : <code>admin</code></p>
      </div>
    </div>
  );
}

// ── Identity Section ──────────────────────────────────────────────────────────
function IdentitySection({ tenant, onSave }) {
  const [form, setForm] = useState({
    shopName:       tenant.shopName,
    shopNameItalic: tenant.shopNameItalic,
    subBrand:       tenant.subBrand,
    tagline_fr:     tenant.tagline?.fr || "",
    tagline_en:     tenant.tagline?.en || "",
    hero_title1_fr: tenant.hero?.title1?.fr || "",
    hero_title1_en: tenant.hero?.title1?.en || "",
    hero_title2_fr: tenant.hero?.title2?.fr || "",
    hero_title2_en: tenant.hero?.title2?.en || "",
    hero_cta_fr:    tenant.hero?.cta?.fr || "",
    hero_cta_en:    tenant.hero?.cta?.en || "",
    logo:           tenant.logo || "",
  });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    onSave({
      shopName:       form.shopName,
      shopNameItalic: form.shopNameItalic,
      subBrand:       form.subBrand,
      logo:           form.logo || null,
      tagline:        { fr: form.tagline_fr, en: form.tagline_en },
      hero: {
        title1: { fr: form.hero_title1_fr, en: form.hero_title1_en },
        title2: { fr: form.hero_title2_fr, en: form.hero_title2_en },
        title3: tenant.hero?.title3,
        cta:    { fr: form.hero_cta_fr,    en: form.hero_cta_en    },
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bl-admin-section">
      <h2 className="bl-admin-section-title">Identité de la boutique</h2>
      <div className="bl-admin-grid">
        <AdminField label="Nom de la boutique" note="Partie normale">
          <input className="bl-admin-input" value={form.shopName} onChange={e => set("shopName", e.target.value)} />
        </AdminField>
        <AdminField label="Nom italique" note="Affiché en italique doré">
          <input className="bl-admin-input" value={form.shopNameItalic} onChange={e => set("shopNameItalic", e.target.value)} />
        </AdminField>
        <AdminField label="Sous-marque" note='Ex : "by ISH"'>
          <input className="bl-admin-input" value={form.subBrand} onChange={e => set("subBrand", e.target.value)} />
        </AdminField>
        <AdminField label="Logo (URL)" note="Optionnel — laissez vide pour le logo texte">
          <input className="bl-admin-input" placeholder="https://..." value={form.logo} onChange={e => set("logo", e.target.value)} />
        </AdminField>
      </div>

      <h3 className="bl-admin-subsection">Accroche principale (tagline)</h3>
      <div className="bl-admin-grid">
        <AdminField label="🇫🇷 Français"><input className="bl-admin-input" value={form.tagline_fr} onChange={e => set("tagline_fr", e.target.value)} /></AdminField>
        <AdminField label="🇬🇧 Anglais"><input className="bl-admin-input" value={form.tagline_en} onChange={e => set("tagline_en", e.target.value)} /></AdminField>
      </div>

      <h3 className="bl-admin-subsection">Texte Hero</h3>
      <div className="bl-admin-grid">
        <AdminField label="Ligne 1 🇫🇷"><input className="bl-admin-input" value={form.hero_title1_fr} onChange={e => set("hero_title1_fr", e.target.value)} /></AdminField>
        <AdminField label="Ligne 1 🇬🇧"><input className="bl-admin-input" value={form.hero_title1_en} onChange={e => set("hero_title1_en", e.target.value)} /></AdminField>
        <AdminField label="Ligne 2 🇫🇷"><input className="bl-admin-input" value={form.hero_title2_fr} onChange={e => set("hero_title2_fr", e.target.value)} /></AdminField>
        <AdminField label="Ligne 2 🇬🇧"><input className="bl-admin-input" value={form.hero_title2_en} onChange={e => set("hero_title2_en", e.target.value)} /></AdminField>
        <AdminField label="Bouton CTA 🇫🇷"><input className="bl-admin-input" value={form.hero_cta_fr} onChange={e => set("hero_cta_fr", e.target.value)} /></AdminField>
        <AdminField label="Bouton CTA 🇬🇧"><input className="bl-admin-input" value={form.hero_cta_en} onChange={e => set("hero_cta_en", e.target.value)} /></AdminField>
      </div>

      <SaveBar onSave={handleSave} saved={saved} />
    </div>
  );
}

// ── Theme Section ─────────────────────────────────────────────────────────────
function ThemeSection({ tenant, onSave }) {
  const [form, setForm] = useState({
    primary: tenant.theme?.primary || "#C9A96E",
    night:   tenant.theme?.night   || "#1C1209",
    cream:   tenant.theme?.cream   || "#F7F2EB",
  });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const PRESETS = [
    { name: "Barba Luxe",  primary: "#C9A96E", night: "#1C1209", cream: "#F7F2EB" },
    { name: "Ocean",       primary: "#4A90D9", night: "#0A1628", cream: "#EFF6FF" },
    { name: "Forest",      primary: "#6BAA6A", night: "#0F1F0E", cream: "#F0F7EE" },
    { name: "Rose",        primary: "#D4728A", night: "#1F0A10", cream: "#FFF0F3" },
    { name: "Slate",       primary: "#8B9EC4", night: "#111827", cream: "#F1F5F9" },
    { name: "Terracotta",  primary: "#C2714F", night: "#1C0E08", cream: "#FDF0EB" },
  ];

  const handleSave = () => {
    onSave({ theme: form });
    // Apply CSS vars immediately
    document.documentElement.style.setProperty("--gold",  form.primary);
    document.documentElement.style.setProperty("--night", form.night);
    document.documentElement.style.setProperty("--cream", form.cream);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bl-admin-section">
      <h2 className="bl-admin-section-title">Thème & Couleurs</h2>
      <p className="bl-admin-desc">Les couleurs sont appliquées à l'ensemble de la boutique en temps réel.</p>

      <h3 className="bl-admin-subsection">Palettes prédéfinies</h3>
      <div className="bl-admin-presets">
        {PRESETS.map(p => (
          <button key={p.name} className="bl-admin-preset" onClick={() => setForm({ primary: p.primary, night: p.night, cream: p.cream })}>
            <div className="bl-admin-preset-swatches">
              <span style={{ background: p.night }}/>
              <span style={{ background: p.primary }}/>
              <span style={{ background: p.cream }}/>
            </div>
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      <h3 className="bl-admin-subsection">Couleurs personnalisées</h3>
      <div className="bl-admin-colors">
        <ColorPicker label="Couleur principale" hint="Accent, boutons, or" value={form.primary} onChange={v => set("primary", v)} />
        <ColorPicker label="Couleur de fond"    hint="Arrière-plan sombre"  value={form.night}   onChange={v => set("night", v)} />
        <ColorPicker label="Couleur claire"     hint="Texte, fond clair"    value={form.cream}   onChange={v => set("cream", v)} />
      </div>

      <div className="bl-admin-preview-bar" style={{ background: form.night, borderColor: form.primary }}>
        <span style={{ fontFamily: "Georgia,serif", color: form.primary, fontSize: "18px" }}>
          {tenant.shopName} <em>{tenant.shopNameItalic}</em>
        </span>
        <span style={{ background: form.primary, color: form.night, padding: "6px 16px", borderRadius: "2px", fontSize: "12px" }}>
          Aperçu bouton
        </span>
      </div>

      <SaveBar onSave={handleSave} saved={saved} />
    </div>
  );
}

// ── Products Section ──────────────────────────────────────────────────────────
function ProductsSection({ tenant, onSave, isPro, productLimit }) {
  const [products, setProducts] = useState(tenant.products || []);
  const [editing, setEditing] = useState(null); // null | "new" | product id
  const [saved, setSaved] = useState(false);

  const canAdd = products.length < productLimit;

  const handleSave = () => {
    onSave({ products });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteProduct = (id) => {
    if (!confirm("Supprimer ce produit ?")) return;
    setProducts(ps => ps.filter(p => p.id !== id));
  };

  const saveProduct = (p) => {
    if (p.id && products.find(x => x.id === p.id)) {
      setProducts(ps => ps.map(x => x.id === p.id ? p : x));
    } else {
      const newP = { ...p, id: Date.now() };
      setProducts(ps => [...ps, newP]);
    }
    setEditing(null);
  };

  if (editing !== null) {
    const prod = editing === "new" ? null : products.find(p => p.id === editing);
    return (
      <div className="bl-admin-section">
        <button className="bl-admin-btn-ghost" style={{ marginBottom: "1.5rem" }} onClick={() => setEditing(null)}>
          ← Retour à la liste
        </button>
        <ProductForm initial={prod} onSave={saveProduct} onCancel={() => setEditing(null)} />
      </div>
    );
  }

  return (
    <div className="bl-admin-section">
      <h2 className="bl-admin-section-title">Produits</h2>
      <div className="bl-admin-plan-bar">
        <span>{products.length} / {isPro ? "∞" : productLimit} produits</span>
        {!isPro && <span className="bl-admin-plan-tag">Plan gratuit</span>}
      </div>

      <div className="bl-admin-product-list">
        {products.map((p, i) => (
          <div key={p.id} className="bl-admin-product-row">
            <div className="bl-admin-product-img-thumb">
              {p.img ? <img src={resolveImg(p.img)} alt={p.name} /> : <span>📦</span>}
            </div>
            <div className="bl-admin-product-info">
              <strong>{p.name}</strong>
              <span>{p.price} €</span>
            </div>
            <div className="bl-admin-product-actions">
              <button className="bl-admin-btn-sm" onClick={() => setEditing(p.id)}>Modifier</button>
              <button className="bl-admin-btn-sm danger" onClick={() => deleteProduct(p.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>

      {canAdd ? (
        <button className="bl-admin-btn-add" onClick={() => setEditing("new")}>+ Ajouter un produit</button>
      ) : (
        <div className="bl-admin-limit-notice">
          Limite de {productLimit} produits atteinte. <strong>Passez en Pro</strong> pour en ajouter plus.
        </div>
      )}

      <SaveBar onSave={handleSave} saved={saved} />
    </div>
  );
}

function ProductForm({ initial, onSave, onCancel }) {
  const empty = { name:"", name_en:"", tagline:"", tagline_en:"", desc:"", desc_en:"", price:"", typeId:"light", type:"Légère", type_en:"Light", scent:"", scent_en:"", img:"" };
  const [form, setForm] = useState(initial || empty);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const TYPE_OPTIONS = [
    { id:"light",      fr:"Légère",      en:"Light"       },
    { id:"nourishing", fr:"Nourrissante", en:"Nourishing"  },
    { id:"intense",    fr:"Intense",      en:"Intense"     },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, price: parseFloat(form.price) || 0, id: initial?.id });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="bl-admin-section-title">{initial ? "Modifier le produit" : "Nouveau produit"}</h2>
      <div className="bl-admin-grid">
        <AdminField label="Nom 🇫🇷" required><input className="bl-admin-input" value={form.name} onChange={e => set("name", e.target.value)} required /></AdminField>
        <AdminField label="Nom 🇬🇧"><input className="bl-admin-input" value={form.name_en} onChange={e => set("name_en", e.target.value)} /></AdminField>
        <AdminField label="Accroche 🇫🇷"><input className="bl-admin-input" value={form.tagline} onChange={e => set("tagline", e.target.value)} /></AdminField>
        <AdminField label="Accroche 🇬🇧"><input className="bl-admin-input" value={form.tagline_en} onChange={e => set("tagline_en", e.target.value)} /></AdminField>
        <AdminField label="Prix (€)" required>
          <input className="bl-admin-input" type="number" min="0" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} required />
        </AdminField>
        <AdminField label="Type">
          <select className="bl-admin-input" value={form.typeId} onChange={e => {
            const opt = TYPE_OPTIONS.find(o => o.id === e.target.value);
            set("typeId", e.target.value); set("type", opt.fr); set("type_en", opt.en);
          }}>
            {TYPE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.fr}</option>)}
          </select>
        </AdminField>
        <AdminField label="Parfum 🇫🇷"><input className="bl-admin-input" value={form.scent} onChange={e => set("scent", e.target.value)} /></AdminField>
        <AdminField label="Parfum 🇬🇧"><input className="bl-admin-input" value={form.scent_en} onChange={e => set("scent_en", e.target.value)} /></AdminField>
      </div>
      <AdminField label="Description 🇫🇷">
        <textarea className="bl-admin-input" rows={3} value={form.desc} onChange={e => set("desc", e.target.value)} />
      </AdminField>
      <AdminField label="Description 🇬🇧">
        <textarea className="bl-admin-input" rows={3} value={form.desc_en} onChange={e => set("desc_en", e.target.value)} />
      </AdminField>
      <AdminField label="Image (URL)" note="URL externe ou laisser vide pour image générée">
        <input className="bl-admin-input" placeholder="https://..." value={form.img} onChange={e => set("img", e.target.value)} />
        {form.img && <img src={resolveImg(form.img)} alt="preview" style={{ marginTop:"8px", height:"80px", objectFit:"cover", borderRadius:"4px" }} />}
      </AdminField>
      <div style={{ display:"flex", gap:"1rem", marginTop:"2rem" }}>
        <button type="submit" className="bl-admin-btn-primary">💾 Enregistrer</button>
        <button type="button" className="bl-admin-btn-ghost" onClick={onCancel}>Annuler</button>
      </div>
    </form>
  );
}

// ── Contact Section ───────────────────────────────────────────────────────────
function ContactSection({ tenant, onSave }) {
  const [form, setForm] = useState({
    email:      tenant.contact?.email || "",
    phone:      tenant.contact?.phone || "",
    address_fr: tenant.contact?.address?.fr || "",
    address_en: tenant.contact?.address?.en || "",
  });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    onSave({ contact: { email: form.email, phone: form.phone, address: { fr: form.address_fr, en: form.address_en } } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bl-admin-section">
      <h2 className="bl-admin-section-title">Informations de contact</h2>
      <div className="bl-admin-grid">
        <AdminField label="Email" required><input className="bl-admin-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} /></AdminField>
        <AdminField label="Téléphone"><input className="bl-admin-input" value={form.phone} onChange={e => set("phone", e.target.value)} /></AdminField>
        <AdminField label="Adresse 🇫🇷"><input className="bl-admin-input" value={form.address_fr} onChange={e => set("address_fr", e.target.value)} /></AdminField>
        <AdminField label="Adresse 🇬🇧"><input className="bl-admin-input" value={form.address_en} onChange={e => set("address_en", e.target.value)} /></AdminField>
      </div>
      <SaveBar onSave={handleSave} saved={saved} />
    </div>
  );
}

// ── Shipping Section ──────────────────────────────────────────────────────────
function ShippingSection({ tenant, onSave }) {
  const [form, setForm] = useState({
    freeThreshold:   tenant.shipping?.freeThreshold ?? 45,
    standard_price:  tenant.shipping?.standard?.price ?? 0,
    standard_fr:     tenant.shipping?.standard?.label?.fr || "Standard (3–5 jours)",
    standard_en:     tenant.shipping?.standard?.label?.en || "Standard (3–5 days)",
    express_price:   tenant.shipping?.express?.price ?? 8.9,
    express_fr:      tenant.shipping?.express?.label?.fr || "Express (1–2 jours)",
    express_en:      tenant.shipping?.express?.label?.en || "Express (1–2 days)",
  });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    onSave({
      shipping: {
        freeThreshold: parseFloat(form.freeThreshold) || 0,
        standard: { price: parseFloat(form.standard_price) || 0, label: { fr: form.standard_fr, en: form.standard_en } },
        express:  { price: parseFloat(form.express_price) || 0,  label: { fr: form.express_fr,  en: form.express_en  } },
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bl-admin-section">
      <h2 className="bl-admin-section-title">Options de livraison</h2>
      <AdminField label="Livraison gratuite dès (€)" note="Mettre 0 pour toujours gratuit">
        <input className="bl-admin-input" type="number" min="0" step="1" value={form.freeThreshold} onChange={e => set("freeThreshold", e.target.value)} />
      </AdminField>

      <h3 className="bl-admin-subsection">Livraison standard</h3>
      <div className="bl-admin-grid">
        <AdminField label="Prix (€) — 0 = gratuit"><input className="bl-admin-input" type="number" min="0" step="0.1" value={form.standard_price} onChange={e => set("standard_price", e.target.value)} /></AdminField>
        <AdminField label="Libellé 🇫🇷"><input className="bl-admin-input" value={form.standard_fr} onChange={e => set("standard_fr", e.target.value)} /></AdminField>
        <AdminField label="Libellé 🇬🇧"><input className="bl-admin-input" value={form.standard_en} onChange={e => set("standard_en", e.target.value)} /></AdminField>
      </div>

      <h3 className="bl-admin-subsection">Livraison express</h3>
      <div className="bl-admin-grid">
        <AdminField label="Prix (€)"><input className="bl-admin-input" type="number" min="0" step="0.1" value={form.express_price} onChange={e => set("express_price", e.target.value)} /></AdminField>
        <AdminField label="Libellé 🇫🇷"><input className="bl-admin-input" value={form.express_fr} onChange={e => set("express_fr", e.target.value)} /></AdminField>
        <AdminField label="Libellé 🇬🇧"><input className="bl-admin-input" value={form.express_en} onChange={e => set("express_en", e.target.value)} /></AdminField>
      </div>
      <SaveBar onSave={handleSave} saved={saved} />
    </div>
  );
}

// ── Password Section ──────────────────────────────────────────────────────────
function PasswordSection({ onSave }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [msg, setMsg] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const sha256 = async (msg) => {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const handleSave = async () => {
    if (form.next !== form.confirm) { setMsg({ type: "error", text: "Les mots de passe ne correspondent pas." }); return; }
    if (form.next.length < 6) { setMsg({ type: "error", text: "Le mot de passe doit faire au moins 6 caractères." }); return; }
    const hash = await sha256(form.next);
    onSave({ adminPasswordHash: hash });
    setMsg({ type: "success", text: "Mot de passe mis à jour." });
    setForm({ current: "", next: "", confirm: "" });
  };

  return (
    <div className="bl-admin-section">
      <h2 className="bl-admin-section-title">Changer le mot de passe admin</h2>
      <div style={{ maxWidth: "420px" }}>
        <AdminField label="Nouveau mot de passe">
          <input className="bl-admin-input" type="password" value={form.next} onChange={e => set("next", e.target.value)} />
        </AdminField>
        <AdminField label="Confirmer">
          <input className="bl-admin-input" type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} />
        </AdminField>
        {msg && <p className={`bl-admin-${msg.type}`}>{msg.text}</p>}
        <button className="bl-admin-btn-primary" onClick={handleSave} disabled={!form.next || !form.confirm}>
          Changer le mot de passe
        </button>
      </div>
    </div>
  );
}

// ── Plan Section ──────────────────────────────────────────────────────────────
function PlanSection({ tenant, isPro, onSave, resetTenant }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId:   tenant.id || "default",
          shopName:   `${tenant.shopName} ${tenant.shopNameItalic}`,
          email:      tenant.contact?.email || "",
          successUrl: window.location.origin,
          cancelUrl:  window.location.origin,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Erreur lors du paiement.");
      }
    } catch (e) {
      setError("Erreur réseau. Vérifiez votre connexion.");
    }
    setLoading(false);
  };

  return (
    <div className="bl-admin-section">
      <h2 className="bl-admin-section-title">Abonnement</h2>

      {isPro && (
        <div className="bl-admin-pro-badge">
          <span>⭐</span>
          <div>
            <strong>Plan Pro actif</strong>
            <p>Produits illimités · Sans publicités · Support prioritaire</p>
          </div>
        </div>
      )}

      <div className="bl-admin-plan-cards">
        <div className={`bl-admin-plan-card${!isPro ? " active" : ""}`}>
          <h3>Gratuit</h3>
          <p className="bl-admin-plan-price">0€ / mois</p>
          <ul>
            <li>✓ Jusqu'à {FREE_PRODUCT_LIMIT} produits</li>
            <li>✓ Panel admin complet</li>
            <li>✓ Paiements Stripe / Mollie</li>
            <li>✗ Publicités dans la boutique</li>
          </ul>
          {!isPro && <span className="bl-admin-plan-badge">Plan actuel</span>}
        </div>
        <div className={`bl-admin-plan-card pro${isPro ? " active" : ""}`}>
          <h3>Pro ⭐</h3>
          <p className="bl-admin-plan-price">29€ / mois</p>
          <ul>
            <li>✓ Produits illimités</li>
            <li>✓ Analytics avancés</li>
            <li>✓ Sans publicités</li>
            <li>✓ Support prioritaire (4h)</li>
          </ul>
          {isPro ? (
            <span className="bl-admin-plan-badge">Plan actuel</span>
          ) : (
            <>
              {error && <p className="bl-admin-error" style={{ marginBottom:"10px" }}>{error}</p>}
              <button className="bl-admin-btn-primary" onClick={handleUpgrade} disabled={loading}>
                {loading ? "Redirection Stripe…" : "Passer en Pro — 29€/mois"}
              </button>
              <p style={{ fontSize:"11px", color:"rgba(247,242,235,0.3)", marginTop:"10px" }}>
                Sans engagement · Annulez à tout moment
              </p>
            </>
          )}
        </div>
      </div>

      <div className="bl-admin-danger-zone">
        <h3>Zone dangereuse</h3>
        <p>Réinitialiser toute la configuration de la boutique aux valeurs par défaut.</p>
        <button className="bl-admin-btn-danger" onClick={() => {
          if (confirm("⚠️ Ceci effacera TOUTE votre configuration. Continuer ?")) resetTenant();
        }}>
          Réinitialiser la boutique
        </button>
      </div>
    </div>
  );
}

// ── Shared components ─────────────────────────────────────────────────────────
function AdminField({ label, note, required, children }) {
  return (
    <div className="bl-admin-field">
      <label className="bl-admin-label">{label}{required && " *"}{note && <span className="bl-admin-note"> — {note}</span>}</label>
      {children}
    </div>
  );
}

function ColorPicker({ label, hint, value, onChange }) {
  return (
    <div className="bl-admin-color-field">
      <label className="bl-admin-label">{label}<span className="bl-admin-note"> — {hint}</span></label>
      <div className="bl-admin-color-row">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="bl-admin-color-input" />
        <input className="bl-admin-input" value={value} onChange={e => onChange(e.target.value)} style={{ flex: 1 }} placeholder="#000000" />
      </div>
    </div>
  );
}

function SaveBar({ onSave, saved }) {
  return (
    <div className="bl-admin-save-bar">
      <button className="bl-admin-btn-primary" onClick={onSave}>
        {saved ? "✓ Enregistré !" : "💾 Enregistrer les modifications"}
      </button>
    </div>
  );
}

// ── Main AdminPage ────────────────────────────────────────────────────────────
export default function AdminPage({ setPage }) {
  const { tenant, saveTenant, resetTenant, isAdmin, adminLogin, adminLogout, isPro, productLimit } = useTenant();
  const [tab, setTab] = useState("identity");

  if (!isAdmin) {
    return <AdminLogin onLogin={adminLogin} onBack={() => setPage("home")} />;
  }

  return (
    <div className="bl-admin">
      {/* Sidebar */}
      <aside className="bl-admin-sidebar">
        <div className="bl-admin-sidebar-logo">
          <span style={{ fontFamily: "Georgia,serif", color: "var(--gold)", fontSize: "18px" }}>
            {tenant.shopName} <em>{tenant.shopNameItalic}</em>
          </span>
          <span style={{ fontSize: "10px", letterSpacing: "0.15em", color: "var(--mid)", textTransform: "uppercase" }}>
            Admin Panel
          </span>
        </div>
        <nav className="bl-admin-nav">
          {TABS.map(t => (
            <button key={t.id} className={`bl-admin-nav-item${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
              <span className="bl-admin-nav-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="bl-admin-sidebar-footer">
          <button className="bl-admin-btn-ghost" onClick={() => { setPage("home"); }}>← Voir la boutique</button>
          <button className="bl-admin-btn-ghost" onClick={adminLogout} style={{ color: "rgba(247,242,235,0.4)" }}>Se déconnecter</button>
        </div>
      </aside>

      {/* Content */}
      <main className="bl-admin-main">
        {tab === "identity" && <IdentitySection tenant={tenant} onSave={saveTenant} />}
        {tab === "theme"    && <ThemeSection tenant={tenant} onSave={saveTenant} />}
        {tab === "products" && <ProductsSection tenant={tenant} onSave={saveTenant} isPro={isPro} productLimit={productLimit} />}
        {tab === "contact"  && <ContactSection tenant={tenant} onSave={saveTenant} />}
        {tab === "shipping" && <ShippingSection tenant={tenant} onSave={saveTenant} />}
        {tab === "password" && <PasswordSection onSave={saveTenant} />}
        {tab === "plan"     && <PlanSection tenant={tenant} isPro={isPro} onSave={saveTenant} resetTenant={resetTenant} />}
      </main>
    </div>
  );
}
