import React, { useState, useEffect } from "react";
import WordCloud from "react-wordcloud";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const Wordtag = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [comments, setComments] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [eventType, setEventType] = useState("");

  // Fetch logged-in user's detailed information
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (!userData || !userData.userId) {
          throw new Error("User data not found");
        }
        const response = await axios.get(
          `${apiUrl}users/officer/${userData.userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUser();
  }, []);

  // Fetch events related to the user's organization (and optionally filtered by eventType)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (!userData || !userData.organizationName) {
          throw new Error("Organization name not found in user data.");
        }
        const organizationName = userData.organizationName;
        // Append eventType as query param if provided
        const typeQuery = eventType ? `&type=${eventType}` : "";
        const response = await axios.get(
          `${apiUrl}events/adminevents?organization=${organizationName}${typeQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEvents(response.data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      }
    };
    fetchEvents();
  }, [eventType]);

  // Fetch comments for a specific event
  const fetchComments = async (eventId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUrl}events/${eventId}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Fetch sentiment data for a specific event
  const fetchSentimentData = async (eventId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUrl}events/${eventId}/sentiment`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      if (data.sentimentCounts) {
        const chartData = Object.entries(data.sentimentCounts).map(
          ([sentiment, count]) => ({ sentiment, count })
        );
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
      <h1 className="text-red-500 font-bold text-2xl mb-4">
        Comment Cloud & Sentiment Analysis
      </h1>
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
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            Sentiment Analysis
          </h2>
          {sentimentData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentData}>
                <XAxis dataKey="sentiment" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" barSize={50} />
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
