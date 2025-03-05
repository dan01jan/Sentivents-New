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
  FaCommentAlt,
} from "react-icons/fa";
import "./Sidebar.css";
import logo from "../../../assets/website/V_DarkerLogo.png";
import "../../Layouts/Header.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

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
        <a className="flex items-center justify-center px-1 py-4 text-[#3a1078] rounded-lg logo-container">
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
                to="/dashboard/"
                className="flex items-center space-x-3 text-xl text-[#3a1078] font-bold hover:text-pink-500 transition duration-200 ease-in-out"
              >
                <FaHome size={40} />
                {isExpanded && <span>Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/wordtag"
                className="flex items-center space-x-3 text-xl text-[#3a1078] font-bold hover:text-pink-500 transition duration-200 ease-in-out mt-8"
              >
                <FaCommentAlt size={40} />
                {isExpanded && <span>Word Tag</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/events"
                className="flex items-center space-x-3 text-xl text-[#3a1078] font-bold hover:text-pink-500 transition duration-200 ease-in-out mt-8"
              >
                <FaCalendarAlt size={40} />
                {isExpanded && <span>Events</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/attendance"
                className="flex items-center space-x-3 text-xl text-[#3a1078] font-bold hover:text-pink-500 transition duration-200 ease-in-out mt-8"
              >
                <FaUserCheck size={40} />
                {isExpanded && <span>Attendance</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/questions"
                className="flex items-center space-x-3 text-xl text-[#3a1078] font-bold hover:text-pink-500 transition duration-200 ease-in-out mt-8"
              >
                <FaQuestionCircle size={40} />
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
        <Outlet />
      </main>
    </div>
  );
};

export default Sidebar;
