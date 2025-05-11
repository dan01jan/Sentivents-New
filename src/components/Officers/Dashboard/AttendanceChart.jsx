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
    <div style={attendanceTableContainerStyle}>
      <h3 style={headingStyle}>Event User Attendance</h3>
      <div style={scrollableTableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Registered</th>
              <th>Attended</th>
              <th>Absent</th>
            </tr>
          </thead>
          <tbody>
            {usersAttendance.map((user) => (
              <tr key={user.userId}>
                <td>{user.firstName} {user.lastName}</td>
                <td>
                  <input type="checkbox" checked={user.hasAttended} disabled />
                </td>
                <td>
                  <input type="checkbox" checked={user.hasAttended} disabled />
                </td>
                <td>
                  <input type="checkbox" checked={!user.hasAttended} disabled />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const attendanceTableContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',  // fill parent container (tableContainerStyle)
};

const scrollableTableWrapperStyle = {
  flex: 1, // take up remaining space after heading
  overflowY: 'auto',
  borderRadius: '10px',
  border: '1px solid #ddd',
};

const chartContainerStyle = {
    flex: 1,
    backgroundColor: 'transparent',  // Set background to clear
    borderRadius: '15px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    textAlign: 'center',
    width: '50vw',  // Set width to half of the screen width
    height: '50vh',  // Set height to half of the screen height
  };
  
  const tableContainerStyle = {
    flex: 1,
    backgroundColor: 'transparent',  // Set background to clear
    borderRadius: '15px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    width: '50vw',  // Set width to half of the screen width
    height: '50vh',  // Set height to half of the screen height
  };
  
  const headingStyle = {
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    marginBottom: '20px',
    fontSize: '24px', // Larger heading text
  };
  
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'transparent',  // Set table background to transparent
    borderRadius: '10px',
    overflow: 'hidden',
    fontSize: '16px',
  };
  
  const tableRowHoverStyle = {
    backgroundColor: '#f1f1f1',
  };
  
  
export default AttendanceChart;
