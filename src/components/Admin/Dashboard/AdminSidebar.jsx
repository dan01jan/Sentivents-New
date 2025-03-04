import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaUserCheck,
  FaQuestionCircle,
  FaArrowLeft,
  FaArrowRight,
  FaSignOutAlt,
} from "react-icons/fa";
import logo from "../../../assets/website/V_DarkerLogo.png";

const AdminSideBar = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    if (storedUserData && storedUserData.isAdmin) {
      setUserData(storedUserData);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-white">
      <aside
        className={`bg-[#f7f7f8] rounded-tr-lg shadow-lg p-4 transition-all duration-300 ease-in-out ${
          isExpanded ? "w-[25vh]" : "w-[10vh]"
        } flex flex-col justify-between relative`}
      >
        <a
          href="/admin"
          className="flex items-center justify-center px-1 py-4 text-[#3a1078] rounded-lg logo-container"
        >
          <img
            src={logo}
            alt="Logo"
            className={`transition-all duration-300 logo ease-in-out ${
              isExpanded ? "w-24" : "w-20"
            }`}
          />
        </a>

        <nav className="px-2 py-4 mt-6 space-y-4 flex-grow">
          <ul>
            <li>
              <Link
                to="/admin/admindashboard"
                className="flex items-center space-x-3 text-xl text-[#3a1078] font-bold hover:text-pink-500 transition duration-200 ease-in-out"
              >
                <FaHome size={40} />
                {isExpanded && <span>Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/"
                className="flex items-center space-x-3 text-xl text-[#3a1078] font-bold hover:text-pink-500 transition duration-200 ease-in-out mt-8"
              >
                <FaCalendarAlt size={40} />
                {isExpanded && <span>Events</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/organization"
                className="flex items-center space-x-3 text-xl text-[#3a1078] font-bold hover:text-pink-500 transition duration-200 ease-in-out mt-8"
              >
                <FaUserCheck size={40} />
                {isExpanded && <span>Organization</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/"
                className="flex items-center space-x-3 text-xl text-[#3a1078] font-bold hover:text-pink-500 transition duration-200 ease-in-out mt-8"
              >
                <FaQuestionCircle size={40} />
                {isExpanded && <span>Analysis</span>}
              </Link>
            </li>
          </ul>
        </nav>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-1/2 -translate-y-1/2 right-0 transform translate-x-1/2 bg-white p-2 rounded-full shadow-md border border-gray-300 transition-all duration-300 ease-in-out"
        >
          {isExpanded ? (
            <FaArrowLeft size={24} color="#3a1078" />
          ) : (
            <FaArrowRight size={24} color="#3a1078" />
          )}
        </button>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="w-full flex justify-between items-center p-4 bg-transparent">
          <h1 className="text-2xl font-semibold text-gray-800"></h1>
          <div className="relative flex items-center gap-3">
            {userData && (
              <>
                <span className="text-[#3a1078] font-bold uppercase">
                  {userData.name} {userData.surname}
                </span>
                <img
                  src={userData.image}
                  alt="User"
                  className="w-12 h-12 rounded-full cursor-pointer"
                  onClick={toggleDropdown}
                />
              </>
            )}
            {isDropdownVisible && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 ease-in-out"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSideBar;
