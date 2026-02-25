import ProductCard from './ProductCard';
import './ProductGrid.css';

export default function ProductGrid({ products, view = 'grid' }) {
  if (!products || products.length === 0) {
    return (
      <div className="product-grid__empty">
        <p>Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <div className={`product-grid product-grid--${view}`}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} view={view} />
      ))}
    </div>
  );
}
