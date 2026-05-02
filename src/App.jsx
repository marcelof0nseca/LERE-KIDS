import { useEffect, useMemo, useState } from "react";
import logo from "./assets/logo-lere.png";
import {
  INSTAGRAM_URL,
  WHATSAPP_NUMBER,
  products,
} from "./data/products.js";

const allOption = "Todos";
const tabs = [
  { id: "inicio", label: "Inicio" },
  { id: "todos", label: "Loja" },
  { id: "carrinho", label: "Carrinho" },
  { id: "conta", label: "Conta" },
  { id: "sobre", label: "Sobre" },
  { id: "contato", label: "Contato" },
];

const customerProfileKey = "lereKidsCustomerProfile";

const initialCheckout = {
  name: "",
  phone: "",
  email: "",
  cpf: "",
  cep: "",
  address: "",
  number: "",
  complement: "",
  neighborhood: "",
  deliveryType: "Retirada na loja",
  notes: "",
};

function getStoredCustomerProfile() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedProfile = window.localStorage.getItem(customerProfileKey);
    return storedProfile ? JSON.parse(storedProfile) : null;
  } catch {
    return null;
  }
}

function getCheckoutFromProfile(profile) {
  if (!profile) {
    return {};
  }

  return {
    name: profile.name || "",
    phone: profile.phone || "",
    email: profile.email || "",
    cpf: profile.cpf || "",
    cep: profile.cep || "",
    address: profile.address || "",
    number: profile.number || "",
    complement: profile.complement || "",
    neighborhood: profile.neighborhood || "",
  };
}

function normalizeCep(cep) {
  return cep.replace(/\D/g, "").slice(0, 8);
}

function formatCep(cep) {
  const normalizedCep = normalizeCep(cep);

  if (normalizedCep.length <= 5) {
    return normalizedCep;
  }

  return `${normalizedCep.slice(0, 5)}-${normalizedCep.slice(5)}`;
}

