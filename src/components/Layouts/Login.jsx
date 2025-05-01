import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import OrgLoginModal from "./OrgLoginModal"; // Import the modal component
import logo from "../../assets/website/aboutvoys.png";
import Loader from "../Layouts/Loader.jsx";
import { AuthContext } from "./AuthContext";

const apiUrl = import.meta.env.VITE_API_URL;

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard"); 
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}users/weblogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) throw new Error("Invalid credentials");

      if (!response.ok) throw new Error("Invalid credentials");

      const data = await response.json();
      login(data.user); 
      localStorage.setItem("authToken", data.token);

      // Check if the user is an Admin
      if (data.user.isAdmin) {
        navigate("/admin/admindashboard");
      } else {
        const organizations = data.user.organizations || [];
        // Normalize roles to lowercase for comparison
        const roles = organizations.map((membership) =>
          membership.role.toLowerCase()
        );
        const hasOfficer = roles.includes("officer");
        const hasUser = roles.includes("user");

        // If the user has both roles, show the OrgLoginModal overlay
        if (hasOfficer && hasUser) {
          setLoggedInUser(data.user);
          setShowModal(true);
        } 
        else if (hasOfficer) {
          const officerMembership = organizations.find(
            (membership) => membership.role.toLowerCase() === "officer"
          );
          if (
            officerMembership &&
            officerMembership.organization &&
            officerMembership.organization.name &&
            officerMembership.organization._id
          ) {
            localStorage.setItem(
              "officerOrgName",
              officerMembership.organization.name
            );
            localStorage.setItem(
              "officerOrgId",
              officerMembership.organization._id
            );
            localStorage.setItem(
              "officerDepartment",
              officerMembership.department
            );
          }
          navigate("/dashboard");
        } 
        else if (hasUser) {
          navigate("/");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen h-screen flex items-center justify-center bg-[#3a1078] p-4 relative">
      {/* Login Form */}
      <div className="bg-[#f7f7f8] flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden max-w-7xl w-full h-auto md:h-[80vh]">
        <div className="w-full md:w-1/2 h-[70vh] md:h-auto flex items-center justify-center bg-[#f7f7f8]">
          <img
            src={logo}
            alt="Logo"
            className="max-w-[80%] max-h-[80%] object-contain"
          />
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center h-full">
          <h2 className="text-4xl font-bold text-[#3a1078] mb-4">
            Welcome to VOYS!
          </h2>
          <p className="text-lg text-[#3a1078] font-medium mb-8">
            Keep your data safe
          </p>
          <form onSubmit={handleSubmit} className="space-y-6 pr-6">
            <div className="flex flex-col">
              <label htmlFor="email" className="text-xl text-[#3a1078]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                placeholder="Enter your email"
                required
                className="mt-2 px-5 py-4 text-m border-2 bg-[#d6e4f0] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="password" className="text-xl text-[#3a1078]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                placeholder="Enter your password"
                required
                className="mt-2 px-5 py-4 text-m bg-[#d6e4f0] border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 mt-6 font-bold bg-[#3a1078] text-white rounded-lg hover:bg-[#4e31aa] transition duration-300 text-m uppercase"
            >
              Login
            </button>
          </form>
          <Link
            to="/register"
            className="mt-4 text-center text-[#3a1078] hover:underline"
          >
            Not yet Registered? Create an Account
          </Link>
        </div>
      </div>

      {showModal && loggedInUser && (
        <OrgLoginModal user={loggedInUser} closeModal={closeModal} />
      )}
      {loading && <Loader />}
    </div>
  );
};

export default Login;