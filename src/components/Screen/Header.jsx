import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/website/V_LightLogo.png";
import hoverLogo from "../../assets/website/V_Logo.png"; // Import the hover logo
import "./Header.css";
import "../../index.css";

function Header({ isAdmin, user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.reload();
  };

  return (
    <header className="bg-[#3a1078] shadow-md fixed top-0 left-0 w-full z-50">
      <div className="mx-5 flex justify-between items-center p-4">
        <div className="flex items-center space-x-8">
          <a href="/" className="logo-container">
            <img src={logo} alt="Logo" className="h-12 w-auto logo" />
          </a>

          {/* Nav items closer to the logo */}
          <div className="hidden md:flex space-x-8 items-center">
            <div
              onClick={() => navigate("/home")}
              className="p-2 rounded-lg hover:bg-[#4e31aa] cursor-pointer relative group"
            >
              <span className="text-m font-tungsten font-semibold text-white">
                HOME
              </span>
              <div className="absolute left-0 bottom-0 w-full h-1 bg-[#3795bd] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </div>
            <div
              onClick={() => navigate("/events")}
              className="p-2 rounded-lg hover:bg-[#4e31aa] cursor-pointer relative group"
            >
              <span className="text-m font-tungsten font-semibold text-white">
                EVENTS
              </span>
              <div className="absolute left-0 bottom-0 w-full h-1 bg-[#3795bd] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </div>
            <div
              onClick={() => navigate("/about")}
              className="p-2 rounded-lg hover:bg-[#4e31aa] cursor-pointer relative group"
            >
              <span className="text-m font-tungsten font-semibold text-white">
                ABOUT
              </span>
              <div className="absolute left-0 bottom-0 w-full h-1 bg-[#3795bd] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="hidden md:flex items-center space-x-4 ">
          {user ? (
            <>
              <span className="text-lg font-semibold text-white">
                Welcome, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-1 font-tungsten font-semibold bg-gradient-to-r from-[#FF0000] to-[#b60202] text-white text-lg rounded-lg hover:from-[#b60202] hover:to-[#FF0000] transition"
            >
              SIGN IN
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button className="text-white focus:outline-none">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
