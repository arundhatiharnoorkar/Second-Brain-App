import { Navigate } from "react-router-dom";

function ProtectedRoute({
  children,
}: any) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/signin" />;
  }

  return children;
}

export default ProtectedRoute;