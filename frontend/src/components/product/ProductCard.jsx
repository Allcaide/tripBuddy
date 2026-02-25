import { Link } from 'react-router-dom';
import ColorSwatches from './ColorSwatches';
import './ProductCard.css';

export default function ProductCard({ product, view = 'grid' }) {
  const {
    slug,
    name,
    price,
    priceDiscount,
    imageCover,
    colors = [],
    brand,
    sizes = [],
  } = product;

  const imgSrc = `/img/products/${imageCover}`;
  const hasRange = sizes.length > 1;

  return (
    <article className={`product-card product-card--${view}`}>
      <Link to={`/product/${slug}`} className="product-card__image-link">
        <div className="product-card__image-wrap">
          <img
            src={imgSrc}
            alt={name}
            className="product-card__image"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="product-card__info">
        <Link to={`/product/${slug}`} className="product-card__name">
          {name.toUpperCase()}
        </Link>

        {brand && (
          <span className="product-card__brand">{brand}</span>
        )}

        <div className="product-card__price">
          {priceDiscount ? (
            <>
              <span className="product-card__price--old">
                {price.toFixed(2)} €
              </span>
              <span className="product-card__price--sale">
                {priceDiscount.toFixed(2)} €
              </span>
            </>
          ) : (
            <span>
              {hasRange
                ? `${price.toFixed(2)} €`
                : `${price.toFixed(2)} €`}
            </span>
          )}
        </div>

        {colors.length > 0 && <ColorSwatches colors={colors} />}
      </div>
    </article>
  );
}
