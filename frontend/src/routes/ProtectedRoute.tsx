// ProtectedRoute.tsx
// import { Navigate, Outlet } from "react-router-dom";

// interface ProtectedRouteProps {
//   isAuthenticated: boolean;
//   redirectTo?: string;
//   children?: React.ReactNode;
// }

// const ProtectedRoute = ({ isAuthenticated, redirectTo = "/admin/login" }: ProtectedRouteProps) => {
//   console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);
//   return isAuthenticated ? <Outlet /> : <Navigate to={redirectTo} replace />;
// };

// export default ProtectedRoute;

import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = sessionStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;