import React, { useEffect, useState } from 'react';

const apiUrl = import.meta.env.VITE_API_URL;

const AdminAttendanceChart = () => {
  return (
    <div className="p-5">
      <AttendanceColumns />
    </div>
  );
};

const AttendanceColumns = () => {
  const [usersAttendance, setUsersAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const selectedEvent = localStorage.getItem('selectedEventId');
    if (!selectedEvent) {
      console.error('No event ID found in local storage');
      return;
    }

    const fetchUsersAttendance = async () => {
      try {
        const response = await fetch(`${apiUrl}attendance/getUsersByEvent/${selectedEvent}`);
        const data = await response.json();
        setUsersAttendance(data);
      } catch (error) {
        console.error('Error fetching users attendance data:', error);
      }
    };

    fetchUsersAttendance();
  }, []);

  // Filter users based on search term (case-insensitive match on first or last name)
  const filteredUsers = usersAttendance.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const registeredUsers = filteredUsers;
  const attendedUsers = filteredUsers.filter(user => user.hasAttended === true);
  const absentUsers = filteredUsers.filter(user => user.hasAttended === false);

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-72 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Columns */}
      <div className="flex justify-center gap-10">
        {/* Registered */}
        <div>
          <h3 className="font-semibold text-[#3a1078] text-xl mb-4 text-center">Registered Users</h3>
          <ul className="list-disc list-inside max-h-96 overflow-y-auto">
            {registeredUsers.length === 0 ? (
              <li className="text-gray-400 text-center">No users found</li>
            ) : (
              registeredUsers.map(user => (
                <li key={user.userId}>{user.firstName} {user.lastName}</li>
              ))
            )}
          </ul>
        </div>

        {/* Attended */}
        <div>
          <h3 className="font-semibold text-[#3a1078] text-xl mb-4 text-center">Attended Users</h3>
          <ul className="list-disc list-inside max-h-96 overflow-y-auto">
            {attendedUsers.length === 0 ? (
              <li className="text-gray-400 text-center">No users found</li>
            ) : (
              attendedUsers.map(user => (
                <li key={user.userId}>{user.firstName} {user.lastName}</li>
              ))
            )}
          </ul>
        </div>

        {/* Absent */}
        <div>
          <h3 className="font-semibold text-[#3a1078] text-xl mb-4 text-center">Absent Users</h3>
          <ul className="list-disc list-inside max-h-96 overflow-y-auto">
            {absentUsers.length === 0 ? (
              <li className="text-gray-400 text-center">No users found</li>
            ) : (
              absentUsers.map(user => (
                <li key={user.userId}>{user.firstName} {user.lastName}</li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceChart;
