import React from "react";
import logo from "../../assets/website/V_LightLogo.png";
import hoverLogo from "../../assets/website/V_Logo.png"; 

function Header({ isAdmin, user }) {
  console.log("User:", user); 

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.reload();
  };

  return (
    <header className="bg-[#3a1078] shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center">
          <a href="/" className="relative h-12 w-auto">
            <img src={logo} alt="Logo" className="h-12 w-auto absolute opacity-100 transition-opacity duration-600 hover:opacity-0" />
            <img src={hoverLogo} alt="Hover Logo" className="h-12 w-auto opacity-0 transition-opacity duration-600 hover:opacity-100" />
          </a>
        </div>
        <nav className="hidden md:flex space-x-8 flex-grow justify-center items-center">
          <a
            href="/home"
            className="text-lg font-semibold text-white hover:text-gray-500 transition"
          >
            Home
          </a>
          <a
            href="/events"
            className="text-lg font-semibold text-white hover:text-gray-500 transition"
          >
            Events
          </a>
          <a
            href="/about"
            className="text-lg font-semibold text-white hover:text-gray-500 transition"
          >
            About
          </a>
        </nav>

        {/* User Section */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-lg font-semibold text-white">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="px-4 py-2 bg-[#f7f7f8] text-[#3a1078] text-lg font-semibold rounded-lg hover:bg-[#3795bd] transition"
            >
              Sign In
            </a>
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