import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'E-mail ou palavra-passe incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__panel">
        {/* Close + back */}
        <div className="auth__topbar">
          <Link to="/" className="auth__back" aria-label="Voltar">
            ‹
          </Link>
          <Link to="/" className="auth__close" aria-label="Fechar">
            ×
          </Link>
        </div>

        <h1 className="auth__title">INICIAR SESSÃO</h1>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="auth__field">
            <label className="auth__label" htmlFor="login-email">
              E-mail*
            </label>
            <input
              id="login-email"
              className="auth__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="auth__field">
            <label className="auth__label" htmlFor="login-password">
              Palavra-passe*
            </label>
            <div className="auth__input-wrap">
              <input
                id="login-password"
                className="auth__input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                minLength={8}
              />
              <button
                type="button"
                className="auth__toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
              >
                {showPassword ? '◡' : '◉'}
              </button>
            </div>
          </div>

          {error && <p className="auth__error">{error}</p>}

          <button
            type="submit"
            className="auth__submit"
            disabled={loading || !email || !password}
          >
            {loading ? 'A ENTRAR…' : 'INICIAR SESSÃO'}
          </button>

          <Link to="/forgot-password" className="auth__link">
            Esqueceu-se da palavra-passe?
          </Link>
        </form>

        <div className="auth__divider">
          <span>ou</span>
        </div>

        <Link to="/signup" className="auth__alt-btn">
          CRIAR CONTA
        </Link>
      </div>
    </div>
  );
}
