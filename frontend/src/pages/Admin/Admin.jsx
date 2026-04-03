import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  fetchAdminStats,
  fetchAllUsers,
  updateUser,
  deleteUser,
  fetchAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchAllOrders,
  updateOrderStatus,
  fetchFieldOptions,
} from '../../api/admin';
import { groupProductVariants } from '../../api/products';
import './Admin.css';

/* Mapeamento cor → hex (sincronizado com ProductCard/ProductDetail) */
const COLOR_MAP_HEX = {
  linho: '#C8B9A6', bege: '#C8B9A6', beige: '#C8B9A6', areia: '#D4C5A9',
  branco: '#F5F5F0', 'off-white': '#F0EDE8', creme: '#FFF8E7',
  cinza: '#999999', 'cinza-claro': '#C0C0C0', 'cinza-escuro': '#555555',
  preto: '#1a1a1a', 'azul-marinho': '#1B2A4A', azul: '#4A90D9',
  verde: '#5C7A5C', 'verde-salva': '#8FAE8F', 'verde-escuro': '#2D4A2D',
  rosa: '#D4A5A5', terracota: '#C87941', mostarda: '#C4A535', castanho: '#8B6540',
};

function colorHex(name = '') {
  const key = (name || '').toLowerCase().trim().replace(/\s+/g, '-');
  if (/^#[0-9a-f]{6}$/i.test(key)) return key;
  if (/^[0-9a-f]{6}$/i.test(key)) return `#${key}`;
  return COLOR_MAP_HEX[key] || '#ccc';
}

function colorToHex(name = '') { return colorHex(name); }

function isLightColor(hex = '') {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 210;
}

/**
 * Agrupa produtos para o painel admin usando productGroup (campo do DB).
 * Produtos com o mesmo productGroup formam 1 família.
 * Dentro de cada família, separamos por cor para mostrar swatches.
 * Fallback: se productGroup não existir, usa o baseName extraído pelo groupProductVariants.
 */
function groupAdminProducts(products) {
  // groupProductVariants já agrupa por productGroup quando disponível
  // e retorna { baseName, variants[], allColors[] }
  const variantGroups = groupProductVariants(products);

  // Cada variantGroup já é uma família (productGroup garante isso)
  // Agora separamos as variants por cor dentro de cada família
  const families = variantGroups.map((g) => {
    // Agrupar variantes por cor
    const colorMap = new Map();
    for (const v of g.variants) {
      const colorKey = v.colors?.[0] || 'sem-cor';
      if (!colorMap.has(colorKey)) {
        colorMap.set(colorKey, { colors: v.colors || [], variants: [] });
      }
      colorMap.get(colorKey).variants.push(v);
    }

    const colorGroups = Array.from(colorMap.values()).map((cg) => ({
      colors: cg.colors,
      variants: [...cg.variants].sort((a, b) => a.price - b.price),
    }));

    return {
      familyName: g.baseName,
      colorGroups,
      allColors: g.allColors,
      imageCover: g.variants[0]?.imageCover,
    };
  });

  return families;
}

const TABS = [
  { id: 'dashboard', label: 'RESUMO' },
  { id: 'users', label: 'UTILIZADORES' },
  { id: 'products', label: 'PRODUTOS' },
  { id: 'orders', label: 'ENCOMENDAS' },
];

const ROLES = ['user', 'supplier', 'reseller', 'admin'];
const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_LABELS = {
  pending: 'PENDENTE',
  paid: 'PAGO',
  processing: 'EM PROCESSO',
  shipped: 'ENVIADO',
  delivered: 'ENTREGUE',
  cancelled: 'CANCELADO',
};

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="admin">
      {/* ── Sidebar ── */}
      <aside className="admin__sidebar">
        <div className="admin__sidebar-brand">
          <span className="admin__sidebar-logo">MIL FIOS</span>
          <span className="admin__sidebar-role">PAINEL ADMIN</span>
        </div>

        <nav className="admin__nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`admin__nav-btn ${activeTab === tab.id ? 'admin__nav-btn--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="admin__nav-icon">{NAV_ICONS[tab.id]}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin__sidebar-footer">
          <div className="admin__sidebar-user">
            <span className="admin__sidebar-avatar">
              <UserIcon />
            </span>
            <div>
              <p className="admin__sidebar-name">{user.name.split(' ')[0]}</p>
              <p className="admin__sidebar-email">{user.email}</p>
            </div>
          </div>
          <button className="admin__logout-btn" onClick={handleLogout}>
            TERMINAR SESSÃO
          </button>
        </div>
      </aside>

      {/* ── Conteúdo ── */}
      <main className="admin__main">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'users' && <UsersTab currentUserId={user._id || user.id} />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'orders' && <OrdersTab />}
      </main>
    </div>
  );
}

