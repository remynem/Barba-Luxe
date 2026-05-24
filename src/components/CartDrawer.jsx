import { T } from "../data/translations.js";
import { useConfig } from "../data/config.js";

export default function CartDrawer({ open, setOpen, cart, setCart, lang, setPage }) {
  const { config, setPrefillMessage } = useConfig();
  const t = T[lang];

  const updateQty = (id, delta) => {
    setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };
  const remove = (id) => setCart(c => c.filter(i => i.id !== id));
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleContactRedirect = () => {
    const cartLines = cart.map(i =>
      `  • ${i.name} × ${i.qty}  —  ${(i.price * i.qty).toFixed(2)} €`
    ).join("\n");

    const message = lang === "fr"
      ? `Bonjour l'équipe Barba Luxe,\n\nJe suis intéressé(e) par les produits suivants et j'aimerais passer commande :\n\n${cartLines}\n\nTotal estimé : ${total.toFixed(2)} €\n\nPourriez-vous me confirmer la disponibilité de ces articles, les options et délais de livraison, ainsi que les modalités de paiement disponibles ?\n\nJe reste disponible pour tout échange.\n\nMerci d'avance pour votre retour,\nCordialement`
      : `Hello Barba Luxe team,\n\nI'm interested in the following products and would like to place an order:\n\n${cartLines}\n\nEstimated total: ${total.toFixed(2)} €\n\nCould you please confirm the availability of these items, the shipping options and timeframes, as well as the available payment methods?\n\nI'm happy to discuss further at your convenience.\n\nThank you in advance,\nBest regards`;

    setPrefillMessage(message);
    setOpen(false);
    setPage("contact");
    window.scrollTo(0, 0);
  };

  return (
    <>
      <div className={`bl-cart-overlay${open ? " open" : ""}`} onClick={() => setOpen(false)} />
      <div className={`bl-cart-drawer${open ? " open" : ""}`}>
        <div className="bl-cart-head">
          <h3>{t.cart} {cart.length > 0 && `(${cart.reduce((s,i) => s+i.qty, 0)})`}</h3>
          <button className="bl-cart-close" onClick={() => setOpen(false)}>✕</button>
        </div>
        <div className="bl-cart-items">
          {cart.length === 0 && <div className="bl-cart-empty">{t.checkout.empty}</div>}
          {cart.map(item => (
            <div className="bl-cart-item" key={item.id}>
              <img className="bl-cart-item-img" src={item.img} alt={item.name} />
              <div className="bl-cart-item-info">
                <div className="bl-cart-item-name">{item.name}</div>
                <div className="bl-cart-item-price">{item.price} €</div>
                <div className="bl-cart-item-qty">
                  <button className="bl-qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                  <span className="bl-qty-num">{item.qty}</span>
                  <button className="bl-qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                  <button className="bl-cart-remove" onClick={() => remove(item.id)}>
                    {lang === "fr" ? "Retirer" : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="bl-cart-footer">
            <div className="bl-cart-total-row">
              <span className="bl-cart-total-label">{t.checkout.total}</span>
              <span className="bl-cart-total-val">{total.toFixed(2)} €</span>
            </div>

            {config.sections.checkout && (
              <button className="bl-cart-checkout-btn" onClick={() => { setOpen(false); setPage("checkout"); window.scrollTo(0,0); }}>
                {lang === "fr" ? "Commander" : "Checkout"} →
              </button>
            )}

            {!config.sections.checkout && config.sections.contact && (
              <div style={{
                marginTop: "0.75rem",
                padding: "1.1rem 1.25rem",
                background: "rgba(201,169,110,0.07)",
                border: "1px solid rgba(201,169,110,0.22)",
                borderRadius: "4px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.6rem" }}>
                  <span style={{ fontSize: "16px" }}>✉</span>
                  <span style={{ fontFamily: "var(--serif)", fontSize: "14px", color: "var(--gold-light)" }}>
                    {lang === "fr" ? "Commande sur mesure" : "Custom order"}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(247,242,235,0.6)", lineHeight: 1.6, marginBottom: "0.9rem" }}>
                  {lang === "fr"
                    ? "Le paiement en ligne n'est pas encore disponible. Contactez-nous directement — votre sélection sera déjà prête dans le message."
                    : "Online payment is not available yet. Contact us directly — your selection will already be ready in the message."}
                </p>
                <button
                  onClick={handleContactRedirect}
                  style={{
                    width: "100%", padding: "11px",
                    background: "var(--gold)", color: "var(--night)",
                    fontSize: "12px", letterSpacing: "0.07em", textTransform: "uppercase",
                    fontWeight: 500, borderRadius: "2px", border: "none",
                    cursor: "pointer", transition: "background 0.2s",
                  }}
                  onMouseEnter={e => e.target.style.background = "var(--gold-light)"}
                  onMouseLeave={e => e.target.style.background = "var(--gold)"}
                >
                  {lang === "fr" ? "Nous contacter →" : "Contact us →"}
                </button>
              </div>
            )}

            {!config.sections.checkout && !config.sections.contact && (
              <div style={{
                marginTop: "0.75rem", padding: "1rem",
                background: "rgba(247,242,235,0.04)",
                border: "1px solid rgba(201,169,110,0.15)",
                borderRadius: "4px", textAlign: "center",
              }}>
                <p style={{ fontSize: "12px", color: "rgba(247,242,235,0.45)", lineHeight: 1.6 }}>
                  {lang === "fr"
                    ? "La commande en ligne n'est pas disponible pour le moment."
                    : "Online ordering is not available at the moment."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