async function fetchAddressByCep(cep) {
  const normalizedCep = normalizeCep(cep);

  if (normalizedCep.length !== 8) {
    return null;
  }

  const response = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`);

  if (!response.ok) {
    throw new Error("Nao foi possivel consultar o CEP.");
  }

  const data = await response.json();

  if (data.erro) {
    throw new Error("CEP nao encontrado.");
  }

  return {
    address: data.logradouro || "",
    neighborhood: [data.bairro, data.localidade, data.uf].filter(Boolean).join(" - "),
  };
}

const privacyHighlights = [
  "A LERE Kids usa dados de contato e checkout apenas para responder pedidos, duvidas e atendimentos iniciados pelo cliente.",
  "O cadastro desta versao fica salvo somente no navegador do cliente, sem senha e sem envio automatico para servidor.",
  "Informacoes enviadas pelo WhatsApp ou Instagram seguem tambem as politicas dessas plataformas.",
  "Quando houver login real e pagamento online no futuro, a politica devera ser revisada para incluir dados de conta, pagamento, pedido e entrega.",
];

const exchangeHighlights = [
  "Solicitacoes de troca devem ser feitas pelo WhatsApp da loja, informando produto, data da compra e motivo.",
  "Produtos devem estar sem sinais de uso indevido, com embalagem e itens originais sempre que aplicavel.",
  "Itens com defeito serao analisados pela loja para orientar troca, substituicao ou outro encaminhamento adequado.",
  "Prazos, disponibilidade de estoque e condicoes finais devem ser confirmados no atendimento da LERE Kids.",
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

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getItemSubtotal(item) {
  return typeof item.product.price === "number" ? item.product.price * item.quantity : null;
}

function getCartSummary(cartItems) {
  const pricedItems = cartItems.filter((item) => typeof item.product.price === "number");
  const total = pricedItems.reduce((sum, item) => sum + getItemSubtotal(item), 0);
  const hasConsultPrice = pricedItems.length !== cartItems.length;

  return {
    total,
    hasConsultPrice,
    formattedTotal: pricedItems.length > 0 ? formatCurrency(total) : "A confirmar",
  };
}

function getCartWhatsAppLink(cartItems, checkout) {
  const summary = getCartSummary(cartItems);
  const productLines = cartItems
    .map((item, index) => {
      const subtotal = getItemSubtotal(item);
      const subtotalText = subtotal === null ? "subtotal a confirmar" : `subtotal ${formatCurrency(subtotal)}`;

      return `${index + 1}. ${item.quantity}x ${item.product.name} - ${item.product.formattedPrice} (${subtotalText})`;
    })
    .join("\n");
  const customerLines = [
    checkout.name && `Nome: ${checkout.name}`,
    checkout.phone && `Telefone: ${checkout.phone}`,
    checkout.email && `E-mail: ${checkout.email}`,
    checkout.cpf && `CPF: ${checkout.cpf}`,
    checkout.cep && `CEP: ${checkout.cep}`,
    checkout.address && `Endereco: ${checkout.address}${checkout.number ? `, ${checkout.number}` : ""}`,
    checkout.complement && `Complemento: ${checkout.complement}`,
    checkout.neighborhood && `Bairro/Cidade: ${checkout.neighborhood}`,
    `Entrega: ${checkout.deliveryType}`,
    checkout.notes && `Observacoes: ${checkout.notes}`,
  ]
    .filter(Boolean)
    .join("\n");
  const totalLine = summary.hasConsultPrice
    ? `Total parcial: ${summary.formattedTotal}. Existem itens com valor a confirmar.`
    : `Total: ${summary.formattedTotal}`;
  const message = `Ola! Quero fazer um pedido pela loja LERE Kids.\n\nProdutos:\n${productLines}\n\n${totalLine}\n\nDados do cliente:\n${customerLines}\n\nPode confirmar valores, disponibilidade, entrega e formas de pagamento?`;

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

function ProductCard({ product, onDetails, onAddToCart, compact = false }) {
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
          className="secondary-button product-buy-button"
          href={getWhatsAppLink(product)}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
        <button type="button" className="primary-button product-buy-button" onClick={() => onAddToCart(product)}>
          Adicionar
        </button>
      </div>
    </article>
  );
}

function ProductModal({ product, onClose, onAddToCart }) {
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
            className="secondary-button full-button"
            href={getWhatsAppLink(product)}
            target="_blank"
            rel="noreferrer"
          >
            Comprar pelo WhatsApp
          </a>
          <button type="button" className="primary-button full-button" onClick={() => onAddToCart(product)}>
            Adicionar ao carrinho
          </button>
        </div>
      </section>
    </div>
  );
}

function CartPage({
  cartItems,
  checkout,
  cepStatus,
  onUpdateCheckout,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
  onGoToStore,
}) {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const summary = getCartSummary(cartItems);
  const canSendOrder = cartItems.length > 0 && checkout.name.trim() && checkout.phone.trim();

  return (
    <section className="cart-page page-section">
      <div className="cart-heading">
        <div>
          <p className="eyebrow">Pedido pelo WhatsApp</p>
          <h2>Carrinho</h2>
          <p>
            Separe os brinquedos desejados e envie tudo para a LERE Kids em uma
            mensagem organizada.
          </p>
        </div>
        <div className="cart-heading-summary">
          <strong>{totalItems} item(ns)</strong>
          <span>{summary.hasConsultPrice ? "Total a confirmar" : summary.formattedTotal}</span>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <h3>Seu carrinho esta vazio</h3>
          <p>Escolha alguns produtos na loja para montar o pedido.</p>
          <button type="button" className="primary-button" onClick={onGoToStore}>
            Ver produtos
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => (
              <article className="cart-item" key={item.product.id}>
                <img src={item.product.image} alt={item.product.name} />
                <div>
                  <p>{item.product.category}</p>
                  <h3>{item.product.name}</h3>
                  <strong>
                    {getItemSubtotal(item) === null
                      ? item.product.formattedPrice
                      : formatCurrency(getItemSubtotal(item))}
                  </strong>
                </div>
                <div className="quantity-control" aria-label={`Quantidade de ${item.product.name}`}>
                  <button type="button" onClick={() => onDecrement(item.product.id)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => onIncrement(item.product.id)}>
                    +
                  </button>
                </div>
                <button type="button" className="remove-button" onClick={() => onRemove(item.product.id)}>
                  Remover
                </button>
              </article>
            ))}
            <button type="button" className="link-button" onClick={onClear}>
              Limpar carrinho
            </button>
          </div>

          <form className="checkout-form">
            <h3>Dados para atendimento</h3>
            <div className="checkout-total">
              <span>Resumo</span>
              <strong>{summary.hasConsultPrice ? "Valores a confirmar" : summary.formattedTotal}</strong>
            </div>
            <label>
              Nome
              <input
                type="text"
                value={checkout.name}
                onChange={(event) => onUpdateCheckout("name", event.target.value)}
                placeholder="Seu nome"
              />
            </label>
            <label>
              Telefone
              <input
                type="tel"
                value={checkout.phone}
                onChange={(event) => onUpdateCheckout("phone", event.target.value)}
                placeholder="(81) 99999-9999"
              />
            </label>
            <label>
              E-mail
              <input
                type="email"
                value={checkout.email}
                onChange={(event) => onUpdateCheckout("email", event.target.value)}
                placeholder="seuemail@exemplo.com"
              />
            </label>
            <label>
              CPF
              <input
                type="text"
                value={checkout.cpf}
                onChange={(event) => onUpdateCheckout("cpf", event.target.value)}
                placeholder="Opcional nesta fase"
              />
            </label>
            <label>
              CEP
              <input
                type="text"
                value={checkout.cep}
                onChange={(event) => onUpdateCheckout("cep", event.target.value)}
                placeholder="00000-000"
              />
            </label>
            {cepStatus && <p className="cep-status">{cepStatus}</p>}
            <div className="checkout-row">
              <label>
                Endereco
                <input
                  type="text"
                  value={checkout.address}
                  onChange={(event) => onUpdateCheckout("address", event.target.value)}
                  placeholder="Rua, avenida ou referencia"
                />
              </label>
              <label>
                Numero
                <input
                  type="text"
                  value={checkout.number}
                  onChange={(event) => onUpdateCheckout("number", event.target.value)}
                  placeholder="123"
                />
              </label>
            </div>
            <label>
              Complemento
              <input
                type="text"
                value={checkout.complement}
                onChange={(event) => onUpdateCheckout("complement", event.target.value)}
                placeholder="Apartamento, bloco, ponto de referencia"
              />
            </label>
            <label>
              Bairro/Cidade
              <input
                type="text"
                value={checkout.neighborhood}
                onChange={(event) => onUpdateCheckout("neighborhood", event.target.value)}
                placeholder="Ex.: Recife - Boa Viagem"
              />
            </label>
            <label>
              Entrega
              <select
                value={checkout.deliveryType}
                onChange={(event) => onUpdateCheckout("deliveryType", event.target.value)}
              >
                <option>Retirada na loja</option>
                <option>Consultar entrega</option>
                <option>Entrega local</option>
              </select>
            </label>
            <label>
              Observacoes
              <textarea
                value={checkout.notes}
                onChange={(event) => onUpdateCheckout("notes", event.target.value)}
                placeholder="Ex.: quero saber disponibilidade para presente"
                rows="4"
              />
            </label>
            {!canSendOrder && (
              <p className="form-hint">Informe pelo menos nome e telefone para enviar o pedido.</p>
            )}
            <a
              className={`primary-button full-button ${!canSendOrder ? "disabled-link" : ""}`}
              href={canSendOrder ? getCartWhatsAppLink(cartItems, checkout) : undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!canSendOrder}
            >
              Enviar pedido no WhatsApp
            </a>
          </form>
        </div>
      )}
    </section>
  );
}

function AccountPage({
  accountForm,
  customerProfile,
  cepStatus,
  onUpdateAccount,
  onSaveAccount,
  onUseInCheckout,
  onLogout,
}) {
  const hasMinimumData = accountForm.name.trim() && accountForm.phone.trim();

  return (
    <section className="account-page page-section">
      <div className="account-heading">
        <p className="eyebrow">Cadastro do cliente</p>
        <h2>Conta LERE Kids</h2>
        <p>
          Salve seus dados neste navegador para preencher o checkout mais rapido
          nas proximas compras.
        </p>
      </div>

      <div className="account-layout">
        <form className="account-form">
          <h3>{customerProfile ? "Dados salvos" : "Criar cadastro local"}</h3>
          <div className="checkout-row">
            <label>
              Nome
              <input
                type="text"
                value={accountForm.name}
                onChange={(event) => onUpdateAccount("name", event.target.value)}
                placeholder="Seu nome"
              />
            </label>
            <label>
              Telefone
              <input
                type="tel"
                value={accountForm.phone}
                onChange={(event) => onUpdateAccount("phone", event.target.value)}
                placeholder="(81) 99999-9999"
              />
            </label>
          </div>
          <div className="checkout-row">
            <label>
              E-mail
              <input
                type="email"
                value={accountForm.email}
                onChange={(event) => onUpdateAccount("email", event.target.value)}
                placeholder="seuemail@exemplo.com"
              />
            </label>
            <label>
              CPF
              <input
                type="text"
                value={accountForm.cpf}
                onChange={(event) => onUpdateAccount("cpf", event.target.value)}
                placeholder="Opcional"
              />
            </label>
          </div>
          <div className="checkout-row">
            <label>
              CEP
              <input
                type="text"
                value={accountForm.cep}
                onChange={(event) => onUpdateAccount("cep", event.target.value)}
                placeholder="00000-000"
              />
            </label>
            <label>
              Bairro/Cidade
              <input
                type="text"
                value={accountForm.neighborhood}
                onChange={(event) => onUpdateAccount("neighborhood", event.target.value)}
                placeholder="Recife - Boa Viagem"
              />
            </label>
          </div>
          {cepStatus && <p className="cep-status">{cepStatus}</p>}
          <div className="checkout-row">
            <label>
              Endereco
              <input
                type="text"
                value={accountForm.address}
                onChange={(event) => onUpdateAccount("address", event.target.value)}
                placeholder="Rua, avenida ou referencia"
              />
            </label>
            <label>
              Numero
              <input
                type="text"
                value={accountForm.number}
                onChange={(event) => onUpdateAccount("number", event.target.value)}
                placeholder="123"
              />
            </label>
          </div>
          <label>
            Complemento
            <input
              type="text"
              value={accountForm.complement}
              onChange={(event) => onUpdateAccount("complement", event.target.value)}
              placeholder="Apartamento, bloco, ponto de referencia"
            />
          </label>
          {!hasMinimumData && (
            <p className="form-hint">Informe pelo menos nome e telefone para salvar.</p>
          )}
          <div className="account-actions">
            <button
              type="button"
              className="primary-button"
              onClick={onSaveAccount}
              disabled={!hasMinimumData}
            >
              Salvar dados
            </button>
            <button type="button" className="secondary-button" onClick={onUseInCheckout}>
              Usar no checkout
            </button>
          </div>
          {customerProfile && (
            <button type="button" className="link-button" onClick={onLogout}>
              Remover cadastro deste navegador
            </button>
          )}
        </form>

        <aside className="account-info">
          <strong>Como funciona agora</strong>
          <p>
            Esta conta fica salva somente neste navegador. Ela nao usa senha e
            ainda nao cria usuario no servidor.
          </p>
          <strong>Como sera no backend</strong>
          <p>
            Na etapa real, os dados ficam em banco seguro e o login usa e-mail e
            senha por um provedor de autenticacao.
          </p>
        </aside>
      </div>
    </section>
  );
}

function LegalPage({ title, intro, items }) {
  return (
    <section className="legal-page page-section">
      <div>
        <p className="eyebrow">Informacoes da loja</p>
        <h2>{title}</h2>
        <p>{intro}</p>
      </div>
      <div className="legal-list">
        {items.map((item) => (
          <article key={item}>
            <p>{item}</p>
          </article>
        ))}
      </div>
      <p className="legal-note">
        Este texto e uma base informativa para a vitrine da loja. Antes de operar
        pagamento online, entrega integrada ou cadastro de clientes, revise as
        politicas com orientacao profissional.
      </p>
    </section>
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
  const [cartItems, setCartItems] = useState([]);
  const [customerProfile, setCustomerProfile] = useState(() => getStoredCustomerProfile());
  const [accountForm, setAccountForm] = useState(() => ({
    ...initialCheckout,
    ...getCheckoutFromProfile(getStoredCustomerProfile()),
  }));
  const [checkout, setCheckout] = useState(() => ({
    ...initialCheckout,
    ...getCheckoutFromProfile(getStoredCustomerProfile()),
  }));
  const [checkoutCepStatus, setCheckoutCepStatus] = useState("");
  const [accountCepStatus, setAccountCepStatus] = useState("");

  const categories = useMemo(() => getUniqueValues("category"), []);
  const ageRanges = useMemo(() => getUniqueValues("ageRange"), []);
  const skills = useMemo(() => getUniqueSkills(), []);
  const featuredProducts = products.filter((product) => product.featured);

  useEffect(() => {
    if (customerProfile) {
      window.localStorage.setItem(customerProfileKey, JSON.stringify(customerProfile));
    } else {
      window.localStorage.removeItem(customerProfileKey);
    }
  }, [customerProfile]);

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

  function addToCart(product) {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.product.id === product.id);

      if (existingItem) {
        return items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...items, { product, quantity: 1 }];
    });
    setSelectedProduct(null);
    setActiveTab("carrinho");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function incrementCartItem(productId) {
    setCartItems((items) =>
      items.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  function decrementCartItem(productId) {
    setCartItems((items) =>
      items
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeCartItem(productId) {
    setCartItems((items) => items.filter((item) => item.product.id !== productId));
  }

  function updateCheckout(field, value) {
    setCheckout((current) => ({
      ...current,
      [field]: field === "cep" ? formatCep(value) : value,
    }));

    if (field === "cep") {
      lookupCep(value, setCheckout, setCheckoutCepStatus);
    }
  }

  function updateAccount(field, value) {
    setAccountForm((current) => ({
      ...current,
      [field]: field === "cep" ? formatCep(value) : value,
    }));

    if (field === "cep") {
      lookupCep(value, setAccountForm, setAccountCepStatus);
    }
  }

  async function lookupCep(cep, setForm, setStatus) {
    const normalizedCep = normalizeCep(cep);

    if (normalizedCep.length < 8) {
      setStatus("");
      return;
    }

    setStatus("Buscando endereco...");

    try {
      const addressData = await fetchAddressByCep(normalizedCep);

      if (!addressData) {
        setStatus("");
        return;
      }

      setForm((current) => ({
        ...current,
        address: addressData.address || current.address,
        neighborhood: addressData.neighborhood || current.neighborhood,
      }));
      setStatus("Endereco preenchido pelo CEP.");
    } catch {
      setStatus("Nao encontramos esse CEP. Preencha o endereco manualmente.");
    }
  }

  function saveAccount() {
    const profile = getCheckoutFromProfile(accountForm);
    setCustomerProfile(profile);
    setCheckout((current) => ({ ...current, ...profile }));
  }

  function useAccountInCheckout() {
    const profile = getCheckoutFromProfile(accountForm);
    setCheckout((current) => ({ ...current, ...profile }));
    openTab("carrinho");
  }

  function logoutAccount() {
    setCustomerProfile(null);
    setAccountForm(initialCheckout);
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
        <button type="button" className="cart-shortcut" onClick={() => openTab("carrinho")}>
          Carrinho ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
        <button type="button" className="account-shortcut" onClick={() => openTab("conta")}>
          {customerProfile ? "Conta salva" : "Entrar"}
        </button>
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
                    onAddToCart={addToCart}
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
                <h2 id="products-title">Loja LERE Kids</h2>
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
                    onAddToCart={addToCart}
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

        {activeTab === "carrinho" && (
          <CartPage
            cartItems={cartItems}
            checkout={checkout}
            cepStatus={checkoutCepStatus}
            onUpdateCheckout={updateCheckout}
            onIncrement={incrementCartItem}
            onDecrement={decrementCartItem}
            onRemove={removeCartItem}
            onClear={() => setCartItems([])}
            onGoToStore={() => openTab("todos")}
          />
        )}

        {activeTab === "conta" && (
          <AccountPage
            accountForm={accountForm}
            customerProfile={customerProfile}
            cepStatus={accountCepStatus}
            onUpdateAccount={updateAccount}
            onSaveAccount={saveAccount}
            onUseInCheckout={useAccountInCheckout}
            onLogout={logoutAccount}
          />
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

        {activeTab === "privacidade" && (
          <LegalPage
            title="Politica de Privacidade"
            intro="A LERE Kids respeita a privacidade dos clientes e busca coletar somente as informacoes necessarias para atendimento e comunicacao."
            items={privacyHighlights}
          />
        )}

        {activeTab === "troca" && (
          <LegalPage
            title="Politica de Troca"
            intro="A politica de troca organiza o atendimento de solicitacoes relacionadas a produtos comprados com a LERE Kids."
            items={exchangeHighlights}
          />
        )}
      </main>

      <footer className="site-footer">
        <img src={logo} alt="LERE Brinquedos Educativos" />
        <p>LERE Kids - brinquedos socioeducacionais para aprender brincando.</p>
        <div className="footer-links" aria-label="Links institucionais">
          <button type="button" onClick={() => openTab("privacidade")}>
            Politica de Privacidade
          </button>
          <button type="button" onClick={() => openTab("troca")}>
            Politica de Troca
          </button>
          <button type="button" onClick={() => openTab("contato")}>
            Contato
          </button>
        </div>
        <div className="footer-socials" aria-label="Redes sociais">
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram da LERE Kids">
            <InstagramIcon />
          </a>
          <a href={getWhatsAppLink()} target="_blank" rel="noreferrer" aria-label="WhatsApp da LERE Kids">
            <WhatsAppIcon />
          </a>
        </div>
      </footer>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />
    </>
  );
}
