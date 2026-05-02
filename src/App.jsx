import { useMemo, useState } from "react";
import logo from "./assets/logo-lere.png";
import {
  INSTAGRAM_URL,
  WHATSAPP_NUMBER,
  products,
} from "./data/products.js";

const allOption = "Todos";
const tabs = [
  { id: "inicio", label: "Inicio" },
  { id: "todos", label: "Todos os produtos" },
  { id: "sobre", label: "Sobre" },
  { id: "contato", label: "Contato" },
];

function getUniqueValues(key) {
  return [allOption, ...new Set(products.map((product) => product[key]))];
}

function getUniqueSkills() {
  return [allOption, ...new Set(products.flatMap((product) => product.skills))];
}

function getWhatsAppLink(product) {
  const message = product
    ? product.price === null
      ? `Ola! Tenho interesse no produto: ${product.name}. Poderia me passar o valor, disponibilidade e formas de pagamento?`
      : `Ola! Tenho interesse no produto: ${product.name}, no valor de ${product.formattedPrice}. Poderia me passar mais informacoes?`
    : "Ola! Vim pelo site da LERE Kids e gostaria de conhecer os brinquedos disponiveis.";

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.4 19.6 5.5 16A8.1 8.1 0 1 1 8 18.4l-3.6 1.2Z" />
      <path d="M9.2 8.3c.2-.4.4-.5.8-.5h.6c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.5.6c.7 1.2 1.6 2.1 2.9 2.7l.6-.7c.2-.2.4-.3.7-.2l1.8.8c.3.1.4.3.4.6v.5c0 .4-.1.7-.5.9-.6.3-1.5.5-2.4.2-2.9-.9-5.1-3-6.1-5.9-.3-.8-.1-1.6.2-2Z" />
    </svg>
  );
}

