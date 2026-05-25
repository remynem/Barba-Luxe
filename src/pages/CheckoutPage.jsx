import { useState, useEffect, useMemo } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripePromise } from "../lib/stripe.js";
import { T } from "../data/translations.js";
import { useConfig } from "../data/config.js";
import { useTenant } from "../contexts/TenantContext.jsx";
import { validateShipping } from "../utils/validators.js";
import CountryCombobox from "../components/CountryCombobox.jsx";
import PhoneInput from "../components/PhoneInput.jsx";
import { getCountryByCode } from "../data/countries.js";

// ─── Sidebar récapitulatif ────────────────────────────────────────────────────
function Sidebar({ cart, shipping, t, lang }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = shipping === "express" ? 8.9 : 0;
  const total = subtotal + shippingCost;
  return (
    <div className="bl-checkout-sidebar">
      <h4>{lang === "fr" ? "Votre commande" : "Your order"}</h4>
      {cart.map(item => (
        <div className="bl-sidebar-item" key={item.id}>
          <img src={item.img} alt={item.name} />
          <div>
            <div className="bl-sidebar-item-name">{item.name}</div>
            <div className="bl-sidebar-item-sub">× {item.qty}</div>
          </div>
          <div className="bl-sidebar-item-price">{(item.price * item.qty).toFixed(2)} €</div>
        </div>
      ))}
      <div className="bl-sidebar-totals">
        <div className="bl-sidebar-row"><span>{t.checkout.subtotal}</span><span>{subtotal.toFixed(2)} €</span></div>
        <div className="bl-sidebar-row"><span>{t.checkout.shipping}</span><span>{shippingCost === 0 ? t.checkout.free : `${shippingCost.toFixed(2)} €`}</span></div>
        <div className="bl-sidebar-row" style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(201,169,110,0.1)" }}>
          <span style={{ fontWeight: 500, color: "var(--cream)" }}>{t.checkout.total}</span>
          <span className="bl-sidebar-total">{total.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
}

// ─── Formulaire Stripe (à l'intérieur du provider <Elements>) ────────────────
function StripePaymentForm({ lang, total, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/?stripe=success",
      },
      redirect: "if_required", // Évite la redirection pour les cartes classiques
    });

    if (error) {
      onError(error.message);
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* PaymentElement gère automatiquement carte, Apple Pay, Google Pay */}
      <div style={{ marginBottom: "1.5rem" }}>
        <PaymentElement options={{
          layout: "tabs",
          appearance: {
            theme: "night",
            variables: {
              colorPrimary: "#C9A96E",
              colorBackground: "#1C1209",
              colorText: "#F7F2EB",
              colorDanger: "#E24B4A",
              fontFamily: "DM Sans, system-ui, sans-serif",
              borderRadius: "2px",
            },
          },
        }} />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="bl-btn-primary"
        style={{ width: "100%", opacity: (!stripe || loading) ? 0.6 : 1 }}
      >
        {loading
          ? (lang === "fr" ? "Traitement en cours…" : "Processing…")
          : `${lang === "fr" ? "Payer" : "Pay"} — ${total.toFixed(2)} €`}
      </button>
    </form>
  );
}

// ─── Méthodes Mollie (Bancontact, Belfius, KBC) ───────────────────────────────
const MOLLIE_METHODS = [
  { id: "bancontact", label: "Bancontact", icon: "🏦" },
  { id: "belfius",    label: "Belfius",    icon: "🔵" },
  { id: "kbc",        label: "KBC / CBC",  icon: "🟢" },
];

