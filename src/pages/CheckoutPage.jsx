import { useState } from "react";
import { T } from "../data/translations.js";
import { useConfig } from "../data/config.js";
import { validateShipping, validatePayment } from "../utils/validators.js";

function Sidebar({ cart, shipping, t }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = shipping === "express" ? 8.9 : 0;
  const total = subtotal + shippingCost;

  return (
    <div className="bl-checkout-sidebar">
      <h4>{t.checkout ? (t.checkout.total ? (t.nav ? "Votre commande" : "Your order") : "Your order") : "Your order"}</h4>
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

export default function CheckoutPage({ lang, cart, setCart, setPage }) {
  const { config } = useConfig();
  const t = T[lang];
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState("standard");
  const [payMethod, setPayMethod] = useState("card");
  const [ordered, setOrdered] = useState(false);
  const [orderNum] = useState(() => Math.floor(Math.random() * 90000 + 10000));

  const [shipFields, setShipFields] = useState({ firstName: "", lastName: "", address: "", city: "", zip: "", country: "" });
  const [shipErrors, setShipErrors] = useState({});

  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [cardErrors, setCardErrors] = useState({});

  const formatCardNumber = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v) => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d; };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = shipping === "express" ? 8.9 : 0;
  const total = subtotal + shippingCost;

  const stepStatus = (i) => i < step ? "done" : i === step ? "active" : "pending";

  if (ordered) {
    return (
      <div className="bl-checkout">
        <div className="bl-checkout-inner">
          <div className="bl-order-success">
            <div className="bl-success-icon">✓</div>
            <h2 className="bl-success-title">{t.checkout.orderSuccess}</h2>
            <p className="bl-success-msg">{t.checkout.orderMsg}</p>
            <p className="bl-success-num">{t.checkout.orderNum}{orderNum}</p>
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
        <div className="bl-checkout-header">
          <h1 className="bl-checkout-title">{t.checkout.title}</h1>
          <div className="bl-progress">
            {t.checkout.steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <div className="bl-progress-step">
                  <div className={`bl-progress-dot ${stepStatus(i)}`}>{i < step ? "✓" : i + 1}</div>
                  <span className={`bl-progress-label ${stepStatus(i)}`}>{s}</span>
                </div>
                {i < 2 && <div className="bl-progress-line" />}
              </div>
            ))}
          </div>
        </div>

        {step === 0 && (
          <div className="bl-checkout-layout">
            <div className="bl-checkout-main">
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--gold-light)", marginBottom: "1.5rem" }}>
                {lang === "fr" ? "Récapitulatif" : "Summary"}
              </h3>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "rgba(247,242,235,0.4)" }}>
                  {t.checkout.empty}
                  <br /><br />
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
            <Sidebar cart={cart} shipping={shipping} t={t} />
          </div>
        )}

        {step === 1 && (
          <div className="bl-checkout-layout">
            <div className="bl-checkout-main">
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--gold-light)", marginBottom: "1.5rem" }}>
                {lang === "fr" ? "Livraison" : "Shipping"}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="bl-form-group">
                  <label className="bl-form-label">{t.checkout.firstName}</label>
                  <input className="bl-form-input" value={shipFields.firstName}
                    onChange={e => { setShipFields(f => ({...f, firstName: e.target.value})); setShipErrors(er => ({...er, firstName: undefined})); }}
                    style={shipErrors.firstName ? { borderColor: "#E24B4A" } : {}} />
                  {shipErrors.firstName && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {shipErrors.firstName}</div>}
                </div>
                <div className="bl-form-group">
                  <label className="bl-form-label">{t.checkout.lastName}</label>
                  <input className="bl-form-input" value={shipFields.lastName}
                    onChange={e => { setShipFields(f => ({...f, lastName: e.target.value})); setShipErrors(er => ({...er, lastName: undefined})); }}
                    style={shipErrors.lastName ? { borderColor: "#E24B4A" } : {}} />
                  {shipErrors.lastName && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {shipErrors.lastName}</div>}
                </div>
              </div>
              <div className="bl-form-group">
                <label className="bl-form-label">{t.checkout.address}</label>
                <input className="bl-form-input" value={shipFields.address}
                  onChange={e => { setShipFields(f => ({...f, address: e.target.value})); setShipErrors(er => ({...er, address: undefined})); }}
                  style={shipErrors.address ? { borderColor: "#E24B4A" } : {}} />
                {shipErrors.address && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {shipErrors.address}</div>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="bl-form-group">
                  <label className="bl-form-label">{t.checkout.city}</label>
                  <input className="bl-form-input" value={shipFields.city}
                    onChange={e => { setShipFields(f => ({...f, city: e.target.value})); setShipErrors(er => ({...er, city: undefined})); }}
                    style={shipErrors.city ? { borderColor: "#E24B4A" } : {}} />
                  {shipErrors.city && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {shipErrors.city}</div>}
                </div>
                <div className="bl-form-group">
                  <label className="bl-form-label">{t.checkout.zip}</label>
                  <input className="bl-form-input" value={shipFields.zip}
                    onChange={e => { setShipFields(f => ({...f, zip: e.target.value})); setShipErrors(er => ({...er, zip: undefined})); }}
                    style={shipErrors.zip ? { borderColor: "#E24B4A" } : {}} />
                  {shipErrors.zip && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {shipErrors.zip}</div>}
                </div>
              </div>
              <div className="bl-form-group">
                <label className="bl-form-label">{t.checkout.country}</label>
                <input className="bl-form-input" value={shipFields.country}
                  onChange={e => { setShipFields(f => ({...f, country: e.target.value})); setShipErrors(er => ({...er, country: undefined})); }}
                  style={shipErrors.country ? { borderColor: "#E24B4A" } : {}} />
                {shipErrors.country && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {shipErrors.country}</div>}
              </div>
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
                  const errs = validateShipping(shipFields, t);
                  if (Object.keys(errs).length > 0) { setShipErrors(errs); return; }
                  setStep(2);
                }}>{t.checkout.continuePayment} →</button>
              </div>
            </div>
            <Sidebar cart={cart} shipping={shipping} t={t} />
          </div>
        )}

        {step === 2 && (
          <div className="bl-checkout-layout">
            <div className="bl-checkout-main">
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--gold-light)", marginBottom: "1.5rem" }}>
                {lang === "fr" ? "Paiement" : "Payment"}
              </h3>
              <p className="bl-form-label" style={{ marginBottom: "1rem" }}>{t.checkout.payWith}</p>
              <div className="bl-payment-methods">
                {[
                  config.checkout.paymentMethods.card   && { id: "card",   label: "💳 " + (lang === "fr" ? "Carte bancaire" : "Card") },
                  config.checkout.paymentMethods.applePay  && { id: "apple",  label: "⬛ Apple Pay" },
                  config.checkout.paymentMethods.googlePay && { id: "google", label: "G  Google Pay" },
                  config.checkout.paymentMethods.paypal    && { id: "paypal", label: "P  PayPal" },
                ].filter(Boolean).map(m => (
                  <div key={m.id} className={`bl-pay-method${payMethod === m.id ? " selected" : ""}`} onClick={() => { setPayMethod(m.id); setCardErrors({}); }}>
                    {m.label}
                  </div>
                ))}
              </div>

              {payMethod === "card" && (
                <>
                  <div className="bl-form-group">
                    <label className="bl-form-label">{t.checkout.cardName}</label>
                    <input className="bl-form-input"
                      placeholder={lang === "fr" ? "Maxime Devos" : "John Smith"}
                      value={card.name} inputMode="text"
                      onChange={e => { setCard(c => ({...c, name: e.target.value})); setCardErrors(er => ({...er, name: undefined})); }}
                      style={cardErrors.name ? { borderColor: "#E24B4A" } : {}} />
                    {cardErrors.name && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {cardErrors.name}</div>}
                  </div>
                  <div className="bl-form-group">
                    <label className="bl-form-label">{t.checkout.cardNumber}</label>
                    <input className="bl-form-input"
                      placeholder="•••• •••• •••• ••••" maxLength={19} inputMode="numeric"
                      value={card.number}
                      onChange={e => { setCard(c => ({...c, number: formatCardNumber(e.target.value)})); setCardErrors(er => ({...er, number: undefined})); }}
                      style={cardErrors.number ? { borderColor: "#E24B4A" } : {}} />
                    {cardErrors.number && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {cardErrors.number}</div>}
                  </div>
                  <div className="bl-card-row">
                    <div className="bl-form-group">
                      <label className="bl-form-label">{t.checkout.expiry}</label>
                      <input className="bl-form-input"
                        placeholder={t.checkout.expiry} maxLength={5} inputMode="numeric"
                        value={card.expiry}
                        onChange={e => { setCard(c => ({...c, expiry: formatExpiry(e.target.value)})); setCardErrors(er => ({...er, expiry: undefined})); }}
                        style={cardErrors.expiry ? { borderColor: "#E24B4A" } : {}} />
                      {cardErrors.expiry && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {cardErrors.expiry}</div>}
                    </div>
                    <div className="bl-form-group">
                      <label className="bl-form-label">{t.checkout.cvv}</label>
                      <input className="bl-form-input"
                        placeholder="•••" maxLength={3} inputMode="numeric"
                        value={card.cvv}
                        onChange={e => { setCard(c => ({...c, cvv: e.target.value.replace(/\D/g,"")})); setCardErrors(er => ({...er, cvv: undefined})); }}
                        style={cardErrors.cvv ? { borderColor: "#E24B4A" } : {}} />
                      {cardErrors.cvv && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {cardErrors.cvv}</div>}
                    </div>
                  </div>
                </>
              )}

              {(payMethod === "apple" || payMethod === "google" || payMethod === "paypal") && (
                <div style={{ padding: "2rem", textAlign: "center", border: "1px solid rgba(201,169,110,0.15)", borderRadius: 2, color: "rgba(247,242,235,0.5)", fontSize: 14, lineHeight: 1.6 }}>
                  {lang === "fr"
                    ? "Vous serez redirigé vers le service de paiement sécurisé."
                    : "You'll be redirected to the secure payment service."}
                </div>
              )}

              <div className="bl-checkout-btns">
                <button className="bl-btn-back" onClick={() => setStep(1)}>{t.checkout.backShipping}</button>
                <button className="bl-btn-primary" onClick={() => {
                  if (payMethod === "card") {
                    const errs = validatePayment(card, lang);
                    if (Object.keys(errs).length > 0) { setCardErrors(errs); return; }
                  }
                  setOrdered(true);
                }}>{t.checkout.payNow} — {total.toFixed(2)} €</button>
              </div>
            </div>
            <Sidebar cart={cart} shipping={shipping} t={t} />
          </div>
        )}
      </div>
    </div>
  );
}
