import React, { useState, useEffect } from "react";
import WordCloud from "react-wordcloud";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const apiUrl = import.meta.env.VITE_API_URL;

const Wordtag = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [comments, setComments] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [eventType, setEventType] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${apiUrl}events${eventType ? `?type=${eventType}` : ""}`);
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

  const fetchSentimentData = async (eventId) => {
    try {
      const response = await fetch(`${apiUrl}events/${eventId}/sentiment`);
      const data = await response.json();
      if (data.sentimentCounts) {
        const chartData = Object.entries(data.sentimentCounts).map(([sentiment, count]) => ({
          sentiment,
          count,
        }));
        setSentimentData(chartData);
      }
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
    }
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    if (eventId) {
      fetchComments(eventId);
      fetchSentimentData(eventId);
    }
  };

  const processComments = (comments) => {
    const commentMap = {};
    comments.forEach((comment) => {
      const text = comment.text.trim().toLowerCase();
      commentMap[text] = (commentMap[text] || 0) + 1;
    });
    return Object.entries(commentMap).map(([text, value]) => ({ text, value }));
  };

  const words = processComments(comments);

  return (
    <div className="text-center my-6">
      <h1 className="text-red-500 font-bold text-2xl mb-4">Comment Cloud & Sentiment Analysis</h1>
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

      <div className="flex flex-wrap justify-between items-center w-4/5 mx-auto">
        {/* Word Cloud */}
        <div className="w-1/2 min-w-[300px] h-[300px]">
          {comments.length > 0 ? (
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
          ) : (
            <p className="text-gray-500">No comments to display.</p>
          )}
        </div>

        {/* Sentiment Bar Graph */}
        <div className="w-1/2 min-w-[300px] h-[300px]">
          <h2 className="text-xl font-bold text-gray-700 mb-2">Sentiment Analysis</h2>
          {sentimentData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentData}>
                <XAxis dataKey="sentiment" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#ff6b6b" barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No sentiment data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wordtag;
