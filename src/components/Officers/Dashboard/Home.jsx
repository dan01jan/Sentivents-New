import React, { useState, useEffect } from "react";
import logo from "../../../assets/website/logoApp.png";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css"; //

const apiUrl = import.meta.env.VITE_API_URL;

function Home() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userOrganizationName, setUserOrganizationName] = useState("");
  const [userName, setUserName] = useState("");


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userData = JSON.parse(localStorage.getItem("userData"));

        if (!userData || !userData.organizationName) {
          throw new Error("Organization name not found in user data.");
        }

        const organizationName = userData.organizationName;
        setUserOrganizationName(organizationName);

        const response = await fetch(
          `${apiUrl}events/adminevents?organization=${organizationName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.organizationName && userData.name) {
      setUserOrganizationName(userData.organizationName);
      setUserName(userData.name); 
    }
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const renderEvents = () => {
    const filteredEvents = events.filter((event) => {
      const eventStart = new Date(event.dateStart);
      const eventEnd = new Date(event.dateEnd);
      const normalizedSelectedDate = new Date(selectedDate.setHours(0, 0, 0, 0));
  
      // Normalize event dates (set to midnight for comparison)
      const normalizedEventStart = new Date(eventStart.setHours(0, 0, 0, 0));
      const normalizedEventEnd = new Date(eventEnd.setHours(0, 0, 0, 0));
  
      return normalizedSelectedDate >= normalizedEventStart && normalizedSelectedDate <= normalizedEventEnd;
    });
  
    return filteredEvents.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((event) => (
          <div key={event._id} className="p-4 bg-white shadow-md rounded-lg">
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
              <strong>Start:</strong> {new Date(event.dateStart).toLocaleDateString()}
              <br />
              <strong>End:</strong> {new Date(event.dateEnd).toLocaleDateString()}
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
      // Normalize the selected date to only have year, month, and date (no time)
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      const dayEvents = events.filter((event) => {
        const eventStart = new Date(event.dateStart);
        const eventEnd = new Date(event.dateEnd);

        // Normalize the event dates to remove time part
        const normalizedEventStart = new Date(
          eventStart.getFullYear(),
          eventStart.getMonth(),
          eventStart.getDate()
        );
        const normalizedEventEnd = new Date(
          eventEnd.getFullYear(),
          eventEnd.getMonth(),
          eventEnd.getDate()
        );

        return (
          normalizedDate >= normalizedEventStart &&
          normalizedDate <= normalizedEventEnd
        );
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
    <>
      <div className="h-[10vh] w-full bg-[#3a1078] rounded-full flex items-center justify-between shadow-lg px-10">
        <p className="text-white text-[50px] font-bold tracking-wide uppercase">
          {userOrganizationName ? `${userOrganizationName} Dashboard` : "Organization Dashboard"}
        </p>

        <div className="flex items-center gap-4">
          <p className="text-white text-[25px] font-bold tracking-wide">
            Welcome, {userName ? `${userName}` : "Officer"}
          </p>
          <img
            src={logo}
            alt="logo"
            className="h-[5vh] w-auto object-contain rounded-full"
          />
        </div>
      </div>
      <section className="h-[30vh] w-full bg-[#3a1078] rounded-[5vh] flex justify-center items-center shadow-lg px-10 mt-11 gap-8">
        <div className="w-1/4 h-[20vh] bg-[#f7f7f8] rounded-3xl flex items-center justify-center shadow-md">
          <p className="text-[#3a1078] font-bold text-xl">Box 1</p>
        </div>
        <div className="w-1/4 h-[20vh] bg-[#f7f7f8] rounded-3xl flex items-center justify-center shadow-md">
          <p className="text-[#3a1078] font-bold text-xl">Box 2</p>
        </div>
        <div className="w-1/4 h-[20vh] bg-[#f7f7f8] rounded-3xl flex items-center justify-center shadow-md">
          <p className="text-[#3a1078] font-bold text-xl">Box 3</p>
        </div>
        <div className="w-1/4 h-[20vh] bg-[#f7f7f8] rounded-3xl flex items-center justify-center shadow-md">
          <p className="text-[#3a1078] font-bold text-xl">Box 4</p>
        </div>
      </section>
      <section className="h-full w-full px-10 py-10">
        <div className="h-screen">
          <div className="grid grid-cols-[41%_59%] gap-4 py-4 text-[#3a1078] text-[30px] font-bold tracking-wide uppercase">
            <h1>CALENDAR OF EVENTS</h1>
            <h1>Events on {selectedDate.toDateString()}:</h1>
          </div>

          <div className="grid grid-cols-[40%_2px_60%] w-full gap-4 items-start">
            <div>
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                className="border-2 border-[#3a1078] rounded-lg p-4 w-full custom-calendar-width"
                tileContent={tileContent}
              />
            </div>

            <div className="border-l-2 border-dashed border-[#3a1078] h-full"></div>
            <div>{renderEvents()}</div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
