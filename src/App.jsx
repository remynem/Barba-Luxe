import { useState, useEffect, useCallback } from "react";
import { CONFIG, ConfigContext } from "./data/config.js";
import Nav from "./components/Nav.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import DevPanel from "./components/DevPanel.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import StoryPage from "./pages/StoryPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";

export default function App() {
  const [lang, setLang] = useState("fr");
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [config, setConfig] = useState(CONFIG);
  const [prefillMessage, setPrefillMessage] = useState("");

  const addToCart = useCallback((item) => {
    setCart(c => {
      const ex = c.find(i => i.id === item.id);
      if (ex) return c.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...item, qty: 1 }];
    });
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const toggleFlag = (group, key) => {
    setConfig(prev => ({
      ...prev,
      [group]: { ...prev[group], [key]: !prev[group][key] }
    }));
  };

  useEffect(() => {
    const pageToSection = {
      products: "products", story: "story",
      contact: "contact", checkout: "checkout",
    };
    const section = pageToSection[page];
    if (section && config.sections[section] === false) {
      setPage("home");
      window.scrollTo(0, 0);
    }
  }, [config, page]);

  return (
    <ConfigContext.Provider value={{ config, toggleFlag, prefillMessage, setPrefillMessage }}>
      <div className="bl-app">
        <Nav page={page} setPage={setPage} lang={lang} setLang={setLang} cartCount={cartCount} setCartOpen={setCartOpen} />
        {config.sections.cartDrawer && (
          <CartDrawer open={cartOpen} setOpen={setCartOpen} cart={cart} setCart={setCart} lang={lang} setPage={setPage} />
        )}
        {page === "home" && <HomePage setPage={setPage} lang={lang} />}
        {page === "products" && config.sections.products && <ProductsPage lang={lang} addToCart={addToCart} />}
        {page === "story"    && config.sections.story    && <StoryPage lang={lang} setPage={setPage} />}
        {page === "contact"  && config.sections.contact  && <ContactPage lang={lang} setPage={setPage} />}
        {page === "checkout" && config.sections.checkout && <CheckoutPage lang={lang} cart={cart} setCart={setCart} setPage={setPage} />}
        <DevPanel />
      </div>
    </ConfigContext.Provider>
  );
}