function MollieSection({ lang, total, orderData, domain, onError }) {
  const [loading, setLoading] = useState(null);

  const handleMollie = async (method) => {
    setLoading(method);
    try {
      const res  = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "mollie", amount: total, method, orderData, domain }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch { throw new Error(`API ${res.status}: ${text.slice(0, 120)}`); }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        onError(data.error || (lang === "fr" ? "Erreur Mollie" : "Mollie error"));
        setLoading(null);
      }
    } catch (err) {
      onError(err.message);
      setLoading(null);
    }
  };

  return (
    <div>
      <p className="bl-form-label" style={{ marginBottom: "1rem" }}>
        {lang === "fr" ? "Paiement belge" : "Belgian payment"}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {MOLLIE_METHODS.map(m => (
          <button
            key={m.id}
            onClick={() => handleMollie(m.id)}
            disabled={loading !== null}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "14px 20px",
              background: "rgba(247,242,235,0.03)",
              border: "1px solid rgba(201,169,110,0.25)",
              borderRadius: "2px", color: "var(--cream)", fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading && loading !== m.id ? 0.5 : 1,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = "var(--gold)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,169,110,0.25)"; }}
          >
            <span style={{ fontSize: "20px" }}>{m.icon}</span>
            <span style={{ flex: 1, textAlign: "left" }}>{m.label}</span>
            {loading === m.id && <span style={{ fontSize: "12px", color: "var(--gold)" }}>
              {lang === "fr" ? "Redirection…" : "Redirecting…"}
            </span>}
          </button>
        ))}
      </div>
      <p style={{ fontSize: "12px", color: "rgba(247,242,235,0.35)", marginTop: "12px", lineHeight: 1.5 }}>
        {lang === "fr"
          ? "Vous serez redirigé vers la page de paiement sécurisée."
          : "You'll be redirected to the secure payment page."}
      </p>
    </div>
  );
}

