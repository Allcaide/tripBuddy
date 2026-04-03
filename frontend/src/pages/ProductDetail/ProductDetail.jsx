import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAllProducts, groupProductVariants } from '../../api/products';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import './ProductDetail.css';

/* ── Color helpers (sincronizados com ProductCard) ── */
const COLOR_MAP = {
  'beige natural': '#C8B9A6',
  beige: '#C8B9A6',
  bege: '#C8B9A6',
  linho: '#C8B9A6',
  branco: '#F5F5F0',
  white: '#F5F5F0',
  'off-white': '#F0EDE8',
  creme: '#FFF8E7',
  areia: '#D4C5A9',
  cinza: '#999999',
  grey: '#999999',
  'cinza-claro': '#C0C0C0',
  'cinza-escuro': '#555555',
  preto: '#1a1a1a',
  black: '#1a1a1a',
  'azul-marinho': '#1B2A4A',
  navy: '#1B2A4A',
  azul: '#4A90D9',
  'azul-claro': '#A8C8E0',
  verde: '#5C7A5C',
  'verde-salva': '#8FAE8F',
  'verde-escuro': '#2D4A2D',
  rosa: '#D4A5A5',
  terracota: '#C87941',
  mostarda: '#C4A535',
  castanho: '#8B6540',
  nude: '#D4B9A0',
  camel: '#C4A36C',
  dourado: '#B8943E',
};

