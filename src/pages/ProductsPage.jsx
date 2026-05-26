import { useState } from "react";
import { T } from "../data/translations.js";
import { useConfig } from "../data/config.js";
import { useTenant, localizeProducts, getStock } from "../contexts/TenantContext.jsx";
import { useReveal } from "../hooks/useReveal.js";
import AdBanner from "../components/AdBanner.jsx";
import Footer from "../components/Footer.jsx";

// ── Stock status badge ────────────────────────────────────────────────────────
function StockBadge({ stock, lang }) {
  // stock === undefined → product predates inventory system → treat as in stock
  if (stock === undefined || stock === null) return null;
  if (stock === 0) return (
    <div style={{ fontSize:"11px", fontWeight:600, color:"#E24B4A", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"6px" }}>
      {lang === "fr" ? "✗ Rupture de stock" : "✗ Out of stock"}
    </div>
  );
  if (stock <= 3) return (
    <div style={{ fontSize:"11px", fontWeight:600, color:"#E8A020", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"6px" }}>
      {lang === "fr" ? `⚑ Plus que ${stock} en stock` : `⚑ Only ${stock} left in stock`}
    </div>
  );
  return (
    <div style={{ fontSize:"11px", color:"rgba(247,242,235,0.4)", letterSpacing:"0.06em", marginBottom:"6px" }}>
      {lang === "fr" ? "✓ En stock" : "✓ In stock"}
    </div>
  );
}

export default function ProductsPage({ lang, addToCart, setPage }) {
  const { config } = useConfig();
  const { tenant } = useTenant();
  const t = T[lang];
  const [filterId, setFilterId] = useState("all");
  const [added, setAdded] = useState({});
  const [activeViews, setActiveViews] = useState({});
  useReveal();

  // Use tenant products (with localization) or fallback to translation data
  const allProducts = tenant?.products?.length
    ? localizeProducts(tenant.products, lang)
    : t.products.items;

  const filtered = allProducts.filter(p =>
    filterId === "all" ? true : p.typeId === filterId
  );

  const handleAdd = (item) => {
    addToCart(item);
    setAdded(a => ({ ...a, [item.id]: true }));
    setTimeout(() => setAdded(a => ({ ...a, [item.id]: false })), 1800);
  };

  const setView = (itemId, vi) => setActiveViews(v => ({ ...v, [itemId]: vi }));

  return (
    <div className="bl-products-page">
      <div className="bl-products-header">
        <div className="bl-section-tag">Collection</div>
        <h1 className="bl-section-title">{t.products.title}</h1>
        <p className="bl-section-sub">{t.products.subtitle}</p>
        {config.sections.productFilters && <div className="bl-filters">
          {t.products.filters.map(f => (
            <button key={f.id} className={`bl-filter-btn${filterId === f.id ? " active" : ""}`} onClick={() => setFilterId(f.id)}>{f.label}</button>
          ))}
        </div>}
      </div>
      {/* Ad banner — Free plan only, above product grid */}
      <AdBanner slot="products-top" format="horizontal" className="bl-ad-products-top" />

      <div className="bl-products-grid">
        {filtered.map((item, i) => {
          const vi = activeViews[item.id] || 0;
          return (
            <div className="bl-product-card reveal" key={item.id} style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
              <div className="bl-product-img" style={{ position: "relative" }}>
                <img src={item.views ? item.views[vi] : item.img} alt={item.name} style={{ transition: "opacity 0.35s ease" }} />
                <div className="bl-product-badge">{item.type}</div>
                {config.features.productViewToggle && item.views && item.views.length > 1 && (
                  <div style={{ position:"absolute", bottom:"10px", left:"50%", transform:"translateX(-50%)", display:"flex", gap:"6px", alignItems:"center" }}>
                    {item.views.map((_, idx) => (
                      <button key={idx} onClick={() => setView(item.id, idx)} style={{
                        width: vi===idx ? "22px" : "7px", height:"7px",
                        borderRadius: vi===idx ? "4px" : "50%",
                        background: vi===idx ? "var(--gold)" : "rgba(247,242,235,0.4)",
                        border:"none", cursor:"pointer", padding:0,
                        transition:"all 0.25s ease"
                      }} />
                    ))}
                  </div>
                )}
              </div>
              <div className="bl-product-info">
                {(() => {
                  const liveStock = getStock(item.id, tenant);
                  const isOOS = liveStock === 0;
                  return (<>
                    <div className="bl-product-scent">{item.scent}</div>
                    <h3 className="bl-product-name">{item.name}</h3>
                    <p className="bl-product-tagline">{item.tagline}</p>
                    <p className="bl-product-desc">{item.desc}</p>
                    <StockBadge stock={liveStock} lang={lang} />
                    <div className="bl-product-footer">
                      <div className="bl-product-price">{item.price}<span> €</span></div>
                      <button
                        className={`bl-add-btn${added[item.id] ? " added" : ""}${isOOS ? " oos" : ""}`}
                        onClick={() => !isOOS && handleAdd(item)}
                        disabled={isOOS}
                        aria-label={isOOS
                          ? (lang === "fr" ? `${item.name} — rupture de stock` : `${item.name} — out of stock`)
                          : undefined}
                      >
                        {isOOS
                          ? (lang === "fr" ? "Rupture de stock" : "Out of stock")
                          : added[item.id] ? t.products.added : t.products.addCart}
                      </button>
                    </div>
                  </>);
                })()}
              </div>
            </div>
          );
        })}
      </div>
      <Footer lang={lang} setPage={setPage} />
    </div>
  );
}
