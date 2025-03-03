import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children }) => {

  const userData = localStorage.getItem('userData');

  if (!userData || userData.isAdmin === true) {
    return <Navigate to="/admin" />;
  }

  return children;
};

export default ProtectedAdminRoute;