/* ─────────────────────────────────────
   Tab: Dashboard / Resumo
───────────────────────────────────── */
function DashboardTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <TabLoader />;
  if (error) return <TabError message={error} />;

  const { overview, usersByRole, ordersByStatus, recentOrders, lowStockProducts } = stats;

  return (
    <div className="admin__tab">
      <h2 className="admin__tab-title">RESUMO GERAL</h2>

      {/* Stats Cards */}
      <div className="admin__stats-grid">
        <StatCard label="UTILIZADORES" value={overview.totalUsers} sub={`${usersByRole.admin || 0} admins`} />
        <StatCard label="ENCOMENDAS" value={overview.totalOrders} sub={`${ordersByStatus.delivered?.count || 0} entregues`} />
        <StatCard
          label="RECEITA"
          value={`${overview.totalRevenue.toFixed(2)} €`}
          sub="encomendas pagas"
        />
        <StatCard label="PRODUTOS" value={overview.activeProducts} sub={`de ${overview.totalProducts} total`} />
      </div>

      {/* Utilizadores por role */}
      <div className="admin__section">
        <h3 className="admin__section-title">UTILIZADORES POR TIPO</h3>
        <div className="admin__role-badges">
          {ROLES.map((role) =>
            usersByRole[role] ? (
              <span key={role} className={`admin__role-chip admin__role-chip--${role}`}>
                {role.toUpperCase()} ({usersByRole[role]})
              </span>
            ) : null
          )}
        </div>
      </div>

      {/* Low Stock */}
      {lowStockProducts?.length > 0 && (
        <div className="admin__section">
          <h3 className="admin__section-title admin__section-title--warn">
            ⚠ STOCK BAIXO ({lowStockProducts.length})
          </h3>
          <div className="admin__table-wrap">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>PRODUTO</th>
                  <th>SKU</th>
                  <th>STOCK</th>
                  <th>MÍNIMO</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td className="admin__mono">{p.sku}</td>
                    <td className="admin__stock--low">{p.stock}</td>
                    <td>{p.lowStockThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="admin__section">
        <h3 className="admin__section-title">ENCOMENDAS RECENTES</h3>
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>REF.</th>
                <th>DATA</th>
                <th>CLIENTE</th>
                <th>TOTAL</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o._id}>
                  <td className="admin__mono">{o._id.slice(-8).toUpperCase()}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString('pt-PT')}</td>
                  <td>{o.user?.name || '—'}</td>
                  <td>{o.totalPrice?.toFixed(2)} €</td>
                  <td>
                    <span className={`admin__status admin__status--${o.status}`}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Tab: Utilizadores
───────────────────────────────────── */
function UsersTab({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(null);
  const [confirm, setConfirm] = useState(null); // id to confirm delete

  const load = useCallback(() => {
    setLoading(true);
    fetchAllUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (id, role) => {
    setSaving(id);
    try {
      const updated = await updateUser(id, { role });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: updated.role } : u)));
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setConfirm(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <TabLoader />;
  if (error) return <TabError message={error} />;

  return (
    <div className="admin__tab">
      <div className="admin__tab-header">
        <h2 className="admin__tab-title">UTILIZADORES ({users.length})</h2>
        <input
          className="admin__search"
          type="text"
          placeholder="Pesquisar por nome ou e-mail…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>NOME</th>
              <th>E-MAIL</th>
              <th>TIPO</th>
              <th>REGISTADO</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id} className={u._id === currentUserId ? 'admin__row--self' : ''}>
                <td>
                  {u.name}
                  {u._id === currentUserId && <span className="admin__you-badge"> (você)</span>}
                </td>
                <td className="admin__mono">{u.email}</td>
                <td>
                  {u._id === currentUserId ? (
                    <span className={`admin__role-chip admin__role-chip--${u.role}`}>
                      {u.role.toUpperCase()}
                    </span>
                  ) : (
                    <select
                      className="admin__select"
                      value={u.role}
                      disabled={saving === u._id}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-PT') : '—'}</td>
                <td>
                  {u._id !== currentUserId && (
                    confirm === u._id ? (
                      <span className="admin__confirm-row">
                        <button
                          className="admin__btn admin__btn--danger"
                          onClick={() => handleDelete(u._id)}
                        >
                          CONFIRMAR
                        </button>
                        <button
                          className="admin__btn admin__btn--ghost"
                          onClick={() => setConfirm(null)}
                        >
                          CANCELAR
                        </button>
                      </span>
                    ) : (
                      <button
                        className="admin__btn admin__btn--outline"
                        onClick={() => setConfirm(u._id)}
                      >
                        ELIMINAR
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="admin__empty-row">Sem resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Tab: Produtos
───────────────────────────────────── */
/* ─────────────────────────────────────
   Linha de variante dentro do accordion
───────────────────────────────────── */
function ProductVariantRow({ product, onStockSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [stockVal, setStockVal] = useState('');
  const [confirming, setConfirming] = useState(false);

  const startEdit = () => {
    setStockVal(String(product.stock ?? 0));
    setEditing(true);
  };

  const saveStock = async () => {
    const val = parseInt(stockVal, 10);
    if (!isNaN(val) && val >= 0) await onStockSave(product._id, val);
    setEditing(false);
  };

  return (
    <tr>
      <td className="admin__variant-label">
        {product.variantLabel || product.name}
      </td>
      <td className="admin__mono">{product.sku || '—'}</td>
      <td>{product.price?.toFixed(2)} €</td>
      <td>
        {editing ? (
          <span className="admin__stock-edit">
            <input
              className="admin__stock-input"
              type="number"
              min="0"
              value={stockVal}
              autoFocus
              onChange={(e) => setStockVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveStock();
                if (e.key === 'Escape') setEditing(false);
              }}
            />
            <button className="admin__btn admin__btn--sm" onClick={saveStock}>✓</button>
          </span>
        ) : (
          <button
            className={`admin__stock-val ${product.stock <= (product.lowStockThreshold || 5) ? 'admin__stock--low' : ''}`}
            onClick={startEdit}
            title="Clique para editar stock"
          >
            {product.stock ?? 0}
          </button>
        )}
      </td>
      <td>
        <span className={`admin__active-dot ${product.active !== false ? 'admin__active-dot--on' : 'admin__active-dot--off'}`} />
      </td>
      <td>
        {confirming ? (
          <span className="admin__confirm-row">
            <button className="admin__btn admin__btn--danger" onClick={() => onDelete(product._id)}>CONFIRMAR</button>
            <button className="admin__btn admin__btn--ghost" onClick={() => setConfirming(false)}>CANCELAR</button>
          </span>
        ) : (
          <button className="admin__btn admin__btn--outline" onClick={() => setConfirming(true)}>ELIMINAR</button>
        )}
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────
   Accordion de um grupo de produto
───────────────────────────────────── */
function ProductGroupAccordion({ family, onStockSave, onDelete }) {
  const [open, setOpen] = useState(false);
  const [activeColorKey, setActiveColorKey] = useState(family.colorGroups[0]?.colors?.[0] || 'sem-cor');

  const activeGroup = family.colorGroups.find((cg) => cg.colors?.[0] === activeColorKey)
    || family.colorGroups[0];

  return (
    <div className="admin__product-group">
      {/* Header clicável */}
      <button className="admin__group-header" onClick={() => setOpen((v) => !v)}>
        <img
          className="admin__group-thumb"
          src={`/img/products/${family.imageCover}`}
          alt={family.familyName}
        />
        <span className="admin__group-name">{family.familyName.toUpperCase()}</span>
        {/* Pips de cor */}
        <span className="admin__color-pips">
          {family.allColors.map((c) => (
            <span
              key={c}
              className="admin__color-pip"
              style={{ background: colorToHex(c), border: isLightColor(colorToHex(c)) ? '1px solid #ccc' : 'none' }}
              title={c}
            />
          ))}
        </span>
        <span className="admin__group-count">{family.colorGroups.reduce((n, cg) => n + cg.variants.length, 0)} variantes</span>
        <span className={`admin__group-chevron ${open ? 'admin__group-chevron--open' : ''}`}>›</span>
      </button>

      {open && (
        <div className="admin__group-body">
          {/* Seletor de cor */}
          {family.colorGroups.length > 1 && (
            <div className="admin__group-colors">
              {family.colorGroups.map((cg) => {
                const colorName = cg.colors?.[0] || 'sem-cor';
                const hex = colorToHex(colorName);
                const light = isLightColor(hex);
                const isActive = colorName === activeColorKey;
                return (
                  <button
                    key={colorName}
                    className={`admin__color-swatch ${isActive ? 'admin__color-swatch--active' : ''}`}
                    style={{ background: hex, border: light ? '1px solid #aaa' : 'none' }}
                    onClick={() => setActiveColorKey(colorName)}
                    title={colorName}
                    aria-label={`Ver cor ${colorName}`}
                  />
                );
              })}
            </div>
          )}

          {/* Tabela de variantes da cor activa */}
          <div className="admin__table-wrap admin__table-wrap--inset">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>VARIANTE</th>
                  <th>SKU</th>
                  <th>PREÇO</th>
                  <th>STOCK</th>
                  <th>ATIVO</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {activeGroup.variants.map((v) => (
                  <ProductVariantRow
                    key={v._id}
                    product={v}
                    onStockSave={onStockSave}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* Converte string para slug simples (sem dependências) */
function slugifyStr(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* Paleta de cores predefinidas para o picker */
const PRESET_COLORS = [
  // Brancos / neutros
  { name: 'branco',     hex: '#F5F5F0' },
  { name: 'off-white',  hex: '#F0EDE8' },
  { name: 'creme',      hex: '#FFF8E7' },
  { name: 'areia',      hex: '#D4C5A9' },
  { name: 'linho',      hex: '#C8B9A6' },
  // Cinzas / preto
  { name: 'cinza-claro',  hex: '#C0C0C0' },
  { name: 'cinza',        hex: '#999999' },
  { name: 'cinza-escuro', hex: '#555555' },
  { name: 'preto',        hex: '#1a1a1a' },
  // Azuis
  { name: 'azul',         hex: '#4A90D9' },
  { name: 'azul-marinho', hex: '#1B2A4A' },
  // Verdes
  { name: 'verde-salva',  hex: '#8FAE8F' },
  { name: 'verde',        hex: '#5C7A5C' },
  { name: 'verde-escuro', hex: '#2D4A2D' },
  // Quentes
  { name: 'rosa',         hex: '#D4A5A5' },
  { name: 'terracota',    hex: '#C87941' },
  { name: 'mostarda',     hex: '#C4A535' },
  { name: 'castanho',     hex: '#8B6540' },
];

/* ─────────────────────────────────────
   HSL Color Picker
───────────────────────────────────── */
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function HslColorPicker({ onConfirm, onCancel }) {
  const [hue, setHue] = useState(200);
  const [sat, setSat] = useState(70);
  const [lit, setLit] = useState(50);
  const [name, setName] = useState('');

  const hex = hslToHex(hue, sat, lit);
  const preview = `hsl(${hue},${sat}%,${lit}%)`;
  const satBg = `linear-gradient(to right, hsl(${hue},0%,${lit}%), hsl(${hue},100%,${lit}%))`;
  const litBg = `linear-gradient(to right, hsl(${hue},${sat}%,5%), hsl(${hue},${sat}%,50%), hsl(${hue},${sat}%,95%))`;

  const handleConfirm = () => {
    const finalName = name.trim() || hex;
    onConfirm(finalName, hex);
    setName('');
  };

  return (
    <div className="admin__hsl-picker">
      <div className="admin__hsl-preview-row">
        <div className="admin__hsl-preview" style={{ background: preview }} />
        <span className="admin__hsl-hex">{hex}</span>
        <span className="admin__hsl-preview-label">Pré-visualização</span>
      </div>

      <div className="admin__hsl-row">
        <span className="admin__hsl-label">TOM</span>
        <input type="range" min="0" max="360" value={hue}
          onChange={(e) => setHue(+e.target.value)}
          className="admin__hsl-slider admin__hsl-slider--hue" />
      </div>

      <div className="admin__hsl-row">
        <span className="admin__hsl-label">SATURAÇÃO</span>
        <input type="range" min="0" max="100" value={sat}
          onChange={(e) => setSat(+e.target.value)}
          className="admin__hsl-slider"
          style={{ background: satBg }} />
      </div>

      <div className="admin__hsl-row">
        <span className="admin__hsl-label">LUMINOSIDADE</span>
        <input type="range" min="0" max="100" value={lit}
          onChange={(e) => setLit(+e.target.value)}
          className="admin__hsl-slider"
          style={{ background: litBg }} />
      </div>

      <input
        type="text"
        className="admin__form-input admin__hsl-name-input"
        placeholder="Nome da cor (opcional, ex: azul-turquesa)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleConfirm(); } }}
      />
      <div className="admin__hsl-actions">
        <button type="button" className="admin__btn admin__btn--ghost" onClick={onCancel}>Cancelar</button>
        <button type="button" className="admin__btn admin__btn--primary" onClick={handleConfirm}>+ Adicionar cor</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Picker de cores visual (swatches)
───────────────────────────────────── */
function ColorSwatchPicker({ selected, onToggle, onAddCustom }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <div>
      <div className="admin__color-picker">
        {PRESET_COLORS.map(({ name, hex }) => {
          const light = isLightColor(hex);
          const active = selected.includes(name);
          return (
            <button
              key={name}
              type="button"
              className={`admin__cp-swatch ${active ? 'admin__cp-swatch--active' : ''}`}
              style={{ background: hex, border: light ? '1.5px solid #ccc' : '1.5px solid transparent' }}
              title={name}
              aria-label={name}
              aria-pressed={active}
              onClick={() => onToggle(name)}
            >
              {active && (
                <svg className="admin__cp-check" viewBox="0 0 12 10" fill="none" width="10" height="10">
                  <path d="M1 5l3 3 7-7" stroke={light ? '#333' : '#fff'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}
        {/* Swatch arco-íris — abre o picker HSL */}
        <button
          type="button"
          className={`admin__cp-swatch admin__cp-swatch--rainbow ${pickerOpen ? 'admin__cp-swatch--rainbow-open' : ''}`}
          title="Escolher cor personalizada"
          aria-label="Paleta de cores"
          onClick={() => setPickerOpen((v) => !v)}
        >
          {pickerOpen
            ? <svg viewBox="0 0 12 10" fill="none" width="10" height="10"><path d="M1 5l3 3 7-7" stroke="rgba(255,255,255,0.95)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            : <svg viewBox="0 0 14 14" width="13" height="13" fill="none"><path d="M7 1v12M1 7h12" stroke="rgba(255,255,255,0.95)" strokeWidth="2" strokeLinecap="round" /></svg>
          }
        </button>
      </div>
      {pickerOpen && (
        <HslColorPicker
          onConfirm={(name, hex) => { onAddCustom(name, hex); setPickerOpen(false); }}
          onCancel={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────
   Componente: input de tags (multi-valor)
───────────────────────────────────── */
function TagInputField({ id, list, onAdd, onRemove, inputVal, onInputChange, placeholder = 'Escrever + Enter', hints = [] }) {
  const dlId = `tagfield-${id}`;
  const handleKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputVal.trim()) {
      e.preventDefault();
      onAdd(inputVal.trim());
    }
    if (e.key === 'Backspace' && !inputVal && list.length) {
      onRemove(list.length - 1);
    }
  };
  return (
    <>
      {hints.length > 0 && (
        <datalist id={dlId}>{hints.map((h) => <option key={h} value={h} />)}</datalist>
      )}
      <div className="admin__tag-input-wrap">
        {list.map((t, i) => (
          <span key={i} className="admin__tag">
            {t}
            <button type="button" className="admin__tag-remove" onClick={() => onRemove(i)}>×</button>
          </span>
        ))}
        <input
          className="admin__tag-text-input"
          list={hints.length ? dlId : undefined}
          value={inputVal}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder={list.length === 0 ? placeholder : ''}
        />
      </div>
    </>
  );
}

/* ─────────────────────────────────────
   Preview: mini ProductCard ao vivo
───────────────────────────────────── */
function ProductCardPreview({ form, colors, sizes, dimensions, imageCoverUrl }) {
  const [activeColor, setActiveColor] = useState(colors[0] || null);
  const [activeSize, setActiveSize] = useState(null);

  // Sincronizar cor activa quando a lista de cores mudar
  useEffect(() => {
    setActiveColor((prev) => (colors.includes(prev) ? prev : colors[0] || null));
  }, [colors]);

  const price = parseFloat(form.price) || 0;
  const priceDiscount = parseFloat(form.priceDiscount) || 0;
  const hasDiscount = priceDiscount > 0 && priceDiscount < price;
  const sizeOptions = sizes.length ? sizes : dimensions;
  const displayName = form.name.trim() || 'NOME DO PRODUTO';
  const stockNum = parseInt(form.stock, 10);
  const outOfStock = !isNaN(stockNum) && stockNum === 0;

  return (
    <article className="pcp">
      {/* Imagem */}
      <div className="pcp__image-wrap">
        {imageCoverUrl ? (
          <img src={imageCoverUrl} alt={displayName} className="pcp__image" />
        ) : (
          <div className="pcp__image-placeholder">
            <svg viewBox="0 0 48 48" fill="none" stroke="#ccc" strokeWidth="1.5" width="36" height="36">
              <rect x="4" y="4" width="40" height="40" rx="2" />
              <circle cx="17" cy="18" r="4" />
              <path d="M4 34l12-10 8 8 6-6 14 10" />
            </svg>
            <span className="pcp__image-placeholder-text">IMAGEM DE CAPA</span>
          </div>
        )}
        {hasDiscount && <span className="pcp__badge pcp__badge--sale">SALE</span>}
        {form.featured && <span className="pcp__badge pcp__badge--featured">★ DESTAQUE</span>}
        {!form.active && <span className="pcp__badge pcp__badge--inactive">INATIVO</span>}
        {outOfStock && <span className="pcp__badge pcp__badge--stock">SEM STOCK</span>}
      </div>

      {/* Info */}
      <div className="pcp__info">
        <span className="pcp__name">{displayName.toUpperCase()}</span>

        {form.material && (
          <span className="pcp__material">{form.material}</span>
        )}

        <div className="pcp__price">
          {hasDiscount ? (
            <>
              <span className="pcp__price--old">{price.toFixed(2)} €</span>
              <span className="pcp__price--sale">{priceDiscount.toFixed(2)} €</span>
            </>
          ) : price > 0 ? (
            <span>{price.toFixed(2)} €</span>
          ) : (
            <span className="pcp__price--empty">—,— €</span>
          )}
        </div>

        {/* Botões de tamanho/dimensão */}
        {sizeOptions.length > 0 && (
          <div className="pcp__sizes">
            {sizeOptions.map((s) => (
              <button
                key={s}
                type="button"
                className={`pcp__size-btn ${
                  (activeSize || sizeOptions[0]) === s ? 'pcp__size-btn--active' : ''
                }`}
                onClick={() => setActiveSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Swatches de cor */}
        {colors.length > 0 && (
          <div className="pcp__colors">
            {colors.map((color) => {
              const hex = colorHex(color);
              const light = isLightColor(hex);
              return (
                <button
                  key={color}
                  type="button"
                  className={`pcp__color-dot ${
                    color === (activeColor || colors[0]) ? 'pcp__color-dot--active' : ''
                  }`}
                  style={{
                    background: hex,
                    border: light ? '1px solid #ccc' : '1px solid transparent',
                  }}
                  title={color}
                  onClick={() => setActiveColor(color)}
                />
              );
            })}
            {colors.length > 1 && (
              <span className="pcp__color-count">{colors.length} cores</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/* ─────────────────────────────────────
   Dropdown de categoria / subcategoria
───────────────────────────────────── */
function CategoryDropdown({ options, value, isNew, newValue, onSelect, onNewChange, placeholder, newLabel, required = false }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayLabel = isNew ? `+ ${newLabel}` : (value || placeholder);
  const hasValue = isNew || !!value;

  return (
    <div ref={wrapRef} className="admin__catdd">
      <button
        type="button"
        className={`admin__catdd-btn${!hasValue ? ' admin__catdd-btn--empty' : ''}${open ? ' admin__catdd-btn--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={isNew ? 'admin__catdd-btn-new' : ''}>{displayLabel}</span>
        <svg className={`admin__catdd-chevron${open ? ' admin__catdd-chevron--open' : ''}`} viewBox="0 0 10 6" width="10" height="6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="admin__catdd-list">
          <button
            type="button"
            className={`admin__catdd-item admin__catdd-item--new${isNew ? ' admin__catdd-item--active' : ''}`}
            onClick={() => { onSelect(null, true); setOpen(false); }}
          >
            <svg viewBox="0 0 12 12" width="10" height="10" fill="none" style={{ marginRight: 7, flexShrink: 0 }}>
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {newLabel}
          </button>
          <div className="admin__catdd-divider" />
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`admin__catdd-item${value === opt && !isNew ? ' admin__catdd-item--active' : ''}`}
              onClick={() => { onSelect(opt, false); setOpen(false); }}
            >
              {opt}
            </button>
          ))}
          {options.length === 0 && (
            <span className="admin__catdd-empty">Sem opções existentes</span>
          )}
        </div>
      )}

      {isNew && (
        <input
          className="admin__form-input admin__catdd-new-input"
          autoFocus
          required={required}
          placeholder={`Nome da nova ${newLabel.toLowerCase()}…`}
          value={newValue}
          onChange={(e) => onNewChange(e.target.value)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────
   Modal: Criar Novo Produto
───────────────────────────────────── */
function CreateProductModal({ onClose, onCreated, allProducts = [] }) {
  const [opts, setOpts] = useState(null);
  const [form, setForm] = useState({
    name: '', sku: '', brand: '', productGroup: '',
    category: '', subcategory: '',
    material: '', composition: '', weight: '',
    price: '', priceReseller: '', priceDiscount: '',
    currency: 'EUR',
    stock: '0', lowStockThreshold: '5',
    summary: '', description: '',
    active: true, featured: false,
  });
  const [tags, setTags] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [tagIn, setTagIn] = useState('');
  const [colorIn, setColorIn] = useState('');
  const [sizeIn, setSizeIn] = useState('');
  const [dimIn, setDimIn] = useState('');
  const [imageCover, setImageCover] = useState(null);
  const [imageCoverUrl, setImageCoverUrl] = useState(null);
  const [extraImages, setExtraImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [skuTouched, setSkuTouched] = useState(false);
  const [catIsNew, setCatIsNew] = useState(false);
  const [catNewVal, setCatNewVal] = useState('');
  const [subcatIsNew, setSubcatIsNew] = useState(false);
  const [subcatNewVal, setSubcatNewVal] = useState('');

  // Subcategorias filtradas pela categoria actualmente seleccionada
  const subcatOptions = useMemo(() => {
    const cat = catIsNew ? catNewVal.trim() : form.category;
    if (!cat || !allProducts.length) return opts?.subcategories || [];
    const fromProducts = [...new Set(
      allProducts.filter((p) => p.category === cat && p.subcategory).map((p) => p.subcategory)
    )].sort();
    return fromProducts.length ? fromProducts : (opts?.subcategories || []);
  }, [allProducts, form.category, catIsNew, catNewVal, opts]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchFieldOptions().then(setOpts).catch(() => {});
  }, []);

  // Blob URL para preview da imagem de capa
  useEffect(() => {
    if (!imageCover) { setImageCoverUrl(null); return; }
    const url = URL.createObjectURL(imageCover);
    setImageCoverUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageCover]);

  // Auto-gerar SKU: nome + 1ª cor + 1º tamanho/dimensão
  useEffect(() => {
    if (skuTouched) return;
    const parts = [];
    if (form.name.trim()) parts.push(slugifyStr(form.name.trim()));
    if (colors[0]) parts.push(slugifyStr(colors[0]));
    const sizeRef = sizes[0] || dimensions[0];
    if (sizeRef) parts.push(slugifyStr(sizeRef));
    setForm((p) => ({ ...p, sku: parts.join('-') }));
  }, [form.name, colors, sizes, dimensions, skuTouched]); // eslint-disable-line react-hooks/exhaustive-deps

  const setField = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const addItem = (list, setList, val, clearFn) => {
    const t = val.trim();
    if (!t || list.includes(t)) { clearFn(''); return; }
    setList((p) => [...p, t]);
    clearFn('');
  };

  const removeItem = (setList, i) => setList((p) => p.filter((_, idx) => idx !== i));

  const toggleColor = (name) => setColors((prev) =>
    prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
  );

  const handleCatSelect = (val, isNew) => {
    setCatIsNew(isNew);
    setSubcatIsNew(false);
    setSubcatNewVal('');
    setForm((p) => ({ ...p, category: isNew ? '' : val, subcategory: '' }));
  };

  const handleSubcatSelect = (val, isNew) => {
    setSubcatIsNew(isNew);
    setForm((p) => ({ ...p, subcategory: isNew ? '' : val }));
  };

  const handleAddCustomColor = (name) => {
    addItem(colors, setColors, name, setColorIn);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const effectiveCat = catIsNew ? catNewVal.trim() : form.category;
    const effectiveSubcat = subcatIsNew ? subcatNewVal.trim() : form.subcategory;
    if (!effectiveCat) { setError('Escolhe ou cria uma categoria'); return; }
    if (!imageCover) { setError('A imagem de capa é obrigatória'); return; }
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      ['name','sku','brand','productGroup','material','composition',
       'weight','price','priceReseller','priceDiscount','currency','stock','lowStockThreshold',
       'summary','description'].forEach((k) => { if (form[k] !== '') fd.append(k, form[k]); });
      fd.append('category', effectiveCat);
      if (effectiveSubcat) fd.append('subcategory', effectiveSubcat);
      fd.append('active', String(form.active));
      fd.append('featured', String(form.featured));
      tags.forEach((t) => fd.append('tags', t));
      colors.forEach((c) => fd.append('colors', c));
      sizes.forEach((s) => fd.append('sizes', s));
      dimensions.forEach((d) => fd.append('dimensions', d));
      fd.append('imageCover', imageCover);
      extraImages.forEach((img) => fd.append('images', img));
      const created = await createProduct(fd);
      onCreated(created);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="admin__modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin__modal admin__modal--split">

        {/* ── Cabeçalho ── */}
        <div className="admin__modal-header">
          <h2 className="admin__modal-title">NOVO PRODUTO</h2>
          <button type="button" className="admin__modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Corpo: formulário esquerda + preview direita ── */}
        <div className="admin__modal-split-body">

          {/* ESQUERDA — formulário */}
          <div className="admin__modal-form-col">
            <form id="create-product-form" onSubmit={handleSubmit}>

              {/* ── 1. Nome ── */}
              <section className="admin__form-section">
                <p className="admin__form-section-title">IDENTIFICAÇÃO</p>
                <div className="admin__form-field">
                  <label className="admin__form-label">NOME <span className="admin__form-required">*</span></label>
                  <input className="admin__form-input" required maxLength={80} value={form.name} onChange={setField('name')} />
                </div>
              </section>

              {/* ── 2. Categoria ── */}
              <section className="admin__form-section">
                <p className="admin__form-section-title">CATEGORIA</p>
                <div className="admin__form-grid">
                  <div className="admin__form-field">
                    <label className="admin__form-label">CATEGORIA <span className="admin__form-required">*</span></label>
                    <CategoryDropdown
                      options={opts?.categories || []}
                      value={form.category}
                      isNew={catIsNew}
                      newValue={catNewVal}
                      onSelect={handleCatSelect}
                      onNewChange={setCatNewVal}
                      placeholder="Selecionar categoria…"
                      newLabel="Nova Categoria"
                      required
                    />
                  </div>
                  <div className="admin__form-field">
                    <label className="admin__form-label">SUBCATEGORIA</label>
                    <CategoryDropdown
                      options={subcatOptions}
                      value={form.subcategory}
                      isNew={subcatIsNew}
                      newValue={subcatNewVal}
                      onSelect={handleSubcatSelect}
                      onNewChange={setSubcatNewVal}
                      placeholder="Selecionar subcategoria…"
                      newLabel="Nova Subcategoria"
                    />
                  </div>
                </div>
              </section>

              {/* ── 3. Cores (picker visual) ── */}
              <section className="admin__form-section">
                <p className="admin__form-section-title">CORES</p>
                <ColorSwatchPicker selected={colors} onToggle={toggleColor} onAddCustom={handleAddCustomColor} />
                {colors.length > 0 && (
                  <div className="admin__cp-selected-tags">
                    {colors.map((c, i) => (
                      <span key={c} className="admin__tag">
                        <span
                          className="admin__tag-color-dot"
                          style={{ background: colorHex(c) }}
                        />
                        {c}
                        <button type="button" className="admin__tag-remove" onClick={() => removeItem(setColors, i)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="admin__form-field" style={{ marginTop: '10px' }}>
                  <label className="admin__form-label">COR PERSONALIZADA</label>
                  <TagInputField
                    id="colors"
                    list={[]}
                    onAdd={(v) => addItem(colors, setColors, v, setColorIn)}
                    onRemove={() => {}}
                    inputVal={colorIn}
                    onInputChange={setColorIn}
                    hints={opts?.colors?.filter((c) => !colors.includes(c)) || []}
                    placeholder="ex: azul-turquesa + Enter"
                  />
                </div>
              </section>

              {/* ── 4. Tamanhos & Dimensões ── */}
              <section className="admin__form-section">
                <p className="admin__form-section-title">TAMANHOS &amp; DIMENSÕES</p>
                <div className="admin__form-grid">
                  <div className="admin__form-field">
                    <label className="admin__form-label">TAMANHOS</label>
                    <TagInputField
                      id="sizes"
                      list={sizes}
                      onAdd={(v) => addItem(sizes, setSizes, v, setSizeIn)}
                      onRemove={(i) => removeItem(setSizes, i)}
                      inputVal={sizeIn}
                      onInputChange={setSizeIn}
                      hints={opts?.sizes || []}
                      placeholder="ex: casal"
                    />
                  </div>
                  <div className="admin__form-field">
                    <label className="admin__form-label">DIMENSÕES</label>
                    <TagInputField
                      id="dimensions"
                      list={dimensions}
                      onAdd={(v) => addItem(dimensions, setDimensions, v, setDimIn)}
                      onRemove={(i) => removeItem(setDimensions, i)}
                      inputVal={dimIn}
                      onInputChange={setDimIn}
                      hints={opts?.dimensions || []}
                      placeholder="ex: 240x260cm"
                    />
                  </div>
                </div>
              </section>

              {/* ── 5. SKU (auto-sugerido) ── */}
              <section className="admin__form-section">
                <p className="admin__form-section-title">SKU</p>
                <div className="admin__form-field">
                  <div className="admin__sku-label-row">
                    <label className="admin__form-label">
                      REFERÊNCIA (SKU)
                      {!skuTouched && form.sku && <span className="admin__sku-auto-badge">AUTO</span>}
                    </label>
                    {skuTouched && (
                      <button
                        type="button"
                        className="admin__sku-reset-btn"
                        onClick={() => setSkuTouched(false)}
                      >
                        ↩ gerar automaticamente
                      </button>
                    )}
                  </div>
                  <input
                    className={`admin__form-input${!skuTouched && form.sku ? ' admin__form-input--auto' : ''}`}
                    value={form.sku}
                    onChange={(e) => { setSkuTouched(true); setField('sku')(e); }}
                    placeholder="Preenche o nome, cor e tamanho para gerar…"
                  />
                  {!skuTouched && form.sku && (
                    <span className="admin__sku-hint">Gerado automaticamente — clica para editar</span>
                  )}
                </div>
              </section>

              {/* ── 6. Referência ── */}
              <section className="admin__form-section">
                <p className="admin__form-section-title">REFERÊNCIA</p>
                <div className="admin__form-grid">
                  <div className="admin__form-field">
                    <label className="admin__form-label">MARCA / FORNECEDOR</label>
                    {opts?.brands?.length > 0 && <datalist id="dl-brand">{opts.brands.map((b) => <option key={b} value={b} />)}</datalist>}
                    <input className="admin__form-input" list="dl-brand" value={form.brand} onChange={setField('brand')} />
                  </div>
                  <div className="admin__form-field">
                    <label className="admin__form-label">GRUPO DE PRODUTO</label>
                    <input className="admin__form-input" placeholder="ex: capa-de-edredao-em-linho" value={form.productGroup} onChange={setField('productGroup')} />
                  </div>
                </div>
              </section>

              {/* ── 7. Tags ── */}
              <section className="admin__form-section">
                <p className="admin__form-section-title">TAGS</p>
                <TagInputField
                  id="tags"
                  list={tags}
                  onAdd={(v) => addItem(tags, setTags, v, setTagIn)}
                  onRemove={(i) => removeItem(setTags, i)}
                  inputVal={tagIn}
                  onInputChange={setTagIn}
                  hints={opts?.tags || []}
                />
                <span className="admin__tag-hint">Enter ou vírgula para adicionar</span>
              </section>

              {/* ── 8. Detalhes Têxtil ── */}
              <section className="admin__form-section">
                <p className="admin__form-section-title">DETALHES TÊXTIL</p>
                <div className="admin__form-grid">
                  <div className="admin__form-field">
                    <label className="admin__form-label">MATERIAL</label>
                    {opts?.materials?.length > 0 && <datalist id="dl-mat">{opts.materials.map((m) => <option key={m} value={m} />)}</datalist>}
                    <input className="admin__form-input" list="dl-mat" placeholder="ex: 100% Algodão" value={form.material} onChange={setField('material')} />
                  </div>
                  <div className="admin__form-field">
                    <label className="admin__form-label">COMPOSIÇÃO</label>
                    <input className="admin__form-input" value={form.composition} onChange={setField('composition')} />
                  </div>
                  <div className="admin__form-field">
                    <label className="admin__form-label">PESO (GSM)</label>
                    <input className="admin__form-input" type="number" min="0" placeholder="ex: 200" value={form.weight} onChange={setField('weight')} />
                  </div>
                </div>
              </section>

              {/* ── Preços ── */}
              <section className="admin__form-section">
                <p className="admin__form-section-title">PREÇOS</p>
                <div className="admin__form-grid">
                  <div className="admin__form-field">
                    <label className="admin__form-label">PREÇO (PVP) <span className="admin__form-required">*</span></label>
                    <input className="admin__form-input" type="number" step="0.01" min="0" required value={form.price} onChange={setField('price')} />
                  </div>
                  <div className="admin__form-field">
                    <label className="admin__form-label">MOEDA</label>
                    <select className="admin__form-select" value={form.currency} onChange={setField('currency')}>
                      <option value="EUR">EUR — Euro</option>
                      <option value="USD">USD — Dólar</option>
                      <option value="GBP">GBP — Libra</option>
                    </select>
                  </div>
                  <div className="admin__form-field">
                    <label className="admin__form-label">PREÇO REVENDEDOR</label>
                    <input className="admin__form-input" type="number" step="0.01" min="0" value={form.priceReseller} onChange={setField('priceReseller')} />
                  </div>
                  <div className="admin__form-field">
                    <label className="admin__form-label">PREÇO DESCONTO</label>
                    <input className="admin__form-input" type="number" step="0.01" min="0" value={form.priceDiscount} onChange={setField('priceDiscount')} />
                  </div>
                </div>
              </section>

              {/* ── Stock ── */}
              <section className="admin__form-section">
                <p className="admin__form-section-title">STOCK</p>
                <div className="admin__form-grid">
                  <div className="admin__form-field">
                    <label className="admin__form-label">QUANTIDADE EM STOCK <span className="admin__form-required">*</span></label>
                    <input className="admin__form-input" type="number" min="0" required value={form.stock} onChange={setField('stock')} />
                  </div>
                  <div className="admin__form-field">
                    <label className="admin__form-label">MÍNIMO (ALERTA STOCK BAIXO)</label>
                    <input className="admin__form-input" type="number" min="0" value={form.lowStockThreshold} onChange={setField('lowStockThreshold')} />
                  </div>
                </div>
              </section>

              {/* ── Descrição ── */}
              <section className="admin__form-section">
                <p className="admin__form-section-title">DESCRIÇÃO</p>
                <div className="admin__form-grid">
                  <div className="admin__form-field admin__form-field--full">
                    <label className="admin__form-label">RESUMO <span className="admin__form-required">*</span></label>
                    <textarea className="admin__form-input admin__form-input--textarea" required rows={3} value={form.summary} onChange={setField('summary')} />
                  </div>
                  <div className="admin__form-field admin__form-field--full">
                    <label className="admin__form-label">DESCRIÇÃO COMPLETA</label>
                    <textarea className="admin__form-input admin__form-input--textarea" rows={5} value={form.description} onChange={setField('description')} />
                  </div>
                </div>
              </section>

              {/* ── Imagens ── */}
              <section className="admin__form-section">
                <p className="admin__form-section-title">IMAGENS</p>
                <div className="admin__form-grid">
                  <div className="admin__form-field">
                    <label className="admin__form-label">IMAGEM DE CAPA <span className="admin__form-required">*</span></label>
                    <div className="admin__file-input-wrap">
                      <input type="file" accept="image/*" className="admin__file-input" onChange={(e) => setImageCover(e.target.files[0] || null)} />
                      {imageCover
                        ? <span className="admin__file-name">✓ {imageCover.name}</span>
                        : <span className="admin__file-label">Clique para selecionar</span>
                      }
                    </div>
                  </div>
                  <div className="admin__form-field">
                    <label className="admin__form-label">IMAGENS ADICIONAIS (máx. 10)</label>
                    <div className="admin__file-input-wrap">
                      <input type="file" accept="image/*" multiple className="admin__file-input" onChange={(e) => setExtraImages(Array.from(e.target.files))} />
                      {extraImages.length > 0
                        ? <span className="admin__file-name">✓ {extraImages.length} ficheiro{extraImages.length !== 1 ? 's' : ''}</span>
                        : <span className="admin__file-label">Clique para selecionar (múltiplos)</span>
                      }
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Visibilidade ── */}
              <section className="admin__form-section">
                <p className="admin__form-section-title">VISIBILIDADE</p>
                <div className="admin__form-checkboxes">
                  <label className="admin__form-checkbox-row">
                    <input type="checkbox" checked={form.active} onChange={setField('active')} />
                    <span className="admin__form-checkbox-label">PRODUTO ATIVO (visível na loja)</span>
                  </label>
                  <label className="admin__form-checkbox-row">
                    <input type="checkbox" checked={form.featured} onChange={setField('featured')} />
                    <span className="admin__form-checkbox-label">EM DESTAQUE (homepage)</span>
                  </label>
                </div>
              </section>

            </form>
          </div>

          {/* DIREITA — preview ao vivo */}
          <div className="admin__modal-preview-col">
            <p className="admin__preview-title">PRÉ-VISUALIZAÇÃO</p>
            <p className="admin__preview-subtitle">Como aparecerá na loja</p>
            <div className="admin__preview-card-wrap">
              <ProductCardPreview
                form={form}
                colors={colors}
                sizes={sizes}
                dimensions={dimensions}
                imageCoverUrl={imageCoverUrl}
              />
            </div>
          </div>
        </div>

        {/* ── Footer (fora do split, fixo na base do modal) ── */}
        {error && <p className="admin__modal-error admin__modal-error--footer">{error}</p>}
        <div className="admin__modal-footer">
          <button type="button" className="admin__btn admin__btn--ghost" onClick={onClose} disabled={saving}>
            CANCELAR
          </button>
          <button type="submit" form="create-product-form" className="admin__btn admin__btn--primary" disabled={saving}>
            {saving ? 'A CRIAR…' : 'CRIAR PRODUTO'}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Tab: Produtos (accordion agrupado)
───────────────────────────────────── */
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchAllProductsAdmin()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStockSave = async (id, val) => {
    try {
      const updated = await updateProduct(id, { stock: val });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, stock: updated.stock } : p))
      );
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const families = useMemo(() => {
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase())
    );
    return groupAdminProducts(filtered);
  }, [products, search]);

  if (loading) return <TabLoader />;
  if (error) return <TabError message={error} />;

  return (
    <div className="admin__tab">
      <div className="admin__tab-header">
        <h2 className="admin__tab-title">PRODUTOS ({products.length})</h2>
        <div className="admin__tab-actions">
          <button
            className="admin__btn admin__btn--primary"
            onClick={() => setShowCreate(true)}
          >
            + NOVO PRODUTO
          </button>
          <input
            className="admin__search"
            type="text"
            placeholder="Pesquisar por nome ou SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {showCreate && (
        <CreateProductModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { load(); setShowCreate(false); }}
          allProducts={products}
        />
      )}

      <div className="admin__product-groups">
        {families.map((family) => (
          <ProductGroupAccordion
            key={family.familyName}
            family={family}
            onStockSave={handleStockSave}
            onDelete={handleDelete}
          />
        ))}
        {families.length === 0 && (
          <p className="admin__empty">Sem produtos.</p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Tab: Encomendas
───────────────────────────────────── */
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetchAllOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id, status) => {
    setSaving(id);
    try {
      const updated = await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: updated.status } : o)));
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(null);
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      (o.user?.name || '').toLowerCase().includes(q) ||
      (o.user?.email || '').toLowerCase().includes(q)
    );
  });

  if (loading) return <TabLoader />;
  if (error) return <TabError message={error} />;

  return (
    <div className="admin__tab">
      <div className="admin__tab-header">
        <h2 className="admin__tab-title">ENCOMENDAS ({orders.length})</h2>
        <input
          className="admin__search"
          type="text"
          placeholder="Pesquisar por ref., cliente ou e-mail…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>REF.</th>
              <th>DATA</th>
              <th>CLIENTE</th>
              <th>ARTIGOS</th>
              <th>TOTAL</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o._id}>
                <td className="admin__mono">{o._id.slice(-8).toUpperCase()}</td>
                <td>{new Date(o.createdAt).toLocaleDateString('pt-PT')}</td>
                <td>
                  <span>{o.user?.name || 'Utilizador removido'}</span>
                  {o.user?.email && (
                    <span className="admin__sub-text">{o.user.email}</span>
                  )}
                </td>
                <td>{o.items?.length ?? o.orderItems?.length ?? '—'}</td>
                <td>{o.totalPrice?.toFixed(2)} €</td>
                <td>
                  <select
                    className={`admin__select admin__select--status admin__status--${o.status}`}
                    value={o.status}
                    disabled={saving === o._id}
                    onChange={(e) => handleStatusChange(o._id, e.target.value)}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="admin__empty-row">Sem encomendas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Componentes auxiliares
───────────────────────────────────── */
function StatCard({ label, value, sub }) {
  return (
    <div className="admin__stat-card">
      <p className="admin__stat-label">{label}</p>
      <p className="admin__stat-value">{value}</p>
      {sub && <p className="admin__stat-sub">{sub}</p>}
    </div>
  );
}

function TabLoader() {
  return <div className="admin__loader">A carregar…</div>;
}

function TabError({ message }) {
  return <div className="admin__error">Erro: {message}</div>;
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

const NAV_ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-1a7 7 0 0 1 14 0v1" />
      <path d="M22 21v-1a5 5 0 0 0-5-5" />
      <circle cx="19" cy="7" r="3" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
      <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  ),
};
