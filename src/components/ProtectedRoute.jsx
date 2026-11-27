import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="h-full grid place-items-center text-ink-muted">যাচাই হচ্ছে…</div>;
  if (!user || !isAdmin) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
