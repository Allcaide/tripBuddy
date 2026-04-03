import ProductCard from './ProductCard';
import './ProductGrid.css';

export default function ProductGrid({ groups, view = 'grid' }) {
  if (!groups || groups.length === 0) {
    return (
      <div className="product-grid__empty">
        <p>Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <div className={`product-grid product-grid--${view}`}>
      {groups.map((group) => (
        <ProductCard key={group.baseName} group={group} view={view} />
      ))}
    </div>
  );
}
