import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Radar } from 'react-chartjs-2'; // Importing Bar and Radar chart
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, RadialLinearScale, PointElement, LineElement } from 'chart.js';
const apiUrl = import.meta.env.VITE_API_URL;

// Register necessary chart components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, RadialLinearScale, PointElement, LineElement);

const ViewReports = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [aggregatedRatings, setAggregatedRatings] = useState([]);
  const [sentimentCounts, setSentimentCounts] = useState({});
  const [eventSentiments, setEventSentiments] = useState([]); // Store sentiment data for users
  const [loading, setLoading] = useState(true);
  
  const selectedEvent = localStorage.getItem('selectedEventId'); // or use context for selected event

  useEffect(() => {
    if (selectedEvent) {
      fetchData(selectedEvent);
      fetchEventSentiments(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchData = async (eventId) => {
    try {
      setLoading(true);
      // Fetch sentiment counts (positive, negative, neutral)
      const sentimentResponse = await axios.get(`${apiUrl}ratings/${eventId}?type=counts`);
      setSentimentCounts(sentimentResponse.data);

      // Fetch aggregated ratings
      const ratingsResponse = await axios.get(`${apiUrl}questionnaires/aggregated-ratings?eventId=${eventId}`);
      setAggregatedRatings(ratingsResponse.data.aggregatedRatings);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users' sentiment details for the data table
  const fetchEventSentiments = async (eventId) => {
    try {
      const response = await axios.get(`${apiUrl}ratings/${eventId}?type=details`);
      if (response.data && response.data.length > 0) {
        const sentimentsWithNames = response.data.map(item => ({
          ...item,
          userName: item.user ? item.user.name : 'Unknown',  // Assuming user.name contains the user's name
          userSentiment: item.sentiment || 'No Sentiment'    // Add the sentiment info
        }));
        setEventSentiments(sentimentsWithNames);
      } else {
        console.log('No sentiments data found for this event.');
        setEventSentiments([]);
      }
    } catch (error) {
      console.error('Error fetching event sentiments:', error.response ? error.response.data : error.message);
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  // Chart data

  const sentimentChartData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [sentimentCounts.positive || 0, sentimentCounts.negative || 0, sentimentCounts.neutral || 0],
        backgroundColor: ['#58d68d', '#e74c3c', '#f39c12'],
        borderColor: ['#45b16d', '#e23d2f', '#d48e1e'], // Optional: Add border color for the bars
        borderWidth: 1,
      },
    ],
  };

  const aggregatedRatingsLabels = aggregatedRatings.map(rating => rating.trait);
  const aggregatedRatingsData = aggregatedRatings.map(rating => rating.averageRating);
  const aggregatedRatingsChartData = {
    labels: aggregatedRatingsLabels,
    datasets: [
      {
        label: 'Trait Ratings',
        data: aggregatedRatingsData,
        backgroundColor: 'rgba(72, 133, 237, 0.4)',
        borderColor: '#4885ed',
        borderWidth: 2,
        pointBackgroundColor: '#4885ed',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#4885ed',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', padding: '10px' }}>
      <h2 style={{ color: '#3b5998', fontSize: '1.5rem', textAlign: 'center' }}>Event Reports</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' }}>
        {/* Charts */}
        <div style={{ flexGrow: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#2c3e50' }}>Sentiment Distribution</h3>
          <Bar data={sentimentChartData} options={{ responsive: true }} /> {/* Bar Chart here */}
        </div>

        <div style={{ flexGrow: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#2c3e50' }}>Aggregated Trait Ratings</h3>
          <Radar data={aggregatedRatingsChartData} options={{ responsive: true }} />
        </div>
      </div>

      {/* Lists Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' }}>
        
          {/* Sentiment Data Table */}
        <div style={{ flex: '1', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
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
                    {sentiment.sentiment} {/* Sentiment field can be 'positive', 'negative', 'neutral' */}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {sentiment.feedback} {/* Assuming feedback is a string */}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {sentiment.score} {/* Assuming score is a number */}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>

        {/* Aggregated Ratings List */}
        <div style={{ flex: '1', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#2c3e50' }}>Aggregated Ratings</h3>
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {aggregatedRatings.map(rating => (
              <li key={rating.trait} style={{ padding: '5px 0', fontSize: '1rem' }}>
                <span style={{ fontWeight: 'bold' }}>{rating.trait}:</span> {rating.averageRating} (Total Responses: {rating.totalResponses})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ViewReports;
