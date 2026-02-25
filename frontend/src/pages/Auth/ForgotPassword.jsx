import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Erro ao enviar e-mail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__panel">
        <div className="auth__topbar">
          <Link to="/login" className="auth__back" aria-label="Voltar">
            ‹
          </Link>
          <Link to="/" className="auth__close" aria-label="Fechar">
            ×
          </Link>
        </div>

        <h1 className="auth__title">RECUPERAR PALAVRA-PASSE</h1>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, marginBottom: 32 }}>
              Se o e-mail <strong>{email}</strong> existir na nossa base de dados,
              receberá um link para redefinir a sua palavra-passe.
            </p>
            <Link to="/login" className="auth__alt-btn">
              VOLTAR AO LOGIN
            </Link>
          </div>
        ) : (
          <form className="auth__form" onSubmit={handleSubmit} noValidate>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, textAlign: 'center' }}>
              Introduza o e-mail associado à sua conta. Enviaremos um link para
              redefinir a sua palavra-passe.
            </p>

            <div className="auth__field">
              <label className="auth__label" htmlFor="forgot-email">
                E-mail*
              </label>
              <input
                id="forgot-email"
                className="auth__input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {error && <p className="auth__error">{error}</p>}

            <button
              type="submit"
              className="auth__submit"
              disabled={loading || !email}
            >
              {loading ? 'A ENVIAR…' : 'ENVIAR LINK'}
            </button>

            <Link to="/login" className="auth__link">
              Voltar ao login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
