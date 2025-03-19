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
  const [generatedInterpretation, setGeneratedInterpretation] = useState("");
  const [loading, setLoading] = useState(true);

  // NEW: States to hold the aggregated data from ALL USERS (never overridden)
  const [allUsersAggregatedRatings, setAllUsersAggregatedRatings] = useState([]);
  const [allUsersOverallInterpretation, setAllUsersOverallInterpretation] = useState("");

  // States for users, selected user, and per-user behavioral analysis data
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("All Users");
  const [userInfo, setUserInfo] = useState(null);
  const [userAnalyses, setUserAnalyses] = useState({});

  const selectedEvent = localStorage.getItem('selectedEventId');

  // Refs for PDF generation and layout containers
  const sentimentChartRef = useRef(null);
  const tablesContainerRef = useRef(null); // Container for left/right columns
  const uniqueInterpretationRef = useRef(null); // Container for Unique Overall Interpretation

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

  // Generate a unique overall interpretation based on ALL USERS aggregated data.
  // It always uses the allUsersOverallInterpretation and allUsersAggregatedRatings,
  // regardless of the selected user.
  const generateUniqueInterpretation = () => {
    const parts = [];

    // 1. Add the overall interpretation from ALL USERS.
    if (allUsersOverallInterpretation) {
      parts.push(allUsersOverallInterpretation);
    }

    // 2. Generate sentiment-based interpretations.
    if (sentimentCounts.positive >= sentimentCounts.negative && sentimentCounts.positive >= sentimentCounts.neutral) {
      const positiveInterpretations = [
        "The overall sentiment is very positive, indicating that participants are highly satisfied with the event.",
        "Feedback shows an abundance of positive sentiment, suggesting that the event resonated well with the audience.",
        "The majority of reactions are positive, highlighting the success and impact of the event.",
        "With a preponderance of positive feedback, it’s clear that the event was well-received and inspiring.",
        "Participants expressed overwhelmingly positive emotions, reinforcing the event's effectiveness.",
      ];
      positiveInterpretations.forEach(msg => parts.push(msg));
    } else if (sentimentCounts.negative > sentimentCounts.positive && sentimentCounts.negative > sentimentCounts.neutral) {
      const negativeInterpretations = [
        "The overall sentiment leans negative, suggesting that there are areas needing improvement.",
        "Feedback is predominantly negative, indicating dissatisfaction among participants.",
        "A significant number of negative responses point to potential shortcomings in the event.",
        "The negative sentiment is notable, implying that the event might have fallen short of expectations.",
        "Participants expressed strong negative feelings, signaling that urgent improvements are necessary.",
      ];
      negativeInterpretations.forEach(msg => parts.push(msg));
    } else {
      const balancedInterpretations = [
        "The feedback reflects a balanced mix of emotions, showing both strengths and areas for growth.",
        "The sentiment is evenly distributed, suggesting that while many enjoyed the event, some aspects could be refined.",
        "There is an equal measure of positive and negative feedback, indicating room for improvement while acknowledging successes.",
        "The event elicited a variety of responses, revealing both commendable aspects and points that warrant attention.",
        "The sentiment analysis shows a mix of emotions, emphasizing the need for a nuanced approach in future events.",
      ];
      balancedInterpretations.forEach(msg => parts.push(msg));
    }

    // 3. Append trait interpretations based on ALL USERS aggregated ratings.
    if (allUsersAggregatedRatings.length > 0) {
      allUsersAggregatedRatings.forEach(rating => {
        if (rating.interpretation) {
          parts.push(`${rating.trait} analysis: ${rating.interpretation}`);
        }
      });
    }

    // Combine parts into a single interpretation string.
    return parts.join(" ");
  };

  // Update the generated interpretation always based on ALL USERS data.
  useEffect(() => {
    if (
      allUsersOverallInterpretation &&
      Object.keys(sentimentCounts).length > 0 &&
      allUsersAggregatedRatings.length > 0
    ) {
      const uniqueInterpretation = generateUniqueInterpretation();
      setGeneratedInterpretation(uniqueInterpretation);
    }
  }, [allUsersOverallInterpretation, sentimentCounts, allUsersAggregatedRatings]);

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
      setSelectedUser("All Users");
    } catch (error) {
      console.error("Error fetching sentiment data", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch aggregated ratings and overall interpretation for all users
  const fetchAggregatedData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (selectedEvent && token) {
        const response = await axios.get(`${apiUrl}questionnaires/aggregated-ratings`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { eventId: selectedEvent },
        });

        if (response.data) {
          // Update both the displayed aggregated ratings and the all-users version
          setAggregatedRatings(response.data.aggregatedRatings || []);
          setAllUsersAggregatedRatings(response.data.aggregatedRatings || []);
          if (response.data.overallInterpretation) {
            setOverallInterpretation(response.data.overallInterpretation);
            setAllUsersOverallInterpretation(response.data.overallInterpretation);
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
      console.error("Error fetching aggregated data:", error.message);
    }
  };

  // Fetch behavioral analysis for a specific user
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
          setUserAnalyses(prev => ({ ...prev, [userId]: response.data }));
        }
      }
    } catch (error) {
      console.error(`Error fetching analysis for user ${userId}:`, error);
    }
  };

  // Fetch ratings for a specific user
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

  // Prepare data for the behavioral ratings bar chart (for UI display)
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

  // PDF Generation: Capture Sentiment Chart, the two-column container, and the Unique Overall Interpretation.
  const handleDownloadPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yOffset = 10;

      // Capture Sentiment Chart
      const sentimentChartCanvas = await html2canvas(sentimentChartRef.current);
      const sentimentChartData = sentimentChartCanvas.toDataURL('image/png');
      pdf.setFontSize(16);
      pdf.text("Sentiment Analysis", pageWidth / 2, yOffset, { align: "center" });
      yOffset += 10;
      const chartImgProps = pdf.getImageProperties(sentimentChartData);
      const chartWidth = pageWidth - 20;
      const chartHeight = (chartImgProps.height * chartWidth) / chartImgProps.width;
      pdf.addImage(sentimentChartData, 'PNG', 10, yOffset, chartWidth, chartHeight);
      yOffset += chartHeight + 10;

      // Capture Two-Column Container (tablesContainerRef)
      const tablesCanvas = await html2canvas(tablesContainerRef.current);
      const tablesData = tablesCanvas.toDataURL('image/png');
      const tablesImgProps = pdf.getImageProperties(tablesData);
      const tablesWidth = pageWidth - 20;
      const tablesHeight = (tablesImgProps.height * tablesWidth) / tablesImgProps.width;
      if (yOffset + tablesHeight > pdf.internal.pageSize.getHeight()) {
        pdf.addPage();
        yOffset = 10;
      }
      pdf.addImage(tablesData, 'PNG', 10, yOffset, tablesWidth, tablesHeight);

      // Capture Unique Overall Interpretation Container on a new page
      pdf.addPage();
      yOffset = 10;
      const uniqueCanvas = await html2canvas(uniqueInterpretationRef.current);
      const uniqueData = uniqueCanvas.toDataURL('image/png');
      const uniqueImgProps = pdf.getImageProperties(uniqueData);
      const uniqueWidth = pageWidth - 20;
      const uniqueHeight = (uniqueImgProps.height * uniqueWidth) / uniqueImgProps.width;
      pdf.addImage(uniqueData, 'PNG', 10, yOffset, uniqueWidth, uniqueHeight);

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
      {/* Header & PDF Download Button */}
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

      {/* Top Charts Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' }}>
        {/* Sentiment Distribution Chart */}
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

        {/* Behavioral Ratings Chart with User Dropdown */}
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
          <Bar data={aggregatedRatingsChartData} options={behavioralChartOptions} />
        </div>
      </div>

      {/* Two Columns Container */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginTop: '20px'
        }}
        ref={tablesContainerRef}
      >
        {/* Left Column: Vertical Stack */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* User Sentiment Data Table */}
          <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', maxHeight: '400px', overflowY: 'auto' }}>
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

          {/* Behavioral Analysis Per User Table */}
          <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#2c3e50' }}>Behavioral Analysis Per User</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>OCEAN Breakdown Ratings</th>
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

        {/* Right Column: Aggregated Ratings and Overall Interpretations */}
        <div style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px', maxHeight: '850px', overflowY: 'auto' }}>
          {aggregatedRatings.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#2c3e50' }}>OCEAN Breakdown Ratings</h3>
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
            </div>
          )}

          {overallInterpretation && (
            <div style={{ marginTop: '20px', padding: '10px', background: '#f9f9f9', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#2c3e50' }}>Overall Interpretation</h3>
              <p>{overallInterpretation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Unique Overall Interpretation Section */}
      <div
        style={{
          marginTop: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '10px'
        }}
        ref={uniqueInterpretationRef}
      >
        {generatedInterpretation && (
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#2c3e50' }}>Event's Overall Interpretation</h3>
            <p>{generatedInterpretation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReports;
