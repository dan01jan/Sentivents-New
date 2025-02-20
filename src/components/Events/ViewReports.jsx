import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2'; // Only Bar chart is used now
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
const apiUrl = import.meta.env.VITE_API_URL;

// Register necessary chart components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const ViewReports = () => {
  const [aggregatedRatings, setAggregatedRatings] = useState([]);
  const [sentimentCounts, setSentimentCounts] = useState({});
  const [eventSentiments, setEventSentiments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const selectedEvent = localStorage.getItem('selectedEventId'); // or use context for selected event

  useEffect(() => {
    if (selectedEvent) {
      fetchData(selectedEvent);
    } else {
      console.error("No event selected.");
    }
  }, [selectedEvent]);

  const fetchData = async (eventId) => {
    try {
      console.log('Fetching data for event ID:', eventId);
      setLoading(true);
      // Fetch sentiment counts (positive, negative, neutral)
      const sentimentResponse = await axios.get(`${apiUrl}ratings/${eventId}?type=counts`);
      console.log('Sentiment data:', sentimentResponse.data);
      setSentimentCounts(sentimentResponse.data);

      // Fetch aggregated ratings
      const ratingsResponse = await axios.get(`${apiUrl}questionnaires/aggregated-ratings?eventId=${eventId}`);
      console.log('Aggregated ratings data:', ratingsResponse.data);
      setAggregatedRatings(ratingsResponse.data.aggregatedRatings);

      // Fetch user sentiment details
      const sentimentsResponse = await axios.get(`${apiUrl}ratings/${eventId}?type=details`);
      console.log('User sentiment details:', sentimentsResponse.data);

      // Modify the data to include userName
      if (sentimentsResponse.data && sentimentsResponse.data.length > 0) {
        const sentimentsWithNames = sentimentsResponse.data.map(item => ({
          ...item,
          userName: item.user ? item.user.name : 'Unknown',  // Ensure userName is set
          userSentiment: item.sentiment || 'No Sentiment'     // Add the sentiment info
        }));
        setEventSentiments(sentimentsWithNames);
      } else {
        console.log('No sentiments data found for this event.');
        setEventSentiments([]);
      }

    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const aggregatedRatingsLabels = aggregatedRatings.map(rating => rating.trait);
  const aggregatedRatingsData = aggregatedRatings.map(rating => rating.averageRating);

  // Bar Chart Data for Behavioral Ratings (horizontal bars)
  const aggregatedRatingsChartData = {
    labels: aggregatedRatingsLabels,
    datasets: [
      {
        label: 'Trait Ratings',
        data: aggregatedRatingsData,
        backgroundColor: [
          'rgba(53, 162, 235, 0.6)',  // Example color for Neuroticism
          'rgba(77, 189, 104, 0.6)',  // Example color for Extraversion
          'rgba(255, 159, 64, 0.6)',  // Example color for Openness to Experience
          'rgba(255, 99, 132, 0.6)',  // Example color for Agreeableness
          'rgba(153, 102, 255, 0.6)', // Example color for Conscientiousness
        ],
        borderColor: [
          'rgba(53, 162, 235, 1)',  // Example border color for Neuroticism
          'rgba(77, 189, 104, 1)',  // Example border color for Extraversion
          'rgba(255, 159, 64, 1)',  // Example border color for Openness to Experience
          'rgba(255, 99, 132, 1)',  // Example border color for Agreeableness
          'rgba(153, 102, 255, 1)', // Example border color for Conscientiousness
        ],
        borderWidth: 2,
      },
    ],
  };

  // Bar Chart Options for both charts
  const sentimentChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  // Horizontal Bar Chart Options for Behavioral Ratings
  const behavioralChartOptions = {
    responsive: true,
    indexAxis: 'y', // Makes the bars horizontal for Behavioral Ratings
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', padding: '10px' }}>
      <h2 style={{ color: '#3b5998', fontSize: '1.5rem', textAlign: 'center' }}>Event Reports</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' }}>
        {/* Sentiment Chart (Vertical Bars) */}
        <div style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#2c3e50' }}>Sentiment Distribution</h3>
          <Bar data={{
            labels: ['Positive', 'Negative', 'Neutral'],
            datasets: [{
              data: [sentimentCounts.positive || 0, sentimentCounts.negative || 0, sentimentCounts.neutral || 0],
              backgroundColor: ['#58d68d', '#e74c3c', '#f39c12'],
              borderColor: ['#45b16d', '#e23d2f', '#d48e1e'],
              borderWidth: 1,
            }],
          }} options={sentimentChartOptions} />
        </div>

        {/* Behavioral Ratings Bar Chart (Horizontal Bars) */}
        <div style={{ flex: 1, padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1.5rem', color: '#2c3e50' }}>Behavioral Ratings</h3>
          <Bar data={aggregatedRatingsChartData} options={behavioralChartOptions} />
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
                  <td style={{ padding: '8px', border: '1px solid #ddd' }} >
                    {sentiment.userName}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }} >
                    {sentiment.sentiment}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }} >
                    {sentiment.feedback}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }} >
                    {sentiment.score}
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
