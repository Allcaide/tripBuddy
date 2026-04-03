import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

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

/**
 * Recebe um grupo de variantes (output de groupProductVariants):
 *   baseName, variants[], allColors[], minPrice, maxPrice
 *
 * Comportamento:
 *   - Tamanho/variante: botões inline — muda preço e imagem se o variante tiver fotos diferentes
 *   - Cor: swatches — muda para o variante que tem essa cor (se existir como produto separado)
 */
export default function ProductCard({ group, view = 'grid' }) {
  const { baseName, variants, allColors } = group;

  // Track active variant by ID — survives re-sorts
  const [activeVariantId, setActiveVariantId] = useState(variants[0]?._id);
  const active = variants.find((v) => v._id === activeVariantId) || variants[0];

  // Current active color derived from the selected variant
  const activeColor = active.colors?.[0] || allColors[0];

  // Size buttons only show variants that match the active color
  const colorVariants = activeColor
    ? variants.filter((v) => v.colors?.includes(activeColor))
    : variants;

  // Price range for the current color's variants
  const colorPrices = colorVariants.map((v) => v.price);
  const colorMin = Math.min(...colorPrices);
  const colorMax = Math.max(...colorPrices);
  const hasRange = colorMin !== colorMax;

  const handleColorSelect = (color) => {
    const v = variants.find((vv) => vv.colors?.includes(color));
    if (v) setActiveVariantId(v._id);
  };

  return (
    <article className={`product-card product-card--${view}`}>
      {/* Imagem — muda ao selecionar variante */}
      <Link to={`/product/${active.slug}`} className="product-card__image-link">
        <div className="product-card__image-wrap">
          <img
            src={`/img/products/${active.imageCover}`}
            alt={baseName}
            className="product-card__image"
            loading="lazy"
          />
          {active.priceDiscount && (
            <span className="product-card__badge">SALE</span>
          )}
        </div>
      </Link>

      <div className="product-card__info">
        <Link to={`/product/${active.slug}`} className="product-card__name">
          {baseName.toUpperCase()}
        </Link>

        {/* Preço: mostra range da cor activa */}
        <div className="product-card__price">
          {active.priceDiscount ? (
            <>
              <span className="product-card__price--old">{active.price.toFixed(2)} €</span>
              <span className="product-card__price--sale">{active.priceDiscount.toFixed(2)} €</span>
            </>
          ) : hasRange ? (
            <span>{colorMin.toFixed(2)} € – {colorMax.toFixed(2)} €</span>
          ) : (
            <span>{active.price.toFixed(2)} €</span>
          )}
        </div>

        {/* Seletor de tamanho — apenas variantes da cor activa */}
        {colorVariants.length > 1 && (
          <div className="product-card__sizes">
            {colorVariants.map((v) => (
              <button
                key={v._id}
                className={`product-card__size-btn ${v._id === activeVariantId ? 'product-card__size-btn--active' : ''}`}
                onClick={() => setActiveVariantId(v._id)}
                title={`${v.variantLabel || v.name} — ${v.price.toFixed(2)} €`}
              >
                {(v.variantLabel || v.sizes?.[0] || v.name).replace(/ cm$/i, '')}
              </button>
            ))}
          </div>
        )}

        {/* Swatches de cor — clicar muda para o variante mais barato dessa cor */}
        {allColors.length > 0 && (
          <div className="product-card__colors">
            {allColors.map((color) => {
              const hex = colorToHex(color);
              const light = isLightColor(hex);
              const isActive = color === activeColor;
              return (
                <button
                  key={color}
                  className={`product-card__color-dot ${isActive ? 'product-card__color-dot--active' : ''}`}
                  style={{
                    background: hex,
                    border: light ? '1px solid #ccc' : '1px solid transparent',
                  }}
                  title={color}
                  onClick={() => handleColorSelect(color)}
                  aria-label={`Cor ${color}`}
                />
              );
            })}
            {allColors.length > 1 && (
              <span className="product-card__color-count">{allColors.length} cores</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
