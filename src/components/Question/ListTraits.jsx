import React, { useEffect, useState } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const ListTraits = () => {
  const [eventTypes, setEventTypes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEventTypes = async () => {
      console.log('Fetching event types from:', `${apiUrl}types/`);
      try {
        const response = await axios.get(`${apiUrl}types/`);
        console.log('Response status:', response.status);
        console.log('Response Data:', response.data);

        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          setEventTypes(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
          setError('Unexpected data format received');
        }
      } catch (err) {
        setError('Failed to fetch event types');
        console.error('Error fetching event types:', err);
        if (err.response) {
          console.error('Response status:', err.response.status);
          console.error('Response data:', err.response.data);
        }
      }
    };

    fetchEventTypes();
  }, []);

  return (
    <div>
      <h1>List of Event Types</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {eventTypes.length === 0 ? (
        <p>No event types available</p>
      ) : (
        <ul>
          {eventTypes.map((eventType) => (
            <li key={eventType._id}>{eventType.eventType}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListTraits;
