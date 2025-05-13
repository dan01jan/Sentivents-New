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

  // Fetch sentiment counts and details for the event
  const fetchSentimentData = async (eventId) => {
    try {
      setLoading(true);

      // Fetch sentiment counts (positive, negative, neutral)
      const sentimentResponse = await axios.get(`${apiUrl}ratings/${eventId}?type=counts`);
      console.log("Sentiment counts response:", sentimentResponse.data);
      setSentimentCounts(sentimentResponse.data);

      // Fetch sentiment details for the data table
      const sentimentsResponse = await axios.get(`${apiUrl}ratings/${eventId}?type=details`);
      console.log("Sentiment details raw response:", sentimentsResponse.data);
      if (sentimentsResponse.data && sentimentsResponse.data.length > 0) {
        // Map the response and ensure proper keys are available
        const sentimentsWithNames = sentimentsResponse.data.map(item => {
          // Check if the item contains a populated 'user'
          const userName = item.user && item.user.name ? item.user.name : 'Unknown';
          return {
            ...item,
            userName,
            userSentiment: item.sentiment || 'No Sentiment',
          };
        });
        console.log("Mapped sentiment details:", sentimentsWithNames);
        setEventSentiments(sentimentsWithNames);
      } else {
        setEventSentiments([]);
      }
      // Always reset the selected user back to "All Users" after fetching sentiments
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
          console.log("Aggregated data response:", response.data);
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
              userId: userId.toString(), // Convert userId to string to keep it consistent with dropdown values
              name: `${userResponse.data.name} ${userResponse.data.surname}`,
            };
          });

          const usersWithNames = await Promise.all(userInfos);
          console.log("Fetched users:", usersWithNames);
          setUsers(usersWithNames);
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
        // Make sure to pass the userId (as a string) if necessary
        if (selectedUser && selectedUser !== "All Users") {
          params.userId = selectedUser; // if your backend expects a number, consider using parseInt(selectedUser)
        }
        const response = await axios.get(`${apiUrl}questionnaires/aggregated-ratings`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        if (response.data) {
          console.log("User-specific aggregated response:", response.data);
          setAggregatedRatings(response.data.aggregatedRatings || []);
          if (response.data.overallInterpretation) {
            setOverallInterpretation(response.data.overallInterpretation);
          }
          if (response.data.userInfo) {
            setUserInfo(response.data.userInfo);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user-specific ratings:", error.message);
    }
  };

  // Generate a unique overall interpretation based on ALL USERS aggregated data.
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

    return parts.join(" ");
  };

  // Update the generated interpretation based on ALL USERS data.
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

  // Initial fetching of sentiment data and aggregated ratings when the event changes
  useEffect(() => {
    if (selectedEvent) {
      fetchSentimentData(selectedEvent);
      fetchAggregatedData();
    } else {
      console.error("No event selected.");
    }
  }, [selectedEvent]);

  // Fetch per-user behavioral analysis when the users list updates.
  useEffect(() => {
    if (users.length > 0) {
      users.forEach((user) => {
        fetchUserAnalysis(user.userId);
      });
    }
  }, [users]);

  // Watch selectedEvent and selectedUser to refresh aggregated/user-specific ratings.
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
    <div className="font-sans text-gray-800 p-4">
      <div className="flex flex-row items-center justify-between mb-6 gap-4">
        <h2 className="font-semibold text-2xl sm:text-3xl text-[#3a1078]">Event Reports</h2>
        <button
          onClick={handleDownloadPDF}
          className="text-[#3b5998] text-2xl hover:text-[#2a4470] transition"
          title="Download PDF"
        >
          <FaDownload />
        </button>
      </div>
      {/* Top Charts Section */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Sentiment Chart */}
        <div className="flex-1 p-4 border border-gray-300 rounded-lg" ref={sentimentChartRef}>
          <h3 className="text-lg font-semibold text-[#3a1078] mb-3">Sentiment Distribution</h3>
          <Bar
            data={{
              labels: ['Positive', 'Negative', 'Neutral'],
              datasets: [
                {
                  data: [
                    sentimentCounts.positive || 0,
                    sentimentCounts.negative || 0,
                    sentimentCounts.neutral || 0,
                  ],
                  backgroundColor: ['#58d68d', '#e74c3c', '#f39c12'],
                  borderColor: ['#45b16d', '#e23d2f', '#d48e1e'],
                  borderWidth: 1,
                },
              ],
            }}
            options={sentimentChartOptions}
          />
        </div>

        {/* Ratings Chart */}
        <div className="flex-1 p-4 border border-gray-300 rounded-lg">
          <h3 className="text-lg font-semibold text-[#3a1078] mb-3">Behavioral Ratings</h3>
          <div className="mb-4">
            <label htmlFor="userDropdown" className="text-sm font-medium mr-2 text-[#3a1078]">
              Select User:
            </label>
            <select
              id="userDropdown"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="p-2 rounded border border-gray-300 w-full sm:w-auto"
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

      {/* Two Columns Section */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6" ref={tablesContainerRef}>
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Sentiment Table */}
          <div className="p-4 border border-gray-300 rounded-lg max-h-[400px] overflow-y-auto">
            <h3 className="text-lg font-semibold text-[#3a1078] mb-3">User Sentiment Data</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-sm">
                    <th className="p-2 border">User</th>
                    <th className="p-2 border">Sentiment</th>
                    <th className="p-2 border">Feedback</th>
                    <th className="p-2 border">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {eventSentiments.map((sentiment, index) => (
                    <tr key={index} className="text-sm">
                      <td className="p-2 border">{sentiment.userName}</td>
                      <td className="p-2 border">{sentiment.sentiment}</td>
                      <td className="p-2 border">{sentiment.feedback}</td>
                      <td className="p-2 border">{sentiment.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Behavioral Table */}
          <div className="p-4 border border-gray-300 rounded-lg max-h-[400px] overflow-y-auto">
            <h3 className="text-lg font-semibold text-[#3a1078] mb-3">Behavioral Analysis Per User</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-sm">
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">OCEAN Ratings</th>
                    <th className="p-2 border">Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const analysis = userAnalyses[user.userId];
                    const ratingsSummary =
                      analysis && analysis.aggregatedRatings
                        ? analysis.aggregatedRatings.map((r) => `${r.trait}: ${r.averageRating}`).join(', ')
                        : 'N/A';
                    const userInterpretation =
                      analysis && analysis.overallInterpretation ? analysis.overallInterpretation : 'N/A';
                    return (
                      <tr key={user.userId} className="text-sm">
                        <td className="p-2 border">{user.name}</td>
                        <td className="p-2 border">{ratingsSummary}</td>
                        <td className="p-2 border">{userInterpretation}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 p-4 border border-gray-300 rounded-lg max-h-[850px] overflow-y-auto">
          {aggregatedRatings.length > 0 && (
            <div>
              <h3 className="text-lg text-[#3a1078] mb-2 font-semibold">OCEAN Breakdown Ratings</h3>
              <ul className="list-none pl-0 text-sm">
                {aggregatedRatings.map((rating) => (
                  <li key={rating.trait} className="py-1">
                    <span className="font-bold">{rating.trait}:</span> {rating.averageRating}{' '}
                    {selectedUser === 'All Users' && ` (Total Responses: ${rating.totalResponses})`}
                    <br />
                    <em>{rating.interpretation}</em>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {overallInterpretation && (
            <div className="mt-5 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-lg text-[#2c3e50] mb-1">Overall Interpretation</h3>
              <p className="text-sm">{overallInterpretation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Final Interpretation */}
      <div className="mt-6 border border-gray-300 rounded-lg p-4" ref={uniqueInterpretationRef}>
        {generatedInterpretation && (
          <div>
            <h3 className="text-lg text-[#3a1078] mb-1 font-semibold">Event's Overall Interpretation</h3>
            <p className="text-sm">{generatedInterpretation}</p>
          </div>
        )}
      </div>
    </div>
  );


};

export default ViewReports;
