import { Link } from 'react-router-dom';
import './SubcategoryTabs.css';

export default function SubcategoryTabs({ items, active }) {
  return (
    <nav className="subcategory-tabs">
      {items.map((item) => (
        <Link
          key={item.slug}
          to={item.to}
          className={`subcategory-tabs__item ${
            active === item.slug ? 'subcategory-tabs__item--active' : ''
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
