import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css"; // Import the custom CSS file
const apiUrl = import.meta.env.VITE_API_URL;

const CalendarComponent = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${apiUrl}events/adminevents`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
        setFilteredEvents(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const renderEvents = () => {
    const filteredEvents = events.filter((event) => {
      const eventStart = new Date(event.dateStart);
      const eventEnd = new Date(event.dateEnd);
      return selectedDate >= eventStart && selectedDate <= eventEnd;
    });

    return filteredEvents.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        {filteredEvents.map((event) => (
          <div key={event._id} className="p-4 bg-white shadow-md rounded-lg ">
            <div className="flex flex-wrap gap-2">
              {event.images && event.images.length > 0 ? (
                <img
                  className="w-full h-24 object-cover"
                  src={event.images[0]}
                  alt={event.name || "Event Image"}
                />
              ) : (
                <div className="w-full h-24 bg-gray-200"></div> // Placeholder if no image
              )}
            </div>
            <h3 className="text-lg font-semibold mt-2">{event.name}</h3>
            <p className="text-gray-600">{event.description}</p>
            <p className="text-sm text-gray-500">
              <strong>Start:</strong>{" "}
              {new Date(event.dateStart).toLocaleDateString()}
              <br />
              <strong>End:</strong>{" "}
              {new Date(event.dateEnd).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500">No events on this day.</p>
    );
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dayEvents = events.filter((event) => {
        const eventStart = new Date(event.dateStart);
        const eventEnd = new Date(event.dateEnd);
        return date >= eventStart && date <= eventEnd;
      });

      return dayEvents.length > 0 ? (
        <div>
          <ul className="list-disc list-inside text-left">
            {dayEvents.map((event) => (
              <li key={event._id} className="text-s text-[#3a1078] font-bold ">
                {event.name}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 mt-1">
            {dayEvents.slice(0, 3).map((event) => (
              <img
                key={event._id}
                className="w-5 h-5 object-cover rounded-full"
                src={event.images[0]}
                alt={event.name || "Event Image"}
              />
            ))}
          </div>
        </div>
      ) : null;
    }
  };

  return (
    <div className="h-screen">
      <div className="py-4">
        <p>TITLE</p>
      </div>
      {/* <h1 className="text-2xl font-bold text-center text-red-500 mb-6">
        Event Calendar
      </h1>
      <div className="flex flex-1 h-full max-h-1/2 ">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          className="flex-1 border-2 border-gray-300 rounded-lg p-4 "
          tileContent={tileContent}
        />
        <div className="flex-1 p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Events on {selectedDate.toDateString()}:
          </h2>
          {renderEvents()}
        </div>
      </div> */}
      <div className="grid grid-cols-2 w-full gap-4">
        <div className="">
        <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            className="border-2 border-gray-300 rounded-lg p-4 custom-calendar-width"
            tileContent={tileContent}
          />
        </div>
        <div className="">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Events on {selectedDate.toDateString()}:
          </h2>
          {renderEvents()}
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
