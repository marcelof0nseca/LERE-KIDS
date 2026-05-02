import { useEffect, useMemo, useState } from "react";
import logo from "./assets/logo-lere.png";
import {
  INSTAGRAM_URL,
  WHATSAPP_NUMBER,
  products,
} from "./data/products.js";
import { isSupabaseConfigured, supabase } from "./lib/supabase.js";

const allOption = "Todos";
const tabs = [
  { id: "inicio", label: "Início" },
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

const initialAuthForm = {
  email: "",
  password: "",
  confirmPassword: "",
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
    name: profile.name || profile.full_name || "",
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

function getProfilePayload(profile, user) {
  return {
    id: user.id,
    full_name: profile.name,
    phone: profile.phone,
    cpf: profile.cpf,
    cep: profile.cep,
    address: profile.address,
    number: profile.number,
    complement: profile.complement,
    neighborhood: profile.neighborhood,
    updated_at: new Date().toISOString(),
  };
}

function getAuthErrorMessage(message) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }

  if (normalizedMessage.includes("user already registered")) {
    return "Este e-mail já possui cadastro. Tente entrar.";
  }

  if (normalizedMessage.includes("password")) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }

  if (normalizedMessage.includes("email")) {
    return "Confira o e-mail informado.";
  }

  return message;
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
    throw new Error("Não foi possível consultar o CEP.");
  }

  const data = await response.json();

  if (data.erro) {
    throw new Error("CEP não encontrado.");
  }

  return {
    address: data.logradouro || "",
    neighborhood: [data.bairro, data.localidade, data.uf].filter(Boolean).join(" - "),
  };
}

const privacyHighlights = [
  "A LERÊ Kids coleta dados de conta, contato e checkout apenas para identificar o cliente, facilitar o atendimento, organizar pedidos e responder solicitações iniciadas pelo próprio cliente.",
  "Nome, telefone, e-mail, CPF e endereço podem ser salvos em uma conta protegida, com acesso limitado ao próprio cliente.",
  "A LERÊ Kids não vende dados pessoais e não deve compartilhar informações do cliente fora do necessário para atendimento, entrega, obrigação legal ou operação da compra.",
  "Informações enviadas pelo WhatsApp ou Instagram também seguem as políticas dessas plataformas. A política deverá ser revisada antes da entrada de pagamento online, frete integrado ou novas finalidades de uso.",
];

