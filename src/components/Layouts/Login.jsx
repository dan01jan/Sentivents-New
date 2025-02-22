import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/website/v_darkerlogo.png";
import { FaGoogle } from "react-icons/fa";

const apiUrl = import.meta.env.VITE_API_URL;

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}users/weblogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));
     

      if (data.user.isAdmin) {
        navigate("/dashboard/calendar");
      } else {
        navigate("/");
        window.location.reload();
      }
    } catch (error) {
      alert(error.message || "Something went wrong");
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google login logic here
    alert("Google login not implemented yet");
  };

  return (
    <div className="min-h-screen h-screen flex items-center justify-center bg-[#3a1078] p-4">
      <div className="bg-[#f7f7f8] flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden max-w-7xl w-full h-auto md:h-[80vh]">

        <div className="w-full md:w-1/2 h-64 md:h-auto flex items-center justify-center bg-[#f7f7f8]">
          <img src={logo} alt="Logo" className="max-w-full max-h-full" />
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center h-full">
          <h2 className="text-4xl font-bold text-[#3a1078] mb-8">Login</h2>
          <p className="text-lg text-gray-500 mb-8">
            Welcome back! Please login to your account.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="mt-2 px-5 py-4 text-m border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                className="mt-2 px-5 py-4 text-m border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 mt-6 font-bold bg-[#3a1078] text-white rounded-lg hover:bg-[#4e31aa] transition duration-300 text-m"
            >
              Login
            </button>
          </form>
          <div className="flex items-center my-3">
            <hr className="flex-grow border-t-2 border-gray-300" />
            <span className="mx-4 text-gray-500">or</span>
            <hr className="flex-grow border-t-2 border-gray-300" />
          </div>
          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 text-m font-bold flex items-center justify-center"
          >
            <FaGoogle className="w-6 h-6 mr-3" />
            Login with Google
          </button>
          <Link
            to="/forgot-password"
            className="mt-4 text-center text-[#3a1078] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;