function colorToHex(name) {
  const key = name.toLowerCase().trim().replace(/\s+/g, '-');
  if (/^#?[0-9a-f]{6}$/i.test(key)) return key.startsWith('#') ? key : `#${key}`;
  return COLOR_MAP[key] || '#ccc';
}

function isLightColor(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 210;
}

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [group, setGroup] = useState(null);
  // Track active variant by ID — survives group re-sorts
  const [activeVariantId, setActiveVariantId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [colorError, setColorError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cache para não ir buscar tudo outra vez ao mudar de slug dentro do mesmo grupo
  const groupsCache = useRef(null);

  useEffect(() => {
    // Se já temos o cache e o grupo actual contém o novo slug, apenas muda o activeVariantId
    if (groupsCache.current) {
      const found = groupsCache.current.find((g) => g.variants.some((v) => v.slug === slug));
      if (found) {
        setGroup(found);
        const v = found.variants.find((v) => v.slug === slug);
        setActiveVariantId(v?._id || found.variants[0]._id);
        setSelectedImage(0);
        return;
      }
    }

    setLoading(true);
    fetchAllProducts()
      .then((products) => {
        const groups = groupProductVariants(products);
        groupsCache.current = groups;
        const found = groups.find((g) => g.variants.some((v) => v.slug === slug));
        if (found) {
          setGroup(found);
          const v = found.variants.find((v) => v.slug === slug);
          setActiveVariantId(v?._id || found.variants[0]._id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  // Resetar galeria ao mudar de variante
  useEffect(() => {
    setSelectedImage(0);
  }, [activeVariantId]);

  if (loading) return <div className="pdp__loading">A carregar…</div>;
  if (!group) return <div className="pdp__empty">Produto não encontrado.</div>;

  const active = group.variants.find((v) => v._id === activeVariantId) || group.variants[0];
  const allImages = [active.imageCover, ...(active.images || [])];

  // Cor activa = primeira cor do variante seleccionado
  const activeColor = active.colors?.[0] || group.allColors[0];

  // Variantes visíveis na lista de tamanhos = só os que têm a cor activa
  const colorVariants = activeColor
    ? group.variants.filter((v) => v.colors?.includes(activeColor))
    : group.variants;

  // Range de preço para a cor activa
  const colorPrices = colorVariants.map((v) => v.price);
  const colorMin = Math.min(...colorPrices);
  const colorMax = Math.max(...colorPrices);
  const hasRange = colorMin !== colorMax;

  const needsColor = group.allColors.length > 1;

  // Mudar variante (tamanho)
  const handleVariantSelect = (variantId) => {
    setActiveVariantId(variantId);
    setColorError(false);
  };

  // Mudar cor → salta para o variante mais barato dessa cor
  const handleColorSelect = (color) => {
    const byColor = group.variants.filter((v) => v.colors?.includes(color));
    if (byColor.length > 0) {
      // Manter o mesmo tamanho se existir nessa cor, senão o mais barato
      const sameSize = byColor.find((v) => v.variantLabel === active.variantLabel);
      setActiveVariantId((sameSize || byColor[0])._id);
      setColorError(false);
    }
  };

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'HOME', to: '/' },
    {
      label: (active.category || '').toUpperCase(),
      to: `/category/${slugify(active.category || '')}`,
    },
  ];
  if (active.subcategory) {
    breadcrumbs.push({
      label: active.subcategory.toUpperCase(),
      to: `/category/${slugify(active.category || '')}/${slugify(active.subcategory)}`,
    });
  }
  breadcrumbs.push({ label: group.baseName.toUpperCase() });

  const handleAddToCart = () => {
    if (needsColor && !active.colors?.length) {
      setColorError(true);
      return;
    }
    // TODO: integrar com cartController
    alert(`Adicionado: ${active.name}`);
  };

  return (
    <div className="pdp">
      <Breadcrumbs items={breadcrumbs} />

      <div className="pdp__content">
        {/* ── Galeria ── */}
        <div className="pdp__gallery">
          <div className="pdp__thumbnails">
            {allImages.map((img, i) => (
              <button
                key={`${active._id}-${img}`}
                className={`pdp__thumb ${i === selectedImage ? 'pdp__thumb--active' : ''}`}
                onClick={() => setSelectedImage(i)}
                aria-label={`Ver imagem ${i + 1}`}
              >
                <img src={`/img/products/${img}`} alt={`${active.name} ${i + 1}`} />
              </button>
            ))}
          </div>
          <div className="pdp__main-image">
            <img src={`/img/products/${allImages[selectedImage]}`} alt={active.name} />
          </div>
        </div>

        {/* ── Info ── */}
        <div className="pdp__info">
          {/* Nome base (sem o " — King" etc.) */}
          <h1 className="pdp__name">{group.baseName.toUpperCase()}</h1>

          {active.brand && <p className="pdp__brand">{active.brand}</p>}

          {/* Preço: range da cor activa */}
          <p className="pdp__price">
            {active.priceDiscount ? (
              <>
                <span className="pdp__price--old">{active.price.toFixed(2)} €</span>
                <span className="pdp__price--sale">{active.priceDiscount.toFixed(2)} €</span>
              </>
            ) : hasRange ? (
              <span>{colorMin.toFixed(2)} € – {colorMax.toFixed(2)} €</span>
            ) : (
              <span>{active.price.toFixed(2)} €</span>
            )}
          </p>

          {/* ── Seletor de COR (cross-variante) ── */}
          {group.allColors.length > 0 && (
            <div className={`pdp__section ${colorError ? 'pdp__section--error' : ''}`}>
              <div className="pdp__label-row">
                <span className="pdp__label">COR</span>
                {active.colors?.length > 0 && (
                  <span className="pdp__selected-value">{active.colors[0]}</span>
                )}
              </div>
              <div className="pdp__color-swatches">
                {group.allColors.map((color) => {
                  const hex = colorToHex(color);
                  const light = isLightColor(hex);
                  const isActive = color === activeColor;
                  return (
                    <button
                      key={color}
                      className={`pdp__color-btn ${isActive ? 'pdp__color-btn--active' : ''}`}
                      style={{ background: hex, border: light ? '1px solid #ccc' : 'none' }}
                      onClick={() => handleColorSelect(color)}
                      title={color}
                      aria-label={`Cor ${color}`}
                    />
                  );
                })}
              </div>
              {colorError && (
                <p className="pdp__field-error">Por favor selecione uma cor</p>
              )}
            </div>
          )}

          {/* Lista de tamanhos estilo Zara — mostra apenas os da cor activa */}
          {colorVariants.length > 1 && (
            <div className="pdp__section">
              <span className="pdp__label">TAMANHO</span>
              <div className="pdp__size-list">
                {colorVariants.map((v) => {
                  const dimLabel = v.dimensions?.[0] || v.variantLabel || v.name;
                  return (
                    <button
                      key={v._id}
                      className={`pdp__size-row ${v._id === activeVariantId ? 'pdp__size-row--active' : ''}`}
                      onClick={() => handleVariantSelect(v._id)}
                    >
                      <span className="pdp__size-row__label">{dimLabel}</span>
                      <span className="pdp__size-row__price">
                        {v.priceDiscount ? (
                          <>
                            <s className="pdp__size-row__price--old">{v.price.toFixed(2)} €</s>
                            {' '}
                            <span className="pdp__size-row__price--sale">{v.priceDiscount.toFixed(2)} €</span>
                          </>
                        ) : (
                          `${v.price.toFixed(2)} €`
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tamanhos dentro de 1 produto (ex: S/M/L vestuario) */}
          {colorVariants.length === 1 && active.sizes?.length > 0 && (
            <div className="pdp__section">
              <span className="pdp__label">TAMANHO</span>
              <div className="pdp__sizes">
                {active.sizes.map((size) => (
                  <button key={size} className="pdp__size-btn">
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Botão Adicionar ao Cesto ── */}
          <button
            className="pdp__add-btn"
            disabled={!active.stock || active.stock <= 0}
            onClick={handleAddToCart}
          >
            {active.stock > 0 ? 'ADICIONAR AO CESTO' : 'ESGOTADO'}
          </button>

          {active.sku && <p className="pdp__sku">REF. {active.sku}</p>}

          {/* ── Descrição ── */}
          <div className="pdp__section">
            <span className="pdp__label">DESCRIÇÃO</span>
            <p className="pdp__description">{active.summary}</p>
          </div>

          {active.description && (
            <div className="pdp__section">
              <span className="pdp__label">DETALHES</span>
              <p className="pdp__description">{active.description}</p>
            </div>
          )}

          {active.material && (
            <div className="pdp__section">
              <span className="pdp__label">COMPOSIÇÃO</span>
              <p className="pdp__detail-text">
                {active.composition || active.material}
                {active.weight ? ` — ${active.weight} g/m²` : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
