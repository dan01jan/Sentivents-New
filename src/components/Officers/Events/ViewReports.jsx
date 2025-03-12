import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const apiUrl = import.meta.env.VITE_API_URL;

// Register necessary chart components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const ViewReports = () => {
  const [aggregatedRatings, setAggregatedRatings] = useState([]);
  const [sentimentCounts, setSentimentCounts] = useState({});
  const [eventSentiments, setEventSentiments] = useState([]);
  const [overallInterpretation, setOverallInterpretation] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null); // Add state for storing user info

  const selectedEvent = localStorage.getItem('selectedEventId');

  // Refs for PDF generation:
  const sentimentChartRef = useRef(null);
  const sentimentTableRef = useRef(null);
  const behavioralChartRef = useRef(null);
  const aggregatedRatingsRef = useRef(null);

  useEffect(() => {
    if (selectedEvent) {
      fetchData(selectedEvent);
      fetchData1(selectedEvent);
    } else {
      console.error("No event selected.");
    }
  }, [selectedEvent]);

  useEffect(() => {
    console.log("Selected Event:", selectedEvent);
    console.log("Selected User:", selectedUser);

    if (selectedEvent) {
      if (selectedUser === "All Users") {
        console.log("Fetching data for all users");
        fetchData1();
      } else {
        console.log("Fetching data for specific user:", selectedUser);
        fetchUserRatings();
      }
    }
  }, [selectedEvent, selectedUser]);

  const fetchData = async (eventId) => {
    try {
      console.log('Fetching data for event ID:', eventId);
      setLoading(true);
      // Fetch sentiment counts (positive, negative, neutral)
      const sentimentResponse = await axios.get(`${apiUrl}ratings/${eventId}?type=counts`);
      console.log('Sentiment data:', sentimentResponse.data);
      setSentimentCounts(sentimentResponse.data);
    
      // Fetch user sentiment details
      const sentimentsResponse = await axios.get(`${apiUrl}ratings/${eventId}?type=details`);
      console.log('User sentiment details:', sentimentsResponse.data);

      // Modify the data to include userName
      if (sentimentsResponse.data && sentimentsResponse.data.length > 0) {
        const sentimentsWithNames = sentimentsResponse.data.map(item => ({
          ...item,
          userName: item.user ? item.user.name : 'Unknown',
          userSentiment: item.sentiment || 'No Sentiment'
        }));
        setEventSentiments(sentimentsWithNames);
      } else {
        console.log('No sentiments data found for this event.');
        setEventSentiments([]);
      }
      setSelectedUser("All Users");
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData1 = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (selectedEvent && token) {
        const response = await axios.get(
          `${apiUrl}questionnaires/aggregated-ratings`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { eventId: selectedEvent },
          }
        );

        console.log("Response data:", response.data);

        if (response.data) {
          setAggregatedRatings(response.data.aggregatedRatings || []);
          if (response.data.overallInterpretation) {
            setOverallInterpretation(response.data.overallInterpretation);
          }
          // Fetch user info for each userId
          const userInfos = response.data.users.map(async (userId) => {
            const userResponse = await axios.get(`${apiUrl}users/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return {
              userId,
              name: `${userResponse.data.name} ${userResponse.data.surname}`,
            };
          });

          const usersWithNames = await Promise.all(userInfos);
          setUsers(usersWithNames);
          console.log("Users:", usersWithNames);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const fetchUserRatings = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (selectedEvent && token) {
        const params = { eventId: selectedEvent };
        if (selectedUser) {
          params.userId = selectedUser;
        }

        const response = await axios.get(`${apiUrl}questionnaires/aggregated-ratings`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: params,
          }
        );

        if (response.data) {
          setAggregatedRatings(response.data.aggregatedRatings || []);
          if (response.data.overallInterpretation) {
            setOverallInterpretation(response.data.overallInterpretation);
          }
          if (response.data.userInfo) {
            setUserInfo(response.data.userInfo);
            console.log("User Info:", response.data.userInfo);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user-specific ratings:", error.message);
    }
  };

  // Prepare data for the Behavioral Ratings Bar Chart
  const aggregatedRatingsLabels = aggregatedRatings.map(rating => rating.trait);
  const aggregatedRatingsData = aggregatedRatings.map(rating => rating.averageRating);

  const aggregatedRatingsChartData = {
    labels: aggregatedRatingsLabels,
    datasets: [
      {
        label: 'Trait Ratings',
        data: aggregatedRatingsData,
        backgroundColor: [
          'rgba(53, 162, 235, 0.6)',  
          'rgba(77, 189, 104, 0.6)',  
          'rgba(255, 159, 64, 0.6)',  
          'rgba(255, 99, 132, 0.6)',  
          'rgba(153, 102, 255, 0.6)', 
        ],
        borderColor: [
          'rgba(53, 162, 235, 1)',  
          'rgba(77, 189, 104, 1)',  
          'rgba(255, 159, 64, 1)',  
          'rgba(255, 99, 132, 1)',  
          'rgba(153, 102, 255, 1)', 
        ],
        borderWidth: 2,
      },
    ],
  };

  // Chart Options
  const sentimentChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true },
    },
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true },
    },
  };

  const behavioralChartOptions = {
    responsive: true,
    indexAxis: 'y', // horizontal bars
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true },
    },
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true },
    },
  };

  // Function to generate the PDF using html2canvas and jsPDF
  const handleDownloadPDF = async () => {
    try {
      // Capture Sentiment Chart and Table
      const sentimentChartCanvas = await html2canvas(sentimentChartRef.current);
      const sentimentChartData = sentimentChartCanvas.toDataURL('image/png');

      const sentimentTableCanvas = await html2canvas(sentimentTableRef.current);
      const sentimentTableData = sentimentTableCanvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yOffset = 10;

      // Add Sentiment Analysis Title
      pdf.setFontSize(16);
      pdf.text("Sentiment Analysis", pageWidth / 2, yOffset, { align: "center" });
      yOffset += 10;

      // Add sentiment chart image
      const chartImgProps = pdf.getImageProperties(sentimentChartData);
      const chartWidth = pageWidth - 20;
      const chartHeight = (chartImgProps.height * chartWidth) / chartImgProps.width;
      pdf.addImage(sentimentChartData, 'PNG', 10, yOffset, chartWidth, chartHeight);
      yOffset += chartHeight + 10;

      // Add sentiment table image
      const tableImgProps = pdf.getImageProperties(sentimentTableData);
      const tableWidth = pageWidth - 20;
      const tableHeight = (tableImgProps.height * tableWidth) / tableImgProps.width;
      if (yOffset + tableHeight > pdf.internal.pageSize.getHeight()) {
        pdf.addPage();
        yOffset = 10;
      }
      pdf.addImage(sentimentTableData, 'PNG', 10, yOffset, tableWidth, tableHeight);

      // Add Behavioral Analysis only if a specific user is selected
      if (selectedUser && selectedUser !== "All Users") {
        pdf.addPage();
        yOffset = 10;
        pdf.setFontSize(16);
        pdf.text("Behavioral Analysis", pageWidth / 2, yOffset, { align: "center" });
        yOffset += 10;

        // Capture the Behavioral Chart and Aggregated Ratings sections
        const behavioralChartCanvas = await html2canvas(behavioralChartRef.current);
        const behavioralChartData = behavioralChartCanvas.toDataURL('image/png');

        const aggregatedRatingsCanvas = await html2canvas(aggregatedRatingsRef.current);
        const aggregatedRatingsData = aggregatedRatingsCanvas.toDataURL('image/png');

        // Add Behavioral Chart image
        const behChartImgProps = pdf.getImageProperties(behavioralChartData);
        const behChartWidth = pageWidth - 20;
        const behChartHeight = (behChartImgProps.height * behChartWidth) / behChartImgProps.width;
        pdf.addImage(behavioralChartData, 'PNG', 10, yOffset, behChartWidth, behChartHeight);
        yOffset += behChartHeight + 10;

        // Add Aggregated Ratings / Interpretation image
        const aggImgProps = pdf.getImageProperties(aggregatedRatingsData);
        const aggWidth = pageWidth - 20;
        const aggHeight = (aggImgProps.height * aggWidth) / aggImgProps.width;
        if (yOffset + aggHeight > pdf.internal.pageSize.getHeight()) {
          pdf.addPage();
          yOffset = 10;
        }
        pdf.addImage(aggregatedRatingsData, 'PNG', 10, yOffset, aggWidth, aggHeight);
      }

      pdf.save('report.pdf');
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', padding: '10px' }}>
      {/* Download PDF Button */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={handleDownloadPDF} 
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            backgroundColor: '#3b5998',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Download PDF
        </button>
      </div>

      <h2 style={{ color: '#3b5998', fontSize: '1.5rem', textAlign: 'center' }}>Event Reports</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' }}>
        {/* Sentiment Chart (Vertical Bars) */}
        <div 
          style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
          ref={sentimentChartRef}
        >
          <h3 style={{ fontSize: '1.25rem', color: '#2c3e50' }}>Sentiment Distribution</h3>
          <Bar 
            data={{
              labels: ['Positive', 'Negative', 'Neutral'],
              datasets: [{
                data: [sentimentCounts.positive || 0, sentimentCounts.negative || 0, sentimentCounts.neutral || 0],
                backgroundColor: ['#58d68d', '#e74c3c', '#f39c12'],
                borderColor: ['#45b16d', '#e23d2f', '#d48e1e'],
                borderWidth: 1,
              }],
            }} 
            options={sentimentChartOptions} 
          />
        </div>

        {/* Behavioral Ratings Bar Chart (Horizontal Bars) */}
        <div style={{ flex: 1, padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1.5rem', color: '#2c3e50' }}>Behavioral Ratings</h3>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="userDropdown" style={{ fontWeight: 'bold', marginRight: '10px' }}>Select User:</label>
            <select
              id="userDropdown"
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value)}
              style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
            >
              <option value="All Users">All Users</option>
              {users.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          {/* Wrap only the chart (without the dropdown) for PDF capture */}
          <div ref={behavioralChartRef}>
            <Bar data={aggregatedRatingsChartData} options={behavioralChartOptions} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' }}>
        {/* Sentiment Data Table */}
        <div 
          style={{ flex: '1', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
          ref={sentimentTableRef}
        >
          <h3 style={{ fontSize: '1.25rem', color: '#2c3e50' }}>User Sentiment Data</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>User</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Sentiment</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Feedback</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {eventSentiments.map((sentiment, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {sentiment.userName}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {sentiment.sentiment}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {sentiment.feedback}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {sentiment.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Aggregated Ratings and Interpretations */}
        <div 
          style={{ flex: '1', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
          ref={aggregatedRatingsRef}
        >
          <h3 style={{ fontSize: '1.25rem', color: '#2c3e50' }}>Aggregated Ratings</h3>
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {aggregatedRatings.map(rating => (
              <li key={rating.trait} style={{ padding: '5px 0', fontSize: '1rem' }}>
                <span style={{ fontWeight: 'bold' }}>{rating.trait}:</span> {rating.averageRating} 
                {selectedUser === "All Users" && ` (Total Responses: ${rating.totalResponses})`}
                <br />
                <em>{rating.interpretation}</em>
              </li>
            ))}
          </ul>

          {overallInterpretation && (
            <div style={{ marginTop: '20px', padding: '10px', background: '#f9f9f9', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#2c3e50' }}>Overall Interpretation</h3>
              <p>{overallInterpretation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewReports;
