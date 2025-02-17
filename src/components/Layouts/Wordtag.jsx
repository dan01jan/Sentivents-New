import React, { useState, useEffect } from "react";
import WordCloud from "react-wordcloud";
const apiUrl = import.meta.env.VITE_API_URL;

const Wordtag = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [comments, setComments] = useState([]);
  const [eventType, setEventType] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `${apiUrl}events${eventType ? `?type=${eventType}` : ""}`
        );
        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      }
    };
    fetchEvents();
  }, [eventType]);

  const fetchComments = async (eventId) => {
    try {
      const response = await fetch(`${apiUrl}events/${eventId}/comments`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    if (eventId) fetchComments(eventId);
  };

  const words = comments.map((comment) => ({
    text: comment.text,
    value: Math.floor(Math.random() * 100) + 10,
  }));

  return (
    <div className="text-center my-6">
      <h1 className="text-red-500 font-bold text-2xl mb-4">Word Cloud</h1>
      <div className="mb-4 flex justify-center gap-4">
        <select
          value={selectedEvent}
          onChange={handleEventChange}
          className="px-4 py-2 rounded-full border-2 border-red-500 text-sm"
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
        <div className="w-4/5 mx-auto">
          <WordCloud
            words={words}
            options={{
              rotations: 2,
              rotationAngles: [-90, 0],
              fontSizes: [20, 60],
              colors: ["#ff6b6b", "#6bc5ff", "#ffe66b", "#6bff95"],
              enableTooltip: true,
            }}
          />
        </div>
      ) : (
        <p className="text-gray-500">No comments to display.</p>
      )}
    </div>
  );
};

export default Wordtag;
