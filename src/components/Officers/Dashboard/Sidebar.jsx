import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  // A single size for all main icons so they look consistent
  const mainIconSize = 28;

  // Determines if the current path is active.
  const isActive = (path) => location.pathname === path;

  // A helper function to generate classes for each link, including an active state style.
  const getLinkClasses = (path) =>
    `flex items-center space-x-3 text-base md:text-xl font-bold transition duration-200 ease-in-out mt-2 px-4 py-2 rounded-lg ${isActive(path)
      ? "bg-gray-200 text-[#4e31aa] border-b-2 border-[#4e31aa]"
      : "text-[#3a1078] hover:bg-gray-100"
    }`;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-white">
      <aside
        className={`bg-[#f7f7f8] rounded-tr-lg shadow-lg p-4 transition-all duration-300 ease-in-out ${isExpanded ? "w-[20vw] md:w-[25vh]" : "w-[12vw] md:w-[10vh]"
          } flex flex-col justify-between relative`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center px-1 py-4 text-[#3a1078] rounded-lg logo-container">
          <img
            src={logo}
            alt="Logo"
            className={`transition-all duration-300 ease-in-out ${isExpanded ? "w-20 md:w-24" : "w-16 md:w-20"
              }`}
          />
        </div>

        {/* Navigation */}
        <nav className="py-4 mt-6 space-y-4 flex-grow">
          <ul>
            <li>
              <Link to="/dashboard/" className={getLinkClasses("/dashboard/")}>
                <FaHome size={isExpanded ? 28 : 20}/>
                {isExpanded && <span>Dashboard</span>}
              </Link>
            </li>

            <li>
              <Link
                to="/dashboard/wordtag"
                className={getLinkClasses("/dashboard/wordtag")}
              >
                <FaCommentAlt size={isExpanded ? 28 : 20} />
                {isExpanded && <span>Word Tag</span>}
              </Link>
            </li>

            <li>
              <Link
                to="/dashboard/events"
                className={getLinkClasses("/dashboard/events")}
              >
                <FaCalendarAlt size={isExpanded ? 28 : 20} />
                {isExpanded && <span>Events</span>}
              </Link>
            </li>

            <li>
              <Link
                to="/dashboard/attendance"
                className={getLinkClasses("/dashboard/attendance")}
              >
                <FaUserCheck size={isExpanded ? 28 : 20} />
                {isExpanded && <span>Registration</span>}
              </Link>
            </li>

            <li>
              <Link
                to="/dashboard/questions"
                className={getLinkClasses("/dashboard/questions")}
              >
                <FaQuestionCircle size={isExpanded ? 28 : 20} />
                {isExpanded && <span>Questions</span>}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-1/2 -translate-y-1/2 right-0 transform translate-x-1/2 bg-white p-2 rounded-full shadow-md border border-gray-300 transition-all duration-300 ease-in-out"
        >
          {isExpanded ? <FaArrowLeft size={24} /> : <FaArrowRight size={24} />}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center py-2 mb-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 ease-in-out"
        >
          <FaSignOutAlt size={24} />
          {isExpanded && <span className="ml-3">Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Sidebar;