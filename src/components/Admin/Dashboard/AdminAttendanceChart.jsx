import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, BarElement, Title, Tooltip, Legend);

const apiUrl = import.meta.env.VITE_API_URL;

const AdminAttendanceChart = () => {
  const [attendanceData, setAttendanceData] = useState({
    present: 0,
    absent: 0,
    registered: 0,
  });

  useEffect(() => {
    const selectedEvent = localStorage.getItem('selectedEventId');
    if (!selectedEvent) {
      console.error('No event ID found in local storage');
      return;
    }

    const fetchAttendanceData = async () => {
      try {
        const response = await fetch(`${apiUrl}attendance/hasAttendedCounts/${selectedEvent}`);
        const data = await response.json();
        setAttendanceData({
          present: data.Present || 0,
          absent: data.Absent || 0,
          registered: (data.Present || 0) + (data.Absent || 0),
        });
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    fetchAttendanceData();
  }, []);

  const chartData = {
    labels: ['Registered', 'Attended', 'Absent'],
    datasets: [
      {
        label: 'User Attendance',
        data: [attendanceData.registered, attendanceData.present, attendanceData.absent],
        backgroundColor: ['#FFCC00', '#00FF00', '#FF0000'],
        borderColor: ['#FF9900', '#00CC00', '#CC0000'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start p-5 gap-5 flex-wrap">
      <div className="flex-1 bg-transparent rounded-2xl shadow-md p-5 text-center w-full lg:w-1/2 h-[50vh]">
        <h3 className="font-semibold text-[#3a1078] text-xl md:text-2xl mb-5">Event Attendance</h3>
        <Bar data={chartData} />
      </div>
      <div className="flex-1 bg-transparent rounded-2xl shadow-md p-5 w-full lg:w-1/2 h-[50vh] overflow-auto">
        <AttendanceTable />
      </div>
    </div>
  );
};

const AttendanceTable = () => {
  const [usersAttendance, setUsersAttendance] = useState([]);

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

  return (
    <>
      <h3 className="font-semibold text-[#3a1078] text-xl md:text-2xl mb-5 text-center">
        Event User Attendance
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left border-b">User Name</th>
              <th className="p-3 text-center border-b">Registered</th>
              <th className="p-3 text-center border-b">Attended</th>
              <th className="p-3 text-center border-b">Absent</th>
            </tr>
          </thead>
          <tbody>
            {usersAttendance.map((user) => (
              <tr key={user.userId} className="hover:bg-gray-50">
                <td className="p-3 border-b">{user.firstName} {user.lastName}</td>
                <td className="p-3 text-center border-b">
                  <input type="checkbox" checked={user.hasAttended} disabled />
                </td>
                <td className="p-3 text-center border-b">
                  <input type="checkbox" checked={user.hasAttended} disabled />
                </td>
                <td className="p-3 text-center border-b">
                  <input type="checkbox" checked={!user.hasAttended} disabled />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminAttendanceChart;
