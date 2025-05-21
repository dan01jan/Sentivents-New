import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const apiUrl = import.meta.env.VITE_API_URL;

const AttendanceChart = () => {
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

  const filteredUsers = usersAttendance.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const registeredUsers = filteredUsers;
  const attendedUsers = filteredUsers.filter(user => user.hasAttended === true);
  const absentUsers = filteredUsers.filter(user => user.hasAttended === false);


  const pieData = [
    { name: 'Attended', value: attendedUsers.length },
    { name: 'Absent', value: absentUsers.length }
  ];

  const COLORS = ['#3a1078', '#d1c4e9']; // Purple for attended, light purple for absent

  return (
    <div>
      <h1 className="text-[6vh] font-bold mb-4 font-semibold text-[#3a1078] items-center text-center">
        Attendance</h1>
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-96 px-5 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>
      <div className="flex justify-center mb-10">
        <PieChart width={600} height={300}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </div>
      {filteredUsers.length > 0 && (
        <div className="mb-8 flex justify-center gap-10 flex-wrap text-lg font-medium text-gray-700">
          <div className="bg-white shadow-md rounded-xl px-6 py-4 border border-gray-200">
            Total Registered: <span className="font-bold">{registeredUsers.length}</span>
          </div>
          <div className="bg-white shadow-md rounded-xl px-6 py-4 border border-gray-200">
            Total Attended: <span className="font-bold text-green-600">{attendedUsers.length}</span>
          </div>
          <div className="bg-white shadow-md rounded-xl px-6 py-4 border border-gray-200">
            Total Absent: <span className="font-bold text-red-600">{absentUsers.length}</span>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-12 flex-wrap">
        <div className="w-96 max-h-[32rem] overflow-y-auto border border-gray-300 rounded-lg shadow-sm">
          <table className="min-w-full">
            <thead className="bg-[#3a1078] text-white sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 text-lg font-semibold">Registered Users</th>
              </tr>
            </thead>
            <tbody>
              {registeredUsers.length === 0 ? (
                <tr>
                  <td className="text-center text-gray-400 py-6">No users found</td>
                </tr>
              ) : (
                registeredUsers.map(user => (
                  <tr key={user.userId} className="even:bg-gray-50 hover:bg-gray-100 transition">
                    <td className="px-6 py-4 text-base">
                      {user.firstName} {user.lastName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="w-96 max-h-[32rem] overflow-y-auto border border-gray-300 rounded-lg shadow-sm">
          <table className="min-w-full">
            <thead className="bg-[#3a1078] text-white sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 text-lg font-semibold">Attended Users</th>
              </tr>
            </thead>
            <tbody>
              {attendedUsers.length === 0 ? (
                <tr>
                  <td className="text-center text-gray-400 py-6">No users found</td>
                </tr>
              ) : (
                attendedUsers.map(user => (
                  <tr key={user.userId} className="even:bg-gray-50 hover:bg-gray-100 transition">
                    <td className="px-6 py-4 text-base">
                      {user.firstName} {user.lastName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="w-96 max-h-[32rem] overflow-y-auto border border-gray-300 rounded-lg shadow-sm">
          <table className="min-w-full">
            <thead className="bg-[#3a1078] text-white sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 text-lg font-semibold">Absent Users</th>
              </tr>
            </thead>
            <tbody>
              {absentUsers.length === 0 ? (
                <tr>
                  <td className="text-center text-gray-400 py-6">No users found</td>
                </tr>
              ) : (
                absentUsers.map(user => (
                  <tr key={user.userId} className="even:bg-gray-50 hover:bg-gray-100 transition">
                    <td className="px-6 py-4 text-base">
                      {user.firstName} {user.lastName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;
