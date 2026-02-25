import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAllProducts, groupByCategoryAndSub } from '../../api/products';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import SubcategoryTabs from '../../components/ui/SubcategoryTabs';
import ViewControls from '../../components/ui/ViewControls';
import ProductGrid from '../../components/product/ProductGrid';
import './Category.css';

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

function unslugify(slug) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function CategoryPage() {
  const { categorySlug, subcategorySlug } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [sort, setSort] = useState('');

  // Fetch all products once
  useEffect(() => {
    fetchAllProducts()
      .then(setAllProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Group + filter
  const grouped = useMemo(
    () => groupByCategoryAndSub(allProducts),
    [allProducts],
  );

  // Find the matching category (slug comparison)
  const matchedCategory = useMemo(() => {
    return Object.keys(grouped).find(
      (cat) => slugify(cat) === categorySlug,
    );
  }, [grouped, categorySlug]);

  const subcategories = matchedCategory ? grouped[matchedCategory] : {};
  const subcategoryNames = Object.keys(subcategories);

  // Build tabs: "VER TUDO" + each subcategory
  const tabs = useMemo(() => {
    const base = [
      {
        slug: 'all',
        label: 'VER TUDO',
        to: `/category/${categorySlug}`,
      },
    ];
    subcategoryNames.forEach((sub) => {
      const subSlug = slugify(sub);
      base.push({
        slug: subSlug,
        label: sub.toUpperCase(),
        to: `/category/${categorySlug}/${subSlug}`,
      });
    });
    return base;
  }, [categorySlug, subcategoryNames]);

  // Active tab
  const activeTab = subcategorySlug || 'all';

  // Filter products by subcategory
  const filteredProducts = useMemo(() => {
    if (!matchedCategory) return [];
    if (!subcategorySlug || subcategorySlug === 'all') {
      return Object.values(subcategories).flat();
    }
    const matchedSub = subcategoryNames.find(
      (s) => slugify(s) === subcategorySlug,
    );
    return matchedSub ? subcategories[matchedSub] : [];
  }, [matchedCategory, subcategorySlug, subcategories, subcategoryNames]);

  // Sort
  const sortedProducts = useMemo(() => {
    if (!sort) return filteredProducts;
    const sorted = [...filteredProducts];
    const desc = sort.startsWith('-');
    const field = desc ? sort.slice(1) : sort;
    sorted.sort((a, b) => {
      const va = a[field] ?? 0;
      const vb = b[field] ?? 0;
      return desc ? vb - va : va - vb;
    });
    return sorted;
  }, [filteredProducts, sort]);

  // Breadcrumbs
  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: 'HOME', to: '/' },
    ];
    if (matchedCategory) {
      if (subcategorySlug) {
        items.push({
          label: matchedCategory.toUpperCase(),
          to: `/category/${categorySlug}`,
        });
        items.push({
          label: unslugify(subcategorySlug).toUpperCase(),
        });
      } else {
        items.push({ label: matchedCategory.toUpperCase() });
      }
    }
    return items;
  }, [matchedCategory, categorySlug, subcategorySlug]);

  if (loading) {
    return <div className="category__loading">A carregar…</div>;
  }

  if (!matchedCategory) {
    return (
      <div className="category__empty">
        <h2>Categoria não encontrada</h2>
        <p>"{unslugify(categorySlug)}" não existe.</p>
      </div>
    );
  }

  return (
    <div className="category">
      <Breadcrumbs items={breadcrumbItems} />

      <SubcategoryTabs items={tabs} active={activeTab} />

      <ViewControls
        view={view}
        onViewChange={setView}
        onSortChange={setSort}
      />

      <ProductGrid products={sortedProducts} view={view} />
    </div>
  );
}
