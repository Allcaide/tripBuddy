import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Account.css';

const TABS = [
  { id: 'profile', label: 'O MEU PERFIL' },
  { id: 'orders', label: 'ENCOMENDAS' },
  { id: 'password', label: 'PALAVRA-PASSE' },
];

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="account">
      {/* Cabeçalho da página */}
      <div className="account__header">
        <h1 className="account__title">A MINHA CONTA</h1>
        <p className="account__welcome">
          Bem-vindo, <strong>{user.name.split(' ')[0]}</strong>
        </p>
      </div>

      {/* Tabs de navegação */}
      <nav className="account__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`account__tab ${activeTab === tab.id ? 'account__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Conteúdo */}
      <div className="account__content">
        {activeTab === 'profile' && <ProfileTab user={user} />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'password' && <PasswordTab />}
      </div>

      {/* Logout */}
      <div className="account__footer">
        <button className="account__logout-btn" onClick={handleLogout}>
          TERMINAR SESSÃO
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Tab: Perfil
───────────────────────────────────── */
function ProfileTab({ user }) {
  return (
    <div className="account__section">
      <h2 className="account__section-title">INFORMAÇÕES PESSOAIS</h2>

      <div className="account__field-row">
        <div className="account__field">
          <span className="account__field-label">Nome</span>
          <span className="account__field-value">{user.name}</span>
        </div>
        <div className="account__field">
          <span className="account__field-label">E-mail</span>
          <span className="account__field-value">{user.email}</span>
        </div>
      </div>

      <div className="account__field-row">
        <div className="account__field">
          <span className="account__field-label">Tipo de conta</span>
          <span className="account__field-value account__role-badge">
            {user.role.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Placeholder — edição de perfil a implementar */}
      <button className="account__edit-btn" disabled>
        EDITAR PERFIL — Em breve
      </button>
    </div>
  );
}

/* ─────────────────────────────────────
   Tab: Encomendas
───────────────────────────────────── */
function OrdersTab() {
  return (
    <div className="account__section">
      <h2 className="account__section-title">AS MINHAS ENCOMENDAS</h2>

      {/* Placeholder — listagem de encomendas a implementar */}
      <div className="account__empty">
        <p>Ainda não tem encomendas.</p>
        <p className="account__empty-sub">
          As suas encomendas aparecerão aqui depois de efetuar uma compra.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Tab: Palavra-passe
───────────────────────────────────── */
function PasswordTab() {
  return (
    <div className="account__section">
      <h2 className="account__section-title">ALTERAR PALAVRA-PASSE</h2>

      {/* Placeholder — alteração de palavra-passe a implementar */}
      <div className="account__empty">
        <p>Funcionalidade disponível em breve.</p>
      </div>
    </div>
  );
}
