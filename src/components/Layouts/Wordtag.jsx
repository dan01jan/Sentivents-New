import React, { useState, useEffect } from 'react';
import WordCloud from 'react-wordcloud';

const Wordtag = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [comments, setComments] = useState([]);
  const [eventType, setEventType] = useState(''); // For filtering by type

  // Fetch events with optional filtering by type
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/v1/events${eventType ? `?type=${eventType}` : ''}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          console.error('No events found:', data);
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [eventType]);

  // Fetch comments for the selected event
  const fetchComments = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/events/${eventId}/comments`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    if (eventId) fetchComments(eventId);
  };

  const handleTypeChange = (e) => {
    setEventType(e.target.value);
  };

  // Prepare words for Word Cloud
  const words = comments.map((comment) => ({
    text: comment.text, // Assuming comments have a "text" field
    value: Math.floor(Math.random() * 100) + 10, // Random size for demonstration
  }));

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <h1 style={{ color: '#ff6b6b', fontFamily: 'Comic Sans MS' }}>Word Cloud</h1>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>

      <select
        value={selectedEvent}
        onChange={handleEventChange}
        style={{
            padding: '10px',
            borderRadius: '20px',
            border: '2px solid #ff6b6b',
            fontFamily: 'Comic Sans MS',
            fontSize: '0.8rem', // Move fontSize here
        }}
        >
        <option value="">Select an Event</option>
        {events.map((event) => (
            <option key={event._id} value={event._id}>
            {event.name}
            </option>
        ))}
        </select>

      </div>
      {comments.length > 0 ? (
        <div style={{ width: '80%', margin: '0 auto' }}>
          <WordCloud
            words={words}
            options={{
              rotations: 2,
              rotationAngles: [-90, 0],
              fontSizes: [20, 60],
              colors: ['#ff6b6b', '#6bc5ff', '#ffe66b', '#6bff95'],
              enableTooltip: true,
            }}
          />
        </div>
      ) : (
        <p style={{ color: '#6b6b6b', fontFamily: 'Comic Sans MS' }}>No comments to display.</p>
      )}
    </div>
  );
};

export default Wordtag;
