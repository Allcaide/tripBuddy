import { Link } from 'react-router-dom';
import './Breadcrumbs.css';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="breadcrumbs__item">
          {i > 0 && <span className="breadcrumbs__sep">›</span>}
          {item.to ? (
            <Link to={item.to} className="breadcrumbs__link">
              {item.label}
            </Link>
          ) : (
            <span className="breadcrumbs__current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
