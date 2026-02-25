import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Wraps a route that requires authentication.
 * Optionally restrict to specific roles.
 *
 * Usage:
 *   <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '60vh', fontSize: 14, letterSpacing: 2, color: '#999',
      }}>
        A verificar sessão…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
