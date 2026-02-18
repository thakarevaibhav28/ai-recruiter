import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/context";

const ProtectedRoute = ({redirectTo}:{redirectTo: string;}) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;
