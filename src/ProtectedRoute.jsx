import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const authToken = localStorage.getItem('authToken');

  if (!authToken) {
    // If there is no authToken, redirect to login page
    return <Navigate to="/" />;
  }

  return children; // If authToken exists, render the children (protected routes)
}

export default ProtectedRoute;
