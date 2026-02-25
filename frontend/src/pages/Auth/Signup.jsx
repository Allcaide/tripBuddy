import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

/* ─── Password validation rules ─── */
const RULES = [
  { id: 'lower', label: 'Uma letra minúscula', test: (v) => /[a-z]/.test(v) },
  { id: 'upper', label: 'Uma letra maiúscula', test: (v) => /[A-Z]/.test(v) },
  { id: 'number', label: 'Um número', test: (v) => /\d/.test(v) },
  { id: 'min', label: 'Mínimo 8 caracteres', test: (v) => v.length >= 8 },
  {
    id: 'repeat',
    label: 'Máximo 3 caracteres idênticos seguidos',
    test: (v) => !/(.)\1{3,}/.test(v),
  },
];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ruleResults = useMemo(
    () => RULES.map((r) => ({ ...r, pass: r.test(password) })),
    [password],
  );

  const allRulesPass = ruleResults.every((r) => r.pass);
  const passwordsMatch = password === passwordConfirm && passwordConfirm.length > 0;

  const canSubmit =
    name.trim() &&
    email.trim() &&
    allRulesPass &&
    passwordsMatch &&
    acceptPrivacy &&
    !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('As palavras-passe não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await signup({ name, email, password, passwordConfirm });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__panel">
        {/* Close + back */}
        <div className="auth__topbar">
          <Link to="/login" className="auth__back" aria-label="Voltar">
            ‹
          </Link>
          <Link to="/" className="auth__close" aria-label="Fechar">
            ×
          </Link>
        </div>

        <h1 className="auth__title">CRIAR CONTA MIL FIOS</h1>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="auth__field">
            <label className="auth__label" htmlFor="signup-name">
              Nome*
            </label>
            <input
              id="signup-name"
              className="auth__input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="auth__field">
            <label className="auth__label" htmlFor="signup-email">
              E-mail*
            </label>
            <input
              id="signup-email"
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
            <label className="auth__label" htmlFor="signup-password">
              Palavra-passe*
            </label>
            <div className="auth__input-wrap">
              <input
                id="signup-password"
                className="auth__input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
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

          {/* Password rules */}
          <div className="auth__rules">
            {ruleResults.map((r) => (
              <div
                key={r.id}
                className={`auth__rule ${r.pass ? 'auth__rule--pass' : ''}`}
              >
                <span className="auth__rule-icon">{r.pass ? '✓' : '✕'}</span>
                {r.label}
              </div>
            ))}
          </div>

          {/* Confirm password */}
          <div className="auth__field">
            <label className="auth__label" htmlFor="signup-confirm">
              Confirmar palavra-passe*
            </label>
            <div className="auth__input-wrap">
              <input
                id="signup-confirm"
                className="auth__input"
                type={showConfirm ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth__toggle-pw"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}
              >
                {showConfirm ? '◡' : '◉'}
              </button>
            </div>
            {passwordConfirm && !passwordsMatch && (
              <p className="auth__field-error">As palavras-passe não coincidem</p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="auth__checkboxes">
            <label className="auth__checkbox">
              <input
                type="checkbox"
                checked={acceptPrivacy}
                onChange={(e) => setAcceptPrivacy(e.target.checked)}
              />
              <span>
                Li e compreendi a informação sobre o uso dos meus dados pessoais
                explicada na{' '}
                <a href="#" className="auth__inline-link">
                  Política de Privacidade
                </a>
              </span>
            </label>

            <label className="auth__checkbox">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
              />
              <span>
                Quero receber novidades e comunicações comerciais da MIL FIOS por
                e-mail e outros meios
              </span>
            </label>
          </div>

          {error && <p className="auth__error">{error}</p>}

          <button
            type="submit"
            className="auth__submit"
            disabled={!canSubmit}
          >
            {loading ? 'A CRIAR…' : 'CRIAR CONTA'}
          </button>
        </form>

        <div className="auth__divider">
          <span>ou</span>
        </div>

        <Link to="/login" className="auth__alt-btn">
          JÁ TENHO CONTA
        </Link>
      </div>
    </div>
  );
}
