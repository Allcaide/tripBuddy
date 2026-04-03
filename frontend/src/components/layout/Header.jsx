import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

function UserAvatarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export default function Header() {
  const { isAuthenticated, user } = useAuth();

  const accountPath = user?.role === 'admin' ? '/admin' : '/account';

  return (
    <header className="header">
      <div className="header__top">
        {/* Hamburger */}
        <button className="header__menu-btn" aria-label="Menu">
          <span /><span /><span />
        </button>

        {/* Logo */}
        <Link to="/" className="header__logo">
          MIL FIOS
        </Link>

        {/* Right actions */}
        <nav className="header__actions">
          <button className="header__action-btn">SEARCH</button>

          {isAuthenticated ? (
            <Link
              to={accountPath}
              className="header__action-btn header__avatar-btn"
              title={user?.role === 'admin' ? 'Painel Admin' : 'A minha conta'}
              aria-label="A minha conta"
            >
              <UserAvatarIcon />
              {user?.role === 'admin' && (
                <span className="header__admin-dot" aria-hidden="true" />
              )}
            </Link>
          ) : (
            <Link to="/login" className="header__action-btn">LOG IN</Link>
          )}

          <button className="header__action-btn">HELP</button>
          <Link to="/cart" className="header__action-btn">BASKET (0)</Link>
        </nav>
      </div>
    </header>
  );
}
