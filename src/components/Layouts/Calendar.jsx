import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarComponent.css';

const CalendarComponent = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      navigate('/');
      return;
    }
  
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/v1/events/event/events');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched Events:', data); // Check the data
          setEvents(data);
        } else {
          console.error('Failed to fetch events');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
    fetchEvents();
  }, [navigate]);
  

  const handleDateChange = (date) => {
    const normalizedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    setSelectedDate(normalizedDate);
  };
  const renderEvents = () => {
    const filteredEvents = events.filter((event) => {
      const eventStart = new Date(event.dateStart);
      const eventEnd = new Date(event.dateEnd);
      const selected = selectedDate.toISOString().split('T')[0];
      const start = eventStart.toISOString().split('T')[0];
      const end = eventEnd.toISOString().split('T')[0];
      return selected >= start && selected <= end;
    });
  
    console.log('Filtered Events:', filteredEvents); // Inspect the filtered events
  
    return filteredEvents.length > 0 ? (
      <div className="event-cards-container">
        {filteredEvents.map((event) => (
          <div key={event._id} className="event-card">
            <div className="event-images">
              {event.images && event.images.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Event image ${index + 1}`}
                  className="event-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    console.log('Image load error:', e.target.src); // Log error for debugging
                    e.target.src = 'default-image.jpg';  // Fallback to default image if error
                  }}
                />
              ))}
            </div>
            <div className="event-info">
              <div className="event-name">{event.name}</div>
              <div className="event-description">{event.description}</div>
              {/* <div className="event-type">Type: {event.type}</div>
              <div className="event-organization">Organization: {event.organization}</div>
              <div className="event-department">Department: {event.department}</div>
              <div className="event-location">Location: {event.location}</div> */}
              <div className="event-dates">
                <strong>Start Date:</strong> {new Date(event.dateStart).toLocaleDateString()}<br />
                <strong>End Date:</strong> {new Date(event.dateEnd).toLocaleDateString()}
              </div>
              <div className="event-comments">
                {event.comments && event.comments.length > 0 ? (
                  event.comments.map((comment) => (
                    <div key={comment._id} className="comment">
                      <p><strong>User:</strong> {comment.user}</p>
                      <p>{comment.text}</p>
                      <p><em>Posted on: {new Date(comment.createdAt).toLocaleDateString()}</em></p>
                    </div>
                  ))
                ) : (
                  <p>No comments yet.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p>No events on this day.</p>
    );
  };
  
  
  const groupEventsByMonth = () => {
    const grouped = {};
    events.forEach((event) => {
      const eventStart = new Date(event.dateStart);
      const monthYear = `${eventStart.getMonth() + 1}-${eventStart.getFullYear()}`;

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }

      grouped[monthYear].push(event);
    });

    return grouped;
  };

  const renderEventsByMonth = () => {
    const groupedEvents = groupEventsByMonth();
  
    return Object.keys(groupedEvents).length > 0 ? (
      <div className="monthly-events-container">
        <h2 className="events-heading">Events by Month:</h2>
        {Object.keys(groupedEvents).map((monthYear) => (
          <div key={monthYear} className="month-group">
            <h3>{monthYear}</h3>
            <div className="event-cards-container">
              {groupedEvents[monthYear].map((event) => (
                <div key={event._id} className="event-card">
                  {/* Rendering multiple images from Cloudinary */}
                  <div className="event-images">
                    {event.images && event.images.map((imageUrl, index) => (
                      <img
                        key={index}
                        src={imageUrl}
                        alt={`Event image ${index + 1}`}
                        className="event-image"
                      />
                    ))}
                  </div>
                  <div className="event-info">
                    <div className="event-name">{event.name}</div>
                    <button className="view-details-btn" onClick={() => alert(`Viewing details for ${event.name}`)}>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p>No events for this month.</p>
    );
  };
  

  const highlightEventDates = ({ date }) => {
    const dateString = date.toISOString().split('T')[0];
    const hasEvent = events.some((event) => {
      const eventStart = new Date(event.dateStart).toISOString().split('T')[0];
      const eventEnd = new Date(event.dateEnd).toISOString().split('T')[0];
      return dateString >= eventStart && dateString <= eventEnd;
    });

    return hasEvent ? 'highlight' : null;
  };

  return (
    <div className="calendar-container">
      <h1 className="calendar-title">Event Calendar</h1>
      <div className="calendar-wrapper">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={highlightEventDates}
          className="calendar"
        />
        <div className="event-list-container">
          <h2 className="events-heading">Events on {selectedDate.toDateString()}:</h2>
          {renderEvents()}
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
