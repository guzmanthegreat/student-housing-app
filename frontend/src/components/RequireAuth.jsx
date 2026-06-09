import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ session, children }) {
  const location = useLocation();
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
