import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom'; // Import useNavigate hook
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  // Handle logout by clearing localStorage and navigating to the login page
  const handleLogout = () => {
    localStorage.clear(); // Clear all localStorage data
    navigate('/'); // Redirect to the login page
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-pink-50 via-purple-100 to-blue-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white rounded-lg shadow-lg p-4">
        <div className="px-6 py-4 bg-gradient-to-r from-pink-400 to-purple-500 text-white text-xl font-bold rounded-lg">
          <Link to="/dashboard/calendar" className="text-lg text-gray-700 hover:text-pink-500 transition duration-200">
            Admin Panel
          </Link>
        </div>
        <nav className="px-6 py-4 mt-6 space-y-4">
          <ul>
            <li>
              <Link to="/dashboard/wordtag" className="text-lg text-gray-700 hover:text-pink-500 transition duration-200">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/dashboard/events" className="text-lg text-gray-700 hover:text-pink-500 transition duration-200">
                Events
              </Link>
            </li>
            <li>
              <Link to="/dashboard/attendance" className="text-lg text-gray-700 hover:text-pink-500 transition duration-200">
                Attendance
              </Link>
            </li>
            {/* <li>
              <Link to="/dashboard/trait" className="text-lg text-gray-700 hover:text-pink-500 transition duration-200">
                Trait
              </Link>
            </li> */}
            <li>
              <Link to="/dashboard/questions" className="text-lg text-gray-700 hover:text-pink-500 transition duration-200">
                Questions
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-2 mt-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
        >
          Logout
        </button>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Render Nested Routes */}
        <div className="mt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