function ProductCard({ product, onDetails, compact = false }) {
  return (
    <article className={`product-card ${compact ? "compact-card" : ""}`}>
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" />
        <span className="product-category">{product.category}</span>
      </div>
      <div className="product-content">
        <div>
          <p className="product-age">{product.ageRange}</p>
          <h3>{product.name}</h3>
          {compact && <p className="product-description">{product.description}</p>}
        </div>
        {compact && (
          <div className="skill-list" aria-label="Habilidades desenvolvidas">
            {product.skills.slice(0, 2).map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        )}
        <div className="product-actions">
          <strong>{product.formattedPrice}</strong>
          <button type="button" className="link-button" onClick={() => onDetails(product)}>
            Ver detalhes
          </button>
        </div>
        <a
          className="primary-button product-buy-button"
          href={getWhatsAppLink(product)}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
      </div>
    </article>
  );
}

function ProductModal({ product, onClose }) {
  if (!product) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar">
          x
        </button>
        <img src={product.image} alt={product.name} className="modal-image" />
        <div className="modal-content">
          <p className="product-age">
            {product.category} / {product.ageRange}
          </p>
          <h2 id="modal-title">{product.name}</h2>
          <strong className="modal-price">{product.formattedPrice}</strong>
          <p>{product.description}</p>
          <dl className="product-details">
            <div>
              <dt>Material</dt>
              <dd>{product.material}</dd>
            </div>
            <div>
              <dt>Desenvolve</dt>
              <dd>{product.skills.join(", ")}</dd>
            </div>
            <div>
              <dt>Recomendado para</dt>
              <dd>{product.recommendedFor.join(", ")}</dd>
            </div>
          </dl>
          <a
            className="primary-button full-button"
            href={getWhatsAppLink(product)}
            target="_blank"
            rel="noreferrer"
          >
            Comprar pelo WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("inicio");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(allOption);
  const [ageRange, setAgeRange] = useState(allOption);
  const [skill, setSkill] = useState(allOption);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = useMemo(() => getUniqueValues("category"), []);
  const ageRanges = useMemo(() => getUniqueValues("ageRange"), []);
  const skills = useMemo(() => getUniqueSkills(), []);
  const featuredProducts = products.filter((product) => product.featured);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.description,
        ...product.skills,
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesCategory = category === allOption || product.category === category;
      const matchesAge = ageRange === allOption || product.ageRange === ageRange;
      const matchesSkill = skill === allOption || product.skills.includes(skill);

      return matchesQuery && matchesCategory && matchesAge && matchesSkill;
    });
  }, [ageRange, category, query, skill]);

  function openTab(tabId) {
    setActiveTab(tabId);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearFilters() {
    setQuery("");
    setCategory(allOption);
    setAgeRange(allOption);
    setSkill(allOption);
  }

  return (
    <>
      <header className="site-header">
        <button type="button" className="brand" onClick={() => openTab("inicio")}>
          <img src={logo} alt="LERE Brinquedos Educativos" />
        </button>
        <button
          type="button"
          className="menu-toggle"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={isMenuOpen ? "open" : ""} aria-label="Navegacao principal">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => openTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <a
          className="secondary-button header-whatsapp"
          href={getWhatsAppLink()}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
      </header>

      <main>
        {activeTab === "inicio" && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">Brinquedos educativos com proposito</span>
                <h1>Aprender brincando, escolher com confianca.</h1>
                <p>
                  Uma vitrine de brinquedos socioeducacionais para familias,
                  escolas e profissionais que valorizam desenvolvimento, afeto
                  e criatividade.
                </p>
                <div className="hero-actions">
                  <button type="button" className="primary-button" onClick={() => openTab("todos")}>
                    Ver todos os produtos
                  </button>
                  <a className="secondary-button" href={getWhatsAppLink()} target="_blank" rel="noreferrer">
                    Falar com a loja
                  </a>
                </div>
              </div>
              <div className="hero-panel" aria-label="Destaque da loja">
                <img src={logo} alt="" className="hero-logo" />
                <div className="brand-colors" aria-label="Cores da marca">
                  <span className="brand-green" />
                  <span className="brand-purple" />
                  <span className="brand-teal" />
                  <span className="brand-pink" />
                  <span className="brand-orange" />
                </div>
                <p>
                  Catalogo importado com produtos reais da LERE Kids. Os valores
                  podem ser consultados direto pelo WhatsApp da loja.
                </p>
              </div>
            </section>

            <section className="home-products" aria-labelledby="home-products-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Destaques</p>
                  <h2 id="home-products-title">Alguns produtos da vitrine</h2>
                </div>
                <button type="button" className="secondary-button" onClick={() => openTab("todos")}>
                  Abrir catalogo completo
                </button>
              </div>
              <div className="product-grid featured-grid">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDetails={setSelectedProduct}
                    compact
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === "todos" && (
          <section className="shop-section" aria-labelledby="products-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Catalogo completo</p>
                <h2 id="products-title">Todos os brinquedos</h2>
              </div>
              <p>
                Use a busca e os filtros para encontrar por nome, idade,
                categoria ou habilidade desenvolvida.
              </p>
            </div>

            <div className="filters" aria-label="Filtros de produtos">
              <label>
                Buscar
                <input
                  type="search"
                  placeholder="Nome, categoria ou habilidade"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <label>
                Categoria
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Idade
                <select value={ageRange} onChange={(event) => setAgeRange(event.target.value)}>
                  {ageRanges.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Habilidade
                <select value={skill} onChange={(event) => setSkill(event.target.value)}>
                  {skills.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <button type="button" className="secondary-button clear-button" onClick={clearFilters}>
                Limpar
              </button>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDetails={setSelectedProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>Nenhum brinquedo encontrado</h3>
                <p>Tente limpar os filtros ou buscar por outra habilidade.</p>
                <button type="button" className="primary-button" onClick={clearFilters}>
                  Limpar filtros
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === "sobre" && (
          <section className="about-section page-section">
            <div>
              <p className="eyebrow">Sobre a loja</p>
              <h2>LERE Kids aproxima brincadeira, educacao e desenvolvimento.</h2>
            </div>
            <div className="about-grid">
              <article>
                <strong>Escolha orientada</strong>
                <p>Cards mostram idade, habilidade e contexto de uso para facilitar a decisao.</p>
              </article>
              <article>
                <strong>Compra conversada</strong>
                <p>O pedido comeca no WhatsApp, com a mensagem do produto ja preenchida.</p>
              </article>
              <article>
                <strong>Catalogo flexivel</strong>
                <p>Os produtos ficam no frontend, simples de editar quando o catalogo real chegar.</p>
              </article>
            </div>
          </section>
        )}

        {activeTab === "contato" && (
          <section className="contact-page page-section">
            <div>
              <p className="eyebrow">Contato</p>
              <h2>Gostou de algum brinquedo?</h2>
              <p>
                Chame a LERE Kids no WhatsApp para confirmar disponibilidade,
                entrega e formas de pagamento.
              </p>
            </div>
            <div className="contact-actions">
              <a className="social-button whatsapp-button" href={getWhatsAppLink()} target="_blank" rel="noreferrer">
                <WhatsAppIcon />
                WhatsApp
              </a>
              <a className="social-button instagram-button" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                <InstagramIcon />
                Instagram
              </a>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <img src={logo} alt="LERE Brinquedos Educativos" />
        <p>LERE Kids - brinquedos socioeducacionais para aprender brincando.</p>
        <div className="footer-socials" aria-label="Redes sociais">
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram da LERE Kids">
            <InstagramIcon />
          </a>
          <a href={getWhatsAppLink()} target="_blank" rel="noreferrer" aria-label="WhatsApp da LERE Kids">
            <WhatsAppIcon />
          </a>
        </div>
      </footer>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </>
  );
}
