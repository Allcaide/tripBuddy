import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductBySlug } from '../../api/products';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import ColorSwatches from '../../components/product/ColorSwatches';
import './ProductDetail.css';

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchProductBySlug(slug)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="pdp__loading">A carregar…</div>;
  }

  if (!product) {
    return <div className="pdp__empty">Produto não encontrado.</div>;
  }

  const allImages = [
    product.imageCover,
    ...(product.images || []),
  ];

  const breadcrumbs = [
    { label: 'HOME', to: '/' },
    {
      label: (product.category || '').toUpperCase(),
      to: `/category/${slugify(product.category || '')}`,
    },
  ];
  if (product.subcategory) {
    breadcrumbs.push({
      label: product.subcategory.toUpperCase(),
      to: `/category/${slugify(product.category || '')}/${slugify(product.subcategory)}`,
    });
  }
  breadcrumbs.push({ label: product.name.toUpperCase() });

  return (
    <div className="pdp">
      <Breadcrumbs items={breadcrumbs} />

      <div className="pdp__content">
        {/* Image gallery */}
        <div className="pdp__gallery">
          <div className="pdp__thumbnails">
            {allImages.map((img, i) => (
              <button
                key={img}
                className={`pdp__thumb ${i === selectedImage ? 'pdp__thumb--active' : ''}`}
                onClick={() => setSelectedImage(i)}
              >
                <img
                  src={`/img/products/${img}`}
                  alt={`${product.name} ${i + 1}`}
                />
              </button>
            ))}
          </div>
          <div className="pdp__main-image">
            <img
              src={`/img/products/${allImages[selectedImage]}`}
              alt={product.name}
            />
          </div>
        </div>

        {/* Product info */}
        <div className="pdp__info">
          <h1 className="pdp__name">{product.name.toUpperCase()}</h1>

          {product.brand && (
            <p className="pdp__brand">{product.brand}</p>
          )}

          <p className="pdp__price">
            {product.priceDiscount ? (
              <>
                <span className="pdp__price--old">
                  {product.price.toFixed(2)} €
                </span>
                <span className="pdp__price--sale">
                  {product.priceDiscount.toFixed(2)} €
                </span>
              </>
            ) : (
              <span>{product.price.toFixed(2)} €</span>
            )}
          </p>

          {product.colors?.length > 0 && (
            <div className="pdp__section">
              <span className="pdp__label">COR</span>
              <ColorSwatches colors={product.colors} />
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="pdp__section">
              <span className="pdp__label">TAMANHO</span>
              <div className="pdp__sizes">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`pdp__size-btn ${selectedSize === size ? 'pdp__size-btn--active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.dimensions?.length > 0 && (
            <div className="pdp__section">
              <span className="pdp__label">DIMENSÕES</span>
              <p className="pdp__detail-text">
                {product.dimensions.join(' / ')}
              </p>
            </div>
          )}

          <button
            className="pdp__add-btn"
            disabled={!product.stock || product.stock <= 0}
          >
            {product.stock > 0 ? 'ADICIONAR AO CESTO' : 'ESGOTADO'}
          </button>

          {product.sku && (
            <p className="pdp__sku">REF. {product.sku}</p>
          )}

          <div className="pdp__section">
            <span className="pdp__label">DESCRIÇÃO</span>
            <p className="pdp__description">{product.summary}</p>
          </div>

          {product.description && (
            <div className="pdp__section">
              <span className="pdp__label">DETALHES</span>
              <p className="pdp__description">{product.description}</p>
            </div>
          )}

          {product.material && (
            <div className="pdp__section">
              <span className="pdp__label">COMPOSIÇÃO</span>
              <p className="pdp__detail-text">
                {product.composition || product.material}
                {product.weight ? ` — ${product.weight} g/m²` : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
