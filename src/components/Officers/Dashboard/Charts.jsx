import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const apiUrl = import.meta.env.VITE_API_URL;

const Charts = () => {
  const [aggregatedRatings, setAggregatedRatings] = useState([]);
  const [eventId, setEventId] = useState(''); // Replace with actual eventId or provide a dropdown for selection

  useEffect(() => {
    const fetchAggregatedRatings = async () => {
      try {
        const response = await fetch(`${apiUrl}events/aggregated-ratings?eventId=${eventId}`);
        const data = await response.json();
        if (data.aggregatedRatings) {
          setAggregatedRatings(data.aggregatedRatings);
        }
      } catch (error) {
        console.error('Error fetching aggregated ratings:', error);
      }
    };

    if (eventId) {
      fetchAggregatedRatings();
    }
  }, [eventId]);

  return (
    <div style={{ width: '100%', height: '400px', textAlign: 'center' }}>
      <h2 style={{ color: '#6b5b95', fontFamily: 'Arial' }}>Sentiment Analysis Chart</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={aggregatedRatings}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="trait" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="Sentiment Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
