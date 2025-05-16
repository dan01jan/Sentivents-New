import React, { useState, useEffect } from "react";
import WordCloud from "react-wordcloud";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const sentimentColors = {
  Positive: "#6BC5FF",
  Neutral: "#FFE66B",
  Negative: "#FF6B6B",
};

const Wordtag = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [comments, setComments] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [avgScores, setAvgScores] = useState({ Positive: 0, Neutral: 0, Negative: 0 });
  const [monthlySentiment, setMonthlySentiment] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (!userData?.userId) throw new Error("User data not found");

        const response = await axios.get(`${apiUrl}users/officer/${userData.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userData = JSON.parse(localStorage.getItem("userData"));
        const org = localStorage.getItem("officerOrgName") || userData?.organizationName;
        const response = await axios.get(`${apiUrl}events/adminevents?organization=${org}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(response.data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);

  const fetchComments = async (eventId) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${apiUrl}events/${eventId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const fetchSentimentData = async (eventId) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${apiUrl}events/${eventId}/sentiment`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;

      if (data.sentimentCounts) {
        const counts = Object.entries(data.sentimentCounts).map(([sentiment, count]) => ({
          sentiment,
          count,
        }));
        setSentimentData(counts);
      }

      if (data.averageScores) {
        // Normalize if values are percentage-based
        const normalized = {
          Positive: data.averageScores.Positive / 100,
          Neutral: data.averageScores.Neutral / 100,
          Negative: data.averageScores.Negative / 100,
        };
        setAvgScores(normalized);
      }

      if (data.monthlyAverages) {
        setMonthlySentiment(data.monthlyAverages);
      }
    } catch (err) {
      console.error("Error fetching sentiment data:", err);
    }
  };

  const handleEventChange = (e) => {
    const id = e.target.value;
    setSelectedEvent(id);
    if (id) {
      fetchComments(id);
      fetchSentimentData(id);
    }
  };

  const processComments = (comments) => {
    const wordFrequency = {};
    const stopwords = new Set([
      "ang", "at", "nung", "ng", "na", "si", "sa", "ni", "kay", "ay", "ko", "mo", "ikaw", "ako", "pero", "talaga", "so", "the",
    ]);

    comments.forEach((comment) => {
      const words = comment.text.toLowerCase().split(/\s+/);
      words.forEach((word) => {
        const clean = word.replace(/[.,!?]/g, "");
        if (clean && !stopwords.has(clean)) {
          wordFrequency[clean] = (wordFrequency[clean] || 0) + 1;
        }
      });
    });

    return Object.entries(wordFrequency).map(([text, value]) => ({ text, value }));
  };

  const words = processComments(comments);

const gaugePie = (label, rawCount, color) => {
  const total = sentimentData.reduce((sum, s) => sum + s.count, 0);
  const ratio = total > 0 ? rawCount / total : 0;

  return (
    <div className="flex flex-col items-center w-[100px]">
      <PieChart width={100} height={100}>
        <Pie
          data={[{ name: label, value: ratio }, { name: "rest", value: 1 - ratio }]}
          innerRadius={30}
          outerRadius={40}
          dataKey="value"
          startAngle={180}
          endAngle={0}
        >
          <Cell fill={color} />
          <Cell fill="#f0f0f0" />
        </Pie>
      </PieChart>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-lg font-bold">{rawCount}</p> {/* Shows actual count */}
    </div>
  );
};


  return (
    <div className="p-4">
      <h1 className="text-[4vh] font-semibold text-[#3a1078]">Comment Cloud & Sentiment Analysis</h1>

      <div className="mb-4">
        <select
          value={selectedEvent}
          onChange={handleEventChange}
          className="w-[300px] p-2 border border-gray-300 rounded-lg"
        >
          <option value="">Select an Event</option>
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      {/* Gauge Section */}
      <div className="flex gap-6 justify-center my-6">
        {gaugePie("Positive", sentimentData.find(s => s.sentiment === "positive")?.count || 0, sentimentColors.Positive)}
        {gaugePie("Neutral", sentimentData.find(s => s.sentiment === "neutral")?.count || 0, sentimentColors.Neutral)}
        {gaugePie("Negative", sentimentData.find(s => s.sentiment === "negative")?.count || 0, sentimentColors.Negative)}

      </div>

      {/* Monthly Sentiment Trends */}
      {/* {monthlySentiment.length > 0 && (
        <div className="w-full h-[300px] mb-6">
          <h2 className="text-xl font-bold text-[#3a1078] mb-2">Sentiment Avg by Month</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySentiment}>
              <XAxis dataKey="month" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Positive" stroke={sentimentColors.Positive} />
              <Line type="monotone" dataKey="Neutral" stroke={sentimentColors.Neutral} />
              <Line type="monotone" dataKey="Negative" stroke={sentimentColors.Negative} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )} */}

      <div className="flex flex-wrap justify-between gap-6">
        {/* WordCloud */}
        <div className="w-[48%] min-w-[300px] h-[300px] bg-white p-4 shadow rounded-xl">
          <h2 className="text-xl font-bold text-[#3a1078] mb-2">Word Cloud</h2>
          {comments.length > 0 ? (
            <WordCloud
              words={words}
              options={{
                rotations: 2,
                rotationAngles: [-90, 0],
                fontSizes: [20, 60],
                colors: Object.values(sentimentColors),
              }}
            />
          ) : (
            <p className="text-gray-500">No comments to display.</p>
          )}
        </div>

        {/* Bar Chart */}
        <div className="w-[48%] min-w-[300px] h-[300px] bg-white p-4 shadow rounded-xl">
          <h2 className="text-xl font-bold text-[#3a1078] mb-2">Sentiment Counts</h2>
          {sentimentData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentData}>
                <XAxis dataKey="sentiment" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count">
                  {sentimentData.map((entry, index) => (
                    <Cell key={index} fill={sentimentColors[entry.sentiment] || "#8884d8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No sentiment data available.</p>
          )}
        </div>

        {/* Line Chart (Replaced Pie) */}
       {/* Area Chart (Replaced LineChart) */}
<div className="w-full min-w-[300px] h-[300px] bg-white p-4 shadow rounded-xl">
  <h2 className="text-xl font-bold text-[#3a1078] mb-2">Sentiment Trend</h2>
  {sentimentData.length > 0 ? (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={sentimentData}>
        <XAxis dataKey="sentiment" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#cbd5e1" />
      </AreaChart>
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
