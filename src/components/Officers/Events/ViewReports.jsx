import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { FaDownload } from 'react-icons/fa';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const apiUrl = import.meta.env.VITE_API_URL;

// Register necessary chart components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const ViewReports = () => {
  // States for sentiment and aggregated (all-users) data
  const [aggregatedRatings, setAggregatedRatings] = useState([]);
  const [sentimentCounts, setSentimentCounts] = useState({});
  const [eventSentiments, setEventSentiments] = useState([]);
  const [overallInterpretation, setOverallInterpretation] = useState("");
  const [loading, setLoading] = useState(true);

  // States for users, selected user, and per-user behavioral analysis data
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("All Users");
  const [userInfo, setUserInfo] = useState(null);
  const [userAnalyses, setUserAnalyses] = useState({});

  const selectedEvent = localStorage.getItem('selectedEventId');

  // Refs for PDF generation:
  const sentimentChartRef = useRef(null);
  const sentimentTableRef = useRef(null);
  const behavioralTableRef = useRef(null); // New ref for the Behavioral Analysis per User table
  const aggregatedRatingsRef = useRef(null);

  useEffect(() => {
    if (selectedEvent) {
      fetchSentimentData(selectedEvent);
      fetchAggregatedData(selectedEvent);
    } else {
      console.error("No event selected.");
    }
  }, [selectedEvent]);

  // When the users list updates, fetch behavioral analysis for each user
  useEffect(() => {
    if (users.length > 0) {
      users.forEach((user) => {
        fetchUserAnalysis(user.userId);
      });
    }
  }, [users]);

  useEffect(() => {
    console.log("Selected Event:", selectedEvent);
    console.log("Selected User:", selectedUser);

    if (selectedEvent) {
      if (selectedUser === "All Users") {
        console.log("Fetching data for all users");
        fetchAggregatedData();
      } else {
        console.log("Fetching data for specific user:", selectedUser);
        fetchUserRatings();
      }
    }
  }, [selectedEvent, selectedUser]);

  // Fetch sentiment counts and details for the event
  const fetchSentimentData = async (eventId) => {
    try {
      setLoading(true);
      // Fetch sentiment counts (positive, negative, neutral)
      const sentimentResponse = await axios.get(`${apiUrl}ratings/${eventId}?type=counts`);
      setSentimentCounts(sentimentResponse.data);

      // Fetch sentiment details for the data table
      const sentimentsResponse = await axios.get(`${apiUrl}ratings/${eventId}?type=details`);
      if (sentimentsResponse.data && sentimentsResponse.data.length > 0) {
        const sentimentsWithNames = sentimentsResponse.data.map(item => ({
          ...item,
          userName: item.user ? item.user.name : 'Unknown',
          userSentiment: item.sentiment || 'No Sentiment'
        }));
        setEventSentiments(sentimentsWithNames);
      } else {
        setEventSentiments([]);
      }
      // Set default selected user to "All Users"
      setSelectedUser("All Users");
    } catch (error) {
      console.error("Error fetching sentiment data", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch aggregated ratings and overall interpretation for all users (used when "All Users" is selected)
  const fetchAggregatedData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (selectedEvent && token) {
        const response = await axios.get(`${apiUrl}questionnaires/aggregated-ratings`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { eventId: selectedEvent },
        });

        if (response.data) {
          setAggregatedRatings(response.data.aggregatedRatings || []);
          if (response.data.overallInterpretation) {
            setOverallInterpretation(response.data.overallInterpretation);
          }
          // Fetch user info for each userId (assuming response.data.users is an array of user IDs)
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
      console.error("Error fetching aggregated data:", error.message);
    }
  };

  // Fetch behavioral analysis (aggregated ratings, interpretation) for a specific user
  const fetchUserAnalysis = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (selectedEvent && token) {
        const params = { eventId: selectedEvent, userId };
        const response = await axios.get(`${apiUrl}questionnaires/aggregated-ratings`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        if (response.data) {
          // Save analysis data for this user in an object keyed by userId
          setUserAnalyses(prev => ({ ...prev, [userId]: response.data }));
        }
      }
    } catch (error) {
      console.error(`Error fetching analysis for user ${userId}:`, error);
    }
  };

  // Fetch ratings for a specific user (when one is selected from the dropdown)
  const fetchUserRatings = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (selectedEvent && token) {
        const params = { eventId: selectedEvent };
        if (selectedUser) {
          params.userId = selectedUser;
        }
        const response = await axios.get(`${apiUrl}questionnaires/aggregated-ratings`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
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

  // Prepare data for the behavioral ratings bar chart (for the visible UI)
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
  // It captures the Sentiment Graph, the User Sentiment Data table, and the Behavioral Analysis per User table.
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

      // Add Sentiment Analysis Section
      pdf.setFontSize(16);
      pdf.text("Sentiment Analysis", pageWidth / 2, yOffset, { align: "center" });
      yOffset += 10;

      const chartImgProps = pdf.getImageProperties(sentimentChartData);
      const chartWidth = pageWidth - 20;
      const chartHeight = (chartImgProps.height * chartWidth) / chartImgProps.width;
      pdf.addImage(sentimentChartData, 'PNG', 10, yOffset, chartWidth, chartHeight);
      yOffset += chartHeight + 10;

      const tableImgProps = pdf.getImageProperties(sentimentTableData);
      const tableWidth = pageWidth - 20;
      const tableHeight = (tableImgProps.height * tableWidth) / tableImgProps.width;
      if (yOffset + tableHeight > pdf.internal.pageSize.getHeight()) {
        pdf.addPage();
        yOffset = 10;
      }
      pdf.addImage(sentimentTableData, 'PNG', 10, yOffset, tableWidth, tableHeight);

      // Add Behavioral Analysis per User Table on a new page
      pdf.addPage();
      yOffset = 10;
      pdf.setFontSize(16);
      pdf.text("Behavioral Analysis Per User", pageWidth / 2, yOffset, { align: "center" });
      yOffset += 10;
      const behavioralTableCanvas = await html2canvas(behavioralTableRef.current);
      const behavioralTableData = behavioralTableCanvas.toDataURL('image/png');
      const behavioralImgProps = pdf.getImageProperties(behavioralTableData);
      const behavioralWidth = pageWidth - 20;
      const behavioralHeight = (behavioralImgProps.height * behavioralWidth) / behavioralImgProps.width;
      if (yOffset + behavioralHeight > pdf.internal.pageSize.getHeight()) {
        pdf.addPage();
        yOffset = 10;
      }
      pdf.addImage(behavioralTableData, 'PNG', 10, yOffset, behavioralWidth, behavioralHeight);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#3b5998', fontSize: '1.5rem', marginRight: '10px' }}>Event Reports</h2>
        <button
          onClick={handleDownloadPDF}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            color: '#3b5998',
          }}
          title="Download PDF"
        >
          <FaDownload />
        </button>
      </div>
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
              datasets: [
                {
                  data: [sentimentCounts.positive || 0, sentimentCounts.negative || 0, sentimentCounts.neutral || 0],
                  backgroundColor: ['#58d68d', '#e74c3c', '#f39c12'],
                  borderColor: ['#45b16d', '#e23d2f', '#d48e1e'],
                  borderWidth: 1,
                },
              ],
            }}
            options={sentimentChartOptions}
          />
        </div>

        {/* Behavioral Ratings Bar Chart (Visible Only for UI - Not included in PDF) */}
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
          {/* This chart is only for display in the UI */}
          <div>
            <Bar data={aggregatedRatingsChartData} options={behavioralChartOptions} />
          </div>
        </div>
      </div>

      {/* Sentiment Data Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' }}>
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
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sentiment.userName}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sentiment.sentiment}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sentiment.feedback}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sentiment.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Aggregated Ratings and Interpretations */}
        <div style={{ flex: '1', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} ref={aggregatedRatingsRef}>
          <h3 style={{ fontSize: '1.25rem', color: '#2c3e50' }}>Aggregated Ratings</h3>
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {aggregatedRatings.map(rating => (
              <li key={rating.trait} style={{ padding: '5px 0', fontSize: '1rem' }}>
                <span style={{ fontWeight: 'bold' }}>{rating.trait}:</span> {rating.averageRating}{' '}
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

      {/* New Table: Behavioral Analysis Per User */}
      <div style={{ marginTop: '20px', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }} ref={behavioralTableRef}>
        <h3 style={{ fontSize: '1.25rem', color: '#2c3e50' }}>Behavioral Analysis Per User</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Aggregated Ratings</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Overall Interpretations</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const analysis = userAnalyses[user.userId];
              const ratingsSummary =
                analysis && analysis.aggregatedRatings
                  ? analysis.aggregatedRatings.map(r => `${r.trait}: ${r.averageRating}`).join(', ')
                  : 'N/A';
              const userOverallInterpretation =
                analysis && analysis.overallInterpretation
                  ? analysis.overallInterpretation
                  : 'N/A';
              return (
                <tr key={user.userId}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{user.name}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{ratingsSummary}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{userOverallInterpretation}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewReports;