// ─── CheckoutPage principal ───────────────────────────────────────────────────
export default function CheckoutPage({ lang, cart, setCart, setPage }) {
  const { config } = useConfig();
  const { tenant, domain } = useTenant();
  // Use tenant's Stripe publishable key if configured, fallback to platform key
  const stripePromise = useMemo(
    () => getStripePromise(tenant?.stripePublishableKey),
    [tenant?.stripePublishableKey]
  );
  const t = T[lang];
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState("standard");
  const [ordered, setOrdered] = useState(false);
  const [orderNum] = useState(() => Math.floor(Math.random() * 90000 + 10000));
  const [paymentError, setPaymentError] = useState("");

  // Formulaire livraison
  const [shipFields, setShipFields] = useState({ firstName: "", lastName: "", address: "", city: "", zip: "", country: "", phone: "", phoneDialCode: "+32" });
  const [shipErrors, setShipErrors] = useState({});

  // Stripe : clientSecret pour initialiser Elements
  const [clientSecret, setClientSecret] = useState(null);
  const [loadingIntent, setLoadingIntent] = useState(false);

  // Tab paiement : "stripe" | "mollie"
  const [payTab, setPayTab] = useState("stripe");

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = shipping === "express" ? 8.9 : 0;
  const total = subtotal + shippingCost;

  const stepStatus = (i) => i < step ? "done" : i === step ? "active" : "pending";

  // Créer le PaymentIntent quand on arrive à l'étape paiement
  useEffect(() => {
    if (step !== 2 || clientSecret || loadingIntent) return;
    setLoadingIntent(true);

    const fullPhone = shipFields.phone
      ? `${shipFields.phoneDialCode} ${shipFields.phone}`.trim()
      : "";

    const metadata = {
      orderNumber: String(orderNum),
      customerName: `${shipFields.firstName} ${shipFields.lastName}`,
      customerEmail: shipFields.email || "",
      customerPhone: fullPhone,
      items: JSON.stringify(cart.map(i => ({ name: i.name, qty: i.qty, price: i.price }))),
      subtotal: String(subtotal),
      shippingCost: String(shippingCost),
      total: String(total),
      shippingAddress: JSON.stringify(shipFields),
    };

    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "stripe", amount: Math.round(total * 100), metadata, domain }),
    })
      .then(async r => {
        const text = await r.text();
        try { return JSON.parse(text); }
        catch { throw new Error(`API ${r.status}: ${text.slice(0, 120)}`); }
      })
      .then(data => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setPaymentError(data.error || "Erreur d'initialisation du paiement");
      })
      .catch(err => setPaymentError(err.message))
      .finally(() => setLoadingIntent(false));
  }, [step]);

  // Vérifier retour Mollie depuis URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mollie") === "success") {
      window.history.replaceState({}, "", "/");
      setOrdered(true);
    }
  }, []);

  if (ordered) {
    return (
      <div className="bl-checkout">
        <div className="bl-checkout-inner">
          <div className="bl-order-success">
            <div className="bl-success-icon">✓</div>
            <h2 className="bl-success-title">{t.checkout.orderSuccess}</h2>
            <p className="bl-success-msg">{t.checkout.orderMsg}</p>
            <p className="bl-success-num">{t.checkout.orderNum}{orderNum}</p>
            <p style={{ fontSize: 13, color: "rgba(247,242,235,0.4)", marginBottom: "1.5rem" }}>
              {lang === "fr"
                ? "Un email de confirmation vous a été envoyé."
                : "A confirmation email has been sent to you."}
            </p>
            <button className="bl-btn-primary" style={{ maxWidth: 260 }} onClick={() => { setCart([]); setPage("products"); window.scrollTo(0,0); }}>
              {t.checkout.continueShopping}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bl-checkout">
      <div className="bl-checkout-inner">

        {/* En-tête + progress */}
        <div className="bl-checkout-header">
          <h1 className="bl-checkout-title">{t.checkout.title}</h1>
          <div className="bl-progress">
            {t.checkout.steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div className="bl-progress-step">
                  <div className={`bl-progress-dot ${stepStatus(i)}`}>{i < step ? "✓" : i + 1}</div>
                  <span className={`bl-progress-label ${stepStatus(i)}`}>{s}</span>
                </div>
                {i < 2 && <div className="bl-progress-line" />}
              </div>
            ))}
          </div>
        </div>

        {/* ── ÉTAPE 0 : Récapitulatif panier ── */}
        {step === 0 && (
          <div className="bl-checkout-layout">
            <div className="bl-checkout-main">
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--gold-light)", marginBottom: "1.5rem" }}>
                {lang === "fr" ? "Récapitulatif" : "Summary"}
              </h3>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "rgba(247,242,235,0.4)" }}>
                  {t.checkout.empty}<br /><br />
                  <button className="bl-btn-primary" style={{ maxWidth: 200 }} onClick={() => { setPage("products"); window.scrollTo(0,0); }}>{t.checkout.browse}</button>
                </div>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: "flex", gap: "1rem", padding: "1rem 0", borderBottom: "1px solid rgba(201,169,110,0.1)" }}>
                      <img src={item.img} alt={item.name} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 2 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, color: "var(--cream)" }}>{item.name}</div>
                        <div style={{ fontSize: 13, color: "rgba(247,242,235,0.45)", marginTop: 2 }}>× {item.qty}</div>
                      </div>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--gold-light)" }}>{(item.price * item.qty).toFixed(2)} €</div>
                    </div>
                  ))}
                  <div className="bl-checkout-btns">
                    <button className="bl-btn-primary" onClick={() => setStep(1)}>{t.checkout.continueShipping} →</button>
                  </div>
                </>
              )}
            </div>
            <Sidebar cart={cart} shipping={shipping} t={t} lang={lang} />
          </div>
        )}

        {/* ── ÉTAPE 1 : Livraison ── */}
        {step === 1 && (
          <div className="bl-checkout-layout">
            <div className="bl-checkout-main">
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--gold-light)", marginBottom: "1.5rem" }}>
                {lang === "fr" ? "Livraison" : "Shipping"}
              </h3>
              <div className="bl-form-row-2">
                {[
                  { key: "firstName", label: t.checkout.firstName },
                  { key: "lastName",  label: t.checkout.lastName },
                ].map(f => (
                  <div className="bl-form-group" key={f.key}>
                    <label className="bl-form-label">{f.label}</label>
                    <input className="bl-form-input" value={shipFields[f.key]}
                      onChange={e => { setShipFields(s => ({...s, [f.key]: e.target.value})); setShipErrors(er => ({...er, [f.key]: undefined})); }}
                      style={shipErrors[f.key] ? { borderColor: "#E24B4A" } : {}} />
                    {shipErrors[f.key] && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {shipErrors[f.key]}</div>}
                  </div>
                ))}
              </div>
              <div className="bl-form-group">
                <label className="bl-form-label">{lang === "fr" ? "Email (pour la confirmation)" : "Email (for confirmation)"}</label>
                <input className="bl-form-input" type="email" value={shipFields.email || ""}
                  onChange={e => setShipFields(s => ({...s, email: e.target.value}))}
                  placeholder={lang === "fr" ? "votre@email.com" : "your@email.com"} />
              </div>
              <div className="bl-form-group">
                <label className="bl-form-label">{t.checkout.address}</label>
                <input className="bl-form-input" value={shipFields.address}
                  onChange={e => { setShipFields(s => ({...s, address: e.target.value})); setShipErrors(er => ({...er, address: undefined})); }}
                  style={shipErrors.address ? { borderColor: "#E24B4A" } : {}} />
                {shipErrors.address && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {shipErrors.address}</div>}
              </div>
              <div className="bl-form-row-2">
                {[
                  { key: "city", label: t.checkout.city },
                  { key: "zip",  label: t.checkout.zip },
                ].map(f => (
                  <div className="bl-form-group" key={f.key}>
                    <label className="bl-form-label">{f.label}</label>
                    <input className="bl-form-input" value={shipFields[f.key]}
                      onChange={e => { setShipFields(s => ({...s, [f.key]: e.target.value})); setShipErrors(er => ({...er, [f.key]: undefined})); }}
                      style={shipErrors[f.key] ? { borderColor: "#E24B4A" } : {}} />
                    {shipErrors[f.key] && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {shipErrors[f.key]}</div>}
                  </div>
                ))}
              </div>
              <div className="bl-form-group">
                <label className="bl-form-label">{t.checkout.country}</label>
                <CountryCombobox
                  value={shipFields.country}
                  lang={lang}
                  error={!!shipErrors.country}
                  onChange={code => {
                    const country = getCountryByCode(code);
                    setShipFields(s => ({
                      ...s,
                      country: code,
                      // Auto-sync dial code when country changes (unless user overrode it)
                      phoneDialCode: country?.dial || s.phoneDialCode,
                    }));
                    setShipErrors(er => ({ ...er, country: undefined }));
                  }}
                />
                {shipErrors.country && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {shipErrors.country}</div>}
              </div>
              <div className="bl-form-group">
                <label className="bl-form-label">
                  {lang === "fr" ? "Téléphone" : "Phone"}
                  <span style={{ color: "rgba(247,242,235,0.35)", fontSize: "11px", marginLeft: "6px" }}>
                    ({lang === "fr" ? "optionnel" : "optional"})
                  </span>
                </label>
                <PhoneInput
                  phone={shipFields.phone}
                  onPhone={val => { setShipFields(s => ({...s, phone: val})); setShipErrors(er => ({...er, phone: undefined})); }}
                  dialCode={shipFields.phoneDialCode}
                  onDialCode={code => setShipFields(s => ({...s, phoneDialCode: code}))}
                  lang={lang}
                  error={!!shipErrors.phone}
                />
                {shipErrors.phone && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {shipErrors.phone}</div>}
              </div>

              {/* Méthode de livraison */}
              <div style={{ marginTop: "1.5rem" }}>
                <label className="bl-form-label" style={{ marginBottom: "1rem", display: "block" }}>
                  {lang === "fr" ? "Mode de livraison" : "Shipping method"}
                </label>
                {t.checkout.shippingOptions.map(opt => (
                  <div key={opt.id} className={`bl-shipping-option${shipping === opt.id ? " selected" : ""}`} onClick={() => setShipping(opt.id)}>
                    <input type="radio" readOnly checked={shipping === opt.id} />
                    <span className="bl-shipping-option-label">{opt.label}</span>
                    <span className="bl-shipping-option-price">{opt.price === 0 ? t.checkout.free : `+${opt.price.toFixed(2)} €`}</span>
                  </div>
                ))}
              </div>

              <div className="bl-checkout-btns">
                <button className="bl-btn-back" onClick={() => setStep(0)}>{t.checkout.backCart}</button>
                <button className="bl-btn-primary" onClick={() => {
                  const errs = validateShipping(shipFields, lang);
                  if (Object.keys(errs).length > 0) { setShipErrors(errs); return; }
                  setStep(2);
                }}>{t.checkout.continuePayment} →</button>
              </div>
            </div>
            <Sidebar cart={cart} shipping={shipping} t={t} lang={lang} />
          </div>
        )}

        {/* ── ÉTAPE 2 : Paiement ── */}
        {step === 2 && (
          <div className="bl-checkout-layout">
            <div className="bl-checkout-main">
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--gold-light)", marginBottom: "1.5rem" }}>
                {lang === "fr" ? "Paiement" : "Payment"}
              </h3>

              {/* Tabs Stripe / Mollie */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
                {[
                  { id: "stripe", label: lang === "fr" ? "💳 Carte / Apple Pay / Google Pay" : "💳 Card / Apple Pay / Google Pay" },
                  { id: "mollie", label: "🏦 Bancontact · Belfius · KBC" },
                ].map(tab => (
                  <button key={tab.id}
                    onClick={() => { setPayTab(tab.id); setPaymentError(""); }}
                    style={{
                      flex: 1, padding: "10px 12px",
                      background: payTab === tab.id ? "rgba(201,169,110,0.12)" : "transparent",
                      border: payTab === tab.id ? "1px solid var(--gold)" : "1px solid rgba(201,169,110,0.2)",
                      borderRadius: "2px", color: payTab === tab.id ? "var(--gold)" : "rgba(247,242,235,0.55)",
                      fontSize: "12px", cursor: "pointer", transition: "all 0.2s",
                      letterSpacing: "0.02em",
                    }}
                  >{tab.label}</button>
                ))}
              </div>

              {/* Erreur paiement */}
              {paymentError && (
                <div style={{ padding: "12px 16px", background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.3)", borderRadius: "2px", color: "#E24B4A", fontSize: "13px", marginBottom: "1.5rem" }}>
                  ⚠ {paymentError}
                </div>
              )}

              {/* Stripe tab */}
              {payTab === "stripe" && (
                loadingIntent ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "rgba(247,242,235,0.4)", fontSize: 14 }}>
                    {lang === "fr" ? "Chargement du paiement…" : "Loading payment…"}
                  </div>
                ) : clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret, locale: lang === "fr" ? "fr" : "en" }}>
                    <StripePaymentForm
                      lang={lang}
                      total={total}
                      onSuccess={() => {
                        // Record order in KV (best-effort — payment already succeeded)
                        if (domain) {
                          fetch("/api/orders", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              domain,
                              order: {
                                orderNumber: String(orderNum),
                                customerName: `${shipFields.firstName} ${shipFields.lastName}`,
                                customerEmail: shipFields.email || "",
                                items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
                                subtotal, shippingCost, total,
                                shippingAddress: shipFields,
                                paymentMethod: "stripe",
                                status: "paid",
                                paidAt: new Date().toISOString(),
                              },
                            }),
                          }).catch(() => {});
                        }
                        setOrdered(true);
                      }}
                      onError={setPaymentError}
                    />
                  </Elements>
                ) : (
                  <div style={{ textAlign: "center", padding: "2rem", color: "rgba(247,242,235,0.4)", fontSize: 14 }}>
                    {lang === "fr" ? "Impossible de charger le paiement." : "Could not load payment."}<br />
                    <small>Vérifiez la variable VITE_STRIPE_PUBLISHABLE_KEY</small>
                  </div>
                )
              )}

              {/* Mollie tab */}
              {payTab === "mollie" && (
                <MollieSection
                  lang={lang}
                  total={total}
                  domain={domain}
                  orderData={{
                    orderNumber: String(orderNum),
                    customerName: `${shipFields.firstName} ${shipFields.lastName}`,
                    customerEmail: shipFields.email || "",
                    items: JSON.stringify(cart.map(i => ({ name: i.name, qty: i.qty, price: i.price }))),
                    subtotal: String(subtotal),
                    shippingCost: String(shippingCost),
                    shippingAddress: JSON.stringify(shipFields),
                  }}
                  onError={setPaymentError}
                />
              )}

              <div style={{ marginTop: "1.5rem" }}>
                <button className="bl-btn-back" onClick={() => setStep(1)}>{t.checkout.backShipping}</button>
              </div>
            </div>
            <Sidebar cart={cart} shipping={shipping} t={t} lang={lang} />
          </div>
        )}

      </div>
    </div>
  );
}
