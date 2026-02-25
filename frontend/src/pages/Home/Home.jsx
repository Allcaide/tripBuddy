import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllProducts, groupByCategoryAndSub } from '../../api/products';
import ProductGrid from '../../components/product/ProductGrid';
import './Home.css';

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

export default function Home() {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProducts()
      .then((products) => setGrouped(groupByCategoryAndSub(products)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="home__loading">A carregar…</div>;
  }

  const categories = Object.keys(grouped);

  return (
    <div className="home">
      {/* Hero */}
      <section className="home__hero">
        <div className="home__hero-content">
          <h1 className="home__hero-title">MIL FIOS</h1>
          <p className="home__hero-subtitle">Têxteis Premium</p>
          <p className="home__hero-desc">
            Qualidade e design para a sua casa — as melhores marcas, curadas para si.
          </p>
        </div>
      </section>

      {/* Categories preview */}
      {categories.map((category) => {
        const subcategories = grouped[category];
        const allProducts = Object.values(subcategories).flat();
        const preview = allProducts.slice(0, 3);
        const catSlug = slugify(category);

        return (
          <section key={category} className="home__category">
            <div className="home__category-header">
              <h2 className="home__category-title">{category.toUpperCase()}</h2>
              <Link to={`/category/${catSlug}`} className="home__category-link">
                VER TUDO →
              </Link>
            </div>

            <ProductGrid products={preview} view="grid" />
          </section>
        );
      })}
    </div>
  );
}