const exchangeHighlights = [
  "Solicitações de troca devem ser feitas pelo WhatsApp da loja, informando produto, data da compra e motivo.",
  "Produtos devem estar sem sinais de uso indevido, com embalagem e itens originais sempre que aplicável.",
  "Itens com defeito serão analisados pela loja para orientar troca, substituição ou outro encaminhamento adequado.",
  "Prazos, disponibilidade de estoque e condições finais devem ser confirmados no atendimento da LERÊ Kids.",
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
      ? `Olá! Tenho interesse no produto: ${product.name}. Poderia me passar o valor, disponibilidade e formas de pagamento?`
      : `Olá! Tenho interesse no produto: ${product.name}, no valor de ${product.formattedPrice}. Poderia me passar mais informações?`
    : "Olá! Vim pelo site da LERÊ Kids e gostaria de conhecer os brinquedos disponíveis.";

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
    checkout.address && `Endereço: ${checkout.address}${checkout.number ? `, ${checkout.number}` : ""}`,
    checkout.complement && `Complemento: ${checkout.complement}`,
    checkout.neighborhood && `Bairro/Cidade: ${checkout.neighborhood}`,
    `Entrega: ${checkout.deliveryType}`,
    checkout.notes && `Observações: ${checkout.notes}`,
  ]
    .filter(Boolean)
    .join("\n");
  const totalLine = summary.hasConsultPrice
    ? `Total parcial: ${summary.formattedTotal}. Existem itens com valor a confirmar.`
    : `Total: ${summary.formattedTotal}`;
  const message = `Olá! Quero fazer um pedido pela loja LERÊ Kids.\n\nProdutos:\n${productLines}\n\n${totalLine}\n\nDados do cliente:\n${customerLines}\n\nPode confirmar valores, disponibilidade, entrega e formas de pagamento?`;

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
            Separe os brinquedos desejados e envie tudo para a LERÊ Kids em uma
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
          <h3>Seu carrinho está vazio</h3>
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
                Endereço
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
              Observações
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
  session,
  authMode,
  authForm,
  accountForm,
  customerProfile,
  cepStatus,
  authStatus,
  accountStatus,
  isAuthLoading,
  isProfileLoading,
  onChangeAuthMode,
  onUpdateAuth,
  onSubmitAuth,
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
        <h2>Conta LERÊ Kids</h2>
        <p>
          Salve seus dados com segurança para preencher o checkout mais rápido
          nas próximas compras.
        </p>
      </div>

      <div className="account-layout">
        <form className="auth-form" onSubmit={onSubmitAuth}>
          <h3>{session ? "Sessão ativa" : authMode === "login" ? "Entrar" : "Criar conta"}</h3>
          {session ? (
            <>
              <p className="auth-user">{session.user.email}</p>
              <p>
                Seus dados podem ser salvos na conta e usados automaticamente no
                checkout.
              </p>
              <button type="button" className="secondary-button" onClick={onLogout}>
                Sair da conta
              </button>
            </>
          ) : (
            <>
              <div className="auth-tabs" aria-label="Escolha entre login e cadastro">
                <button
                  type="button"
                  className={authMode === "login" ? "active" : ""}
                  onClick={() => onChangeAuthMode("login")}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  className={authMode === "signup" ? "active" : ""}
                  onClick={() => onChangeAuthMode("signup")}
                >
                  Cadastrar
                </button>
              </div>
              <label>
                E-mail
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) => onUpdateAuth("email", event.target.value)}
                  placeholder="seuemail@exemplo.com"
                  required
                />
              </label>
              <label>
                {authMode === "login" ? "Senha" : "Criar senha"}
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) => onUpdateAuth("password", event.target.value)}
                  placeholder="Minimo de 6 caracteres"
                  minLength="6"
                  required
                />
              </label>
              {authMode === "signup" && (
                <label>
                  Confirmar senha
                  <input
                    type="password"
                    value={authForm.confirmPassword}
                    onChange={(event) => onUpdateAuth("confirmPassword", event.target.value)}
                    placeholder="Repita a senha"
                    minLength="6"
                    required
                  />
                </label>
              )}
              <button type="submit" className="primary-button" disabled={isAuthLoading}>
                {isAuthLoading ? "Aguarde..." : authMode === "login" ? "Entrar" : "Cadastrar"}
              </button>
            </>
          )}
          {authStatus && <p className="form-status">{authStatus}</p>}
        </form>

        <form className="account-form">
          <h3>{customerProfile ? "Dados salvos" : "Dados do cliente"}</h3>
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
              Endereço
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
              disabled={!hasMinimumData || !session || isProfileLoading}
            >
              {isProfileLoading ? "Salvando..." : "Salvar dados"}
            </button>
            <button type="button" className="secondary-button" onClick={onUseInCheckout}>
              Usar no checkout
            </button>
          </div>
          {!session && (
            <p className="form-hint">Entre ou crie uma conta para salvar seus dados com segurança.</p>
          )}
          {accountStatus && <p className="form-status">{accountStatus}</p>}
          {customerProfile && (
            <button type="button" className="link-button" onClick={onLogout}>
              Sair e limpar dados deste navegador
            </button>
          )}
        </form>

        <aside className="account-info">
          <strong>Como funciona agora</strong>
          <p>
            Sua conta guarda os dados necessários para agilizar o atendimento e
            preencher o pedido com mais praticidade.
          </p>
          <strong>Segurança dos dados</strong>
          <p>
            O acesso é feito por e-mail e senha. Cada cliente visualiza apenas
            as próprias informações de cadastro.
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
        <p className="eyebrow">Informações da loja</p>
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
        Este texto é uma base informativa para a vitrine da loja. Antes de operar
        pagamento online, entrega integrada ou cadastro de clientes, revise as
        políticas com orientação profissional.
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
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [authStatus, setAuthStatus] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
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

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthStatus("Cadastro temporariamente indisponível. Tente novamente em alguns instantes.");
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !session?.user) {
      return;
    }

    async function loadProfile() {
      setIsProfileLoading(true);
      setAccountStatus("Carregando dados da conta...");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        setAccountStatus(`Não foi possível carregar o cadastro: ${error.message}`);
        setIsProfileLoading(false);
        return;
      }

      if (data) {
        const profile = {
          ...getCheckoutFromProfile(data),
          email: session.user.email || "",
        };

        setCustomerProfile(profile);
        setAccountForm((current) => ({ ...current, ...profile }));
        setCheckout((current) => ({ ...current, ...profile }));
        setAccountStatus("Dados carregados da sua conta.");
      } else {
        setAccountForm((current) => ({ ...current, email: session.user.email || current.email }));
        setAccountStatus("Conta conectada. Preencha seus dados e salve.");
      }

      setIsProfileLoading(false);
    }

    loadProfile();
  }, [session]);

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

  function updateAuth(field, value) {
    setAuthForm((current) => ({ ...current, [field]: value }));
  }

  function changeAuthMode(mode) {
    setAuthMode(mode);
    setAuthStatus("");
    setAuthForm(initialAuthForm);
  }

  async function submitAuth(event) {
    event.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      setAuthStatus("Cadastro temporariamente indisponível. Tente novamente em alguns instantes.");
      return;
    }

    setIsAuthLoading(true);
    setAuthStatus(authMode === "login" ? "Entrando..." : "Criando conta...");

    if (authForm.password.length < 6) {
      setAuthStatus("A senha precisa ter pelo menos 6 caracteres.");
      setIsAuthLoading(false);
      return;
    }

    if (authMode === "signup" && authForm.password !== authForm.confirmPassword) {
      setAuthStatus("As senhas não conferem.");
      setIsAuthLoading(false);
      return;
    }

    const authRequest =
      authMode === "login"
        ? supabase.auth.signInWithPassword({
            email: authForm.email,
            password: authForm.password,
          })
        : supabase.auth.signUp({
            email: authForm.email,
            password: authForm.password,
          });

    const { error } = await authRequest;

    if (error) {
      setAuthStatus(getAuthErrorMessage(error.message));
      setIsAuthLoading(false);
      return;
    }

    setAuthStatus(
      authMode === "login"
        ? "Login feito com sucesso."
        : "Conta criada. Se for necessário confirmar, confira seu e-mail.",
    );
    setAuthForm(initialAuthForm);
    setIsAuthLoading(false);
  }

  async function lookupCep(cep, setForm, setStatus) {
    const normalizedCep = normalizeCep(cep);

    if (normalizedCep.length < 8) {
      setStatus("");
      return;
    }

    setStatus("Buscando endereço...");

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
      setStatus("Endereço preenchido pelo CEP.");
    } catch {
      setStatus("Não encontramos esse CEP. Preencha o endereço manualmente.");
    }
  }

  function saveAccount() {
    const profile = getCheckoutFromProfile(accountForm);
    setCustomerProfile(profile);
    setCheckout((current) => ({ ...current, ...profile }));

    if (!isSupabaseConfigured || !supabase || !session?.user) {
      setAccountStatus("Entre ou crie uma conta para salvar seus dados.");
      return;
    }

    setIsProfileLoading(true);
    setAccountStatus("Salvando cadastro...");

    supabase
      .from("profiles")
      .upsert(getProfilePayload(profile, session.user))
      .then(({ error }) => {
        if (error) {
          setAccountStatus(`Não foi possível salvar: ${error.message}`);
        } else {
          setAccountStatus("Cadastro salvo na sua conta.");
        }

        setIsProfileLoading(false);
      });
  }

  function useAccountInCheckout() {
    const profile = getCheckoutFromProfile(accountForm);
    setCheckout((current) => ({ ...current, ...profile }));
    openTab("carrinho");
  }

  async function logoutAccount() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setCustomerProfile(null);
    setAccountForm(initialCheckout);
    setCheckout(initialCheckout);
    setAuthStatus("Você saiu da conta.");
    setAccountStatus("");
  }

  return (
    <>
      <header className="site-header">
        <button type="button" className="brand" onClick={() => openTab("inicio")}>
          <img src={logo} alt="LERÊ Brinquedos Educativos" />
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
        <nav className={isMenuOpen ? "open" : ""} aria-label="Navegação principal">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => openTab(tab.id)}
            >
              {tab.id === "conta" && customerProfile ? "Conta salva" : tab.label}
            </button>
          ))}
        </nav>
        <button type="button" className="cart-shortcut" onClick={() => openTab("carrinho")}>
          Carrinho ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
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
                <span className="eyebrow">Brinquedos educativos com propósito</span>
                <h1>Aprender brincando, escolher com confiança.</h1>
                <p>
                  Uma vitrine de brinquedos educacionais e socioeducacionais para famílias,
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
                  Catálogo importado com produtos reais da LERÊ Kids. Os valores
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
                  Abrir catálogo completo
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
                <p className="eyebrow">Catálogo completo</p>
                <h2 id="products-title">Loja LERÊ Kids</h2>
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
            session={session}
            authMode={authMode}
            authForm={authForm}
            accountForm={accountForm}
            customerProfile={customerProfile}
            cepStatus={accountCepStatus}
            authStatus={authStatus}
            accountStatus={accountStatus}
            isAuthLoading={isAuthLoading}
            isProfileLoading={isProfileLoading}
            onChangeAuthMode={changeAuthMode}
            onUpdateAuth={updateAuth}
            onSubmitAuth={submitAuth}
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
              <h2>LERÊ Kids aproxima brincadeira, educação e desenvolvimento.</h2>
            </div>
            <div className="about-grid">
              <article>
                <strong>Escolha orientada</strong>
                <p>Cards mostram idade, habilidade e contexto de uso para facilitar a decisão.</p>
              </article>
              <article>
                <strong>Compra conversada</strong>
                <p>O pedido começa no WhatsApp, com a mensagem do produto já preenchida.</p>
              </article>
              <article>
                <strong>Catálogo flexível</strong>
                <p>O catálogo é organizado para facilitar novas atualizações da loja.</p>
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
                Chame a LERÊ Kids no WhatsApp para confirmar disponibilidade,
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
            title="Política de Privacidade"
            intro="A LERÊ Kids respeita a privacidade dos clientes e busca coletar somente as informações necessárias para atendimento, cadastro e comunicação."
            items={privacyHighlights}
          />
        )}

        {activeTab === "troca" && (
          <LegalPage
            title="Política de Troca"
            intro="A política de troca organiza o atendimento de solicitações relacionadas a produtos comprados com a LERÊ Kids."
            items={exchangeHighlights}
          />
        )}
      </main>

      <footer className="site-footer">
        <img src={logo} alt="LERÊ Brinquedos Educativos" />
        <p>LERÊ Kids - brinquedos socioeducacionais para aprender brincando.</p>
        <div className="footer-links" aria-label="Links institucionais">
          <button type="button" onClick={() => openTab("privacidade")}>
            Política de Privacidade
          </button>
          <button type="button" onClick={() => openTab("troca")}>
            Política de Troca
          </button>
          <button type="button" onClick={() => openTab("contato")}>
            Contato
          </button>
        </div>
        <div className="footer-socials" aria-label="Redes sociais">
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram da LERÊ Kids">
            <InstagramIcon />
          </a>
          <a href={getWhatsAppLink()} target="_blank" rel="noreferrer" aria-label="WhatsApp da LERÊ Kids">
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
