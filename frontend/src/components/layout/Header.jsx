import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
            <>
              <Link to="/account" className="header__action-btn header__user-name">
                {user.name.split(' ')[0].toUpperCase()}
              </Link>
              <button className="header__action-btn" onClick={handleLogout}>
                LOG OUT
              </button>
            </>
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
