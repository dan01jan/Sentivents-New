import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/website/V_LightLogo.png";
import "./Header.css";
import "../../index.css";

function Header({ isOfficer, user }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.reload();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-[#3a1078] fixed top-0 left-0 w-full z-50">
      <div className="mx-5 flex justify-between items-center p-4">
        <div className="flex items-center space-x-8">
          <a href="/" className="logo-container">
            <img src={logo} alt="Logo" className="h-12 w-auto logo" />
          </a>

          {/* Nav items closer to the logo */}
          <div className="hidden md:flex space-x-8 items-center mb-2">
            <div
              onClick={() => navigate("/home")}
              className="p-2 rounded-lg hover:bg-[#4e31aa] cursor-pointer relative group"
            >
              <span className="text-sm font-medium text-white">HOME</span>
              <div className="absolute left-0 bottom-0 w-full h-1 top-11 bg-[#3795bd] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <div
              onClick={() => navigate("/events")}
              className="p-2 rounded-lg hover:bg-[#4e31aa] cursor-pointer relative group"
            >
              <span className="text-sm font-medium text-white">EVENTS</span>
              <div className="absolute left-0 bottom-0 w-full h-1 top-11 bg-[#3795bd] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div
              onClick={() => navigate("/organization")}
              className="p-2 rounded-lg hover:bg-[#4e31aa] cursor-pointer relative group"
            >
              <span className="text-sm font-medium text-white">
                ORGANIZATION
              </span>
              <div className="absolute left-0 bottom-0 w-full h-1 top-11 bg-[#3795bd] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div
              onClick={() => navigate("/about")}
              className="p-2 rounded-lg hover:bg-[#4e31aa] cursor-pointer relative group"
            >
              <span className="text-sm font-medium text-white">ABOUT</span>
              <div className="absolute left-0 bottom-0 w-full h-1 top-11 bg-[#3795bd] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="hidden md:flex items-center space-x-4">
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
              className="px-5 py-1 font-semibold bg-gradient-to-r from-[#FF0000] to-[#b60202] text-white text-lg rounded-lg hover:from-[#b60202] hover:to-[#FF0000] transition"
            >
              SIGN IN
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            className="text-white focus:outline-none"
            onClick={toggleMobileMenu}
          >
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#3a1078] p-4">
          <div
            onClick={() => {
              navigate("/home");
              toggleMobileMenu();
            }}
            className="p-2 rounded-lg hover:bg-[#4e31aa] cursor-pointer"
          >
            <span className="text-sm font-medium text-white">HOME</span>
          </div>
          <div
            onClick={() => {
              navigate("/events");
              toggleMobileMenu();
            }}
            className="p-2 rounded-lg hover:bg-[#4e31aa] cursor-pointer"
          >
            <span className="text-sm font-medium text-white">EVENTS</span>
          </div>
          <div
            onClick={() => {
              navigate("/organization");
              toggleMobileMenu();
            }}
            className="p-2 rounded-lg hover:bg-[#4e31aa] cursor-pointer"
          >
            <span className="text-sm font-medium text-white">ORGANIZATION</span>
          </div>
          <div
            onClick={() => {
              navigate("/about");
              toggleMobileMenu();
            }}
            className="p-2 rounded-lg hover:bg-[#4e31aa] cursor-pointer"
          >
            <span className="text-sm font-medium text-white">ABOUT</span>
          </div>
          {user ? (
            <>
              <span className="text-lg font-semibold text-white block mt-4">
                Welcome, {user.name}
              </span>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMobileMenu();
                }}
                className="mt-2 px-4 py-2 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition w-full"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                navigate("/login");
                toggleMobileMenu();
              }}
              className="mt-2 px-5 py-1 font-semibold bg-gradient-to-r from-[#FF0000] to-[#b60202] text-white text-lg rounded-lg hover:from-[#b60202] hover:to-[#FF0000] transition w-full"
            >
              SIGN IN
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;