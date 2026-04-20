import { Navigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

export default function AdminRoute({ children }) {
  const { isLoggedIn, user } = useAppContext();

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
