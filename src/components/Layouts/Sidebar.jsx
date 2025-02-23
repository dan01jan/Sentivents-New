import React, { useState } from "react";
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
import "./Sidebar.css";
import logo from "../../assets/website/V_LightLogo.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-pink-50 via-purple-100 to-blue-200">
      <aside
        className={`bg-[#3A1078] rounded-tr-lg shadow-lg p-4 transition-all duration-300 ease-in-out ${
          isExpanded ? "w-60" : "w-20"
        } flex flex-col justify-between relative`}
      >
        <a
          href="/dashboard/calendar"
          className="flex items-center justify-center px-2 py-4 text-white rounded-lg"
        >
          <img
            src={logo}
            alt="Logo"
            className={`transition-all duration-300 ease-in-out ${
              isExpanded ? "w-24" : "w-10"
            }`}
          />
        </a>

        <nav className="px-2 py-4 mt-6 space-y-4 flex-grow">
          <ul>
            <li>
              <Link
                to="/dashboard/wordtag"
                className="flex items-center space-x-3 text-lg text-white font-bold hover:text-pink-500 transition duration-200 ease-in-out"
              >
                <FaHome size={30} />
                {isExpanded && <span>Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/events"
                className="flex items-center space-x-3 text-lg text-white font-bold hover:text-pink-500 transition duration-200 ease-in-out mt-7"
              >
                <FaCalendarAlt size={30} />
                {isExpanded && <span>Events</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/attendance"
                className="flex items-center space-x-3 text-lg text-white font-bold hover:text-pink-500 transition duration-200 ease-in-out mt-7"
              >
                <FaUserCheck size={30} />
                {isExpanded && <span>Attendance</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/questions"
                className="flex items-center space-x-3 text-lg text-white font-bold hover:text-pink-500 transition duration-200 ease-in-out mt-7"
              >
                <FaQuestionCircle size={30} />
                {isExpanded && <span>Questions</span>}
              </Link>
            </li>
          </ul>
        </nav>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-1/2 -translate-y-1/2 right-0 transform translate-x-1/2 bg-white p-2 rounded-full shadow-md border border-gray-300 transition-all duration-300 ease-in-out"
        >
          {isExpanded ? <FaArrowLeft size={24} /> : <FaArrowRight size={24} />}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center py-2 mb-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 ease-in-out"
        >
          <FaSignOutAlt size={24} />
          {isExpanded && <span className="ml-3">Logout</span>}
        </button>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
