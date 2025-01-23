import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, BarElement, Title, Tooltip, Legend);

const AttendanceChart = () => {
  const [attendanceData, setAttendanceData] = useState({ present: 0, absent: 0, registered: 0 });

  useEffect(() => {
    // Retrieve selected event ID from local storage
    const selectedEvent = localStorage.getItem('selectedEventId');
    
    if (!selectedEvent) {
      console.error('No event ID found in local storage');
      return;
    }

    // Fetch attendance data from your server
    const fetchAttendanceData = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/v1/attendance/hasAttendedCounts/${selectedEvent}`);
        const data = await response.json();
        
        // Update state with the fetched data
        setAttendanceData({
          present: data.Present || 0,
          absent: data.Absent || 0,
          registered: data.Present + data.Absent || 0
        });
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    fetchAttendanceData();
  }, []);

  // Data for the bar chart
  const chartData = {
    labels: ['Registered', 'Attended', 'Absent'],
    datasets: [
      {
        label: 'User Attendance',
        data: [attendanceData.registered, attendanceData.present, attendanceData.absent],
        backgroundColor: ['#FFCC00', '#00FF00', '#FF0000'], // Colors for each bar
        borderColor: ['#FF9900', '#00CC00', '#CC0000'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '40px', gap: '40px' }}>
      <div style={chartContainerStyle}>
        <h3 style={headingStyle}>Event Attendance</h3>
        <Bar data={chartData} />
      </div>
      <div style={tableContainerStyle}>
        <AttendanceTable />
      </div>
    </div>
  );
};

const AttendanceTable = () => {
  const [usersAttendance, setUsersAttendance] = useState([]);

  useEffect(() => {
    // Retrieve selected event ID from local storage
    const selectedEvent = localStorage.getItem('selectedEventId');
    
    if (!selectedEvent) {
      console.error('No event ID found in local storage');
      return;
    }

    // Fetch users attendance data from the server
    const fetchUsersAttendance = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/v1/attendance/getUsersByEvent/${selectedEvent}`);
        const data = await response.json();
        
        // Update state with the fetched user attendance data
        setUsersAttendance(data);
      } catch (error) {
        console.error('Error fetching users attendance data:', error);
      }
    };

    fetchUsersAttendance();
  }, []);

  return (
    <div>
      <h3 style={headingStyle}>Event User Attendance</h3>
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
  );
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
