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

const AttendanceChart = () => {
  const [attendanceData, setAttendanceData] = useState({ present: 0, absent: 0, registered: 0 });

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
    <div className="flex justify-between items-start p-10 gap-10 flex-wrap">
      <div className="flex-1 bg-transparent rounded-2xl shadow-md p-10 text-center w-full lg:w-1/2 h-[50vh]">
        <h3 className="font-semibold text-[#3a1078] text-2xl mb-5">Event Attendance</h3>
        <Bar data={chartData} />
      </div>
      <div className="flex-1 bg-transparent rounded-2xl shadow-md p-10 w-full lg:w-1/2 h-[50vh] overflow-auto">
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
    <div>
      <h3 className="font-semibold text-[#3a1078] text-2xl mb-5">Event User Attendance</h3>
      <table className="w-full text-left border-collapse text-base">
        <thead className="border-b-2 border-gray-300">
          <tr>
            <th className="py-2 px-4">User Name</th>
            <th className="py-2 px-4">Registered</th>
            <th className="py-2 px-4">Attended</th>
            <th className="py-2 px-4">Absent</th>
          </tr>
        </thead>
        <tbody>
          {usersAttendance.map((user) => (
            <tr key={user.userId} className="hover:bg-gray-100">
              <td className="py-2 px-4">{user.firstName} {user.lastName}</td>
              <td className="py-2 px-4 text-center">
                <input type="checkbox" checked={user.hasAttended} disabled />
              </td>
              <td className="py-2 px-4 text-center">
                <input type="checkbox" checked={user.hasAttended} disabled />
              </td>
              <td className="py-2 px-4 text-center">
                <input type="checkbox" checked={!user.hasAttended} disabled />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceChart;
