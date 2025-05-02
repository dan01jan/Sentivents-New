import React, { useState, useEffect } from "react";
import logo from "../../../assets/website/logoApp.png";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const apiUrl = import.meta.env.VITE_API_URL;

function Home() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userOrganizationName, setUserOrganizationName] = useState("");
  const [userName, setUserName] = useState("");
  const [eventCount, setEventCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [officerCount, setOfficerCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper: Get the organization name (prefer officerOrgName if exists)
  const getOrganizationName = () => {
    const officerOrgName = localStorage.getItem("officerOrgName");
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    return officerOrgName || (storedUserData ? storedUserData.organizationName : null);
  };

  // 1. Fetch events for the organization
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const organizationName = getOrganizationName();

        if (!organizationName) {
          throw new Error("Organization name not found in user data.");
        }
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
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 2. Load userData for greeting (not used for counts)
  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    const organizationName = getOrganizationName();
    if (storedUserData && storedUserData.name) {
      setUserOrganizationName(organizationName);
      setUserName(storedUserData.name);
      setUserData(storedUserData);
    }
  }, []);

  // 3. Fetch total event count for the organization
  useEffect(() => {
    const fetchEventCount = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const organizationName = getOrganizationName();

        if (!organizationName) {
          throw new Error("Organization name not found in user data.");
        }

        const response = await fetch(`${apiUrl}events/event-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch event count");
        }

        const data = await response.json();
        const orgEvent = data.find((org) => org._id === organizationName);
        setEventCount(orgEvent ? orgEvent.totalEvents : 0);
      } catch (error) {
        console.error("Error fetching event count:", error);
      }
    };

    fetchEventCount();
  }, []);

  // 4. Fetch officer count using officerOrgId from localStorage
  useEffect(() => {
    const fetchOfficerCount = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const officerOrgId = localStorage.getItem("officerOrgId");
        if (!officerOrgId) {
          console.error("No officerOrgId found in localStorage.");
          return;
        }

        const response = await fetch(
          `${apiUrl}users/organization/${officerOrgId}/officers/count`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch officer count");
        }

        const data = await response.json();
        setOfficerCount(data.officerCount);
      } catch (error) {
        console.error("Error fetching officer count:", error);
      }
    };

    fetchOfficerCount();
  }, []);

  // 5. Fetch user count (only role "User") using officerOrgId from localStorage
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const officerOrgId = localStorage.getItem("officerOrgId");
        if (!officerOrgId) {
          console.error("No officerOrgId found in localStorage.");
          return;
        }

        // This route now only counts users with role "User"
        const response = await fetch(
          `${apiUrl}users/organization/${officerOrgId}/count`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user count");
        }

        const data = await response.json();
        setUserCount(data.userCount);
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };

    fetchUserCount();
  }, []);

  // Handle calendar date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Filter and render events for selected day
  const renderEvents = () => {
    const filteredEvents = events.filter((event) => {
      const eventStart = new Date(event.dateStart);
      const eventEnd = new Date(event.dateEnd);
      const normalizedSelectedDate = new Date(selectedDate.setHours(0, 0, 0, 0));

      const normalizedEventStart = new Date(eventStart.setHours(0, 0, 0, 0));
      const normalizedEventEnd = new Date(eventEnd.setHours(0, 0, 0, 0));

      return (
        normalizedSelectedDate >= normalizedEventStart &&
        normalizedSelectedDate <= normalizedEventEnd
      );
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
                <div className="w-full h-24 bg-gray-200"></div>
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

  // Display small event indicators on the calendar
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      const dayEvents = events.filter((event) => {
        const eventStart = new Date(event.dateStart);
        const eventEnd = new Date(event.dateEnd);

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
      <div className="h-[10vh] w-full bg-[#f7f7f9] rounded-full flex items-center justify-between shadow-md px-5 md:px-10">
        <p className="text-[#3a1078] text-[1vh] lg:text-[3vh] md:text-[2vh] sm:text-[2vh] xs:text-[1vh] font-bold tracking-[.1em] uppercase font-semibold">
          {userOrganizationName
            ? `${userOrganizationName} `
            : "Organization Dashboard"}
        </p>
        <div className="flex items-center gap-4">
          <img
            src={localStorage.getItem("officerOrgImage") || logo}
            alt="Logo"
            className={`transition-all duration-300 ease-in-out ${
              isExpanded ? "w-24" : "w-20"
            }`}
          />
        </div>
      </div>

      {/* Main Dashboard Heading */}
      <h1 className="font-semibold   text-[5vh] md:text-[6vh] sm:text-[5vh] text-[#3a1078] px-5 flex items-center gap-4">
        <span className="flex-1 h-1 bg-[#3a1078]"></span>
        Dashboard
        <span className="flex-1 h-1 bg-[#3a1078]"></span>
      </h1>

      <div className="flex flex-col lg:flex-row w-full h-full px-5 md:px-10 py-5 md:py-10 gap-5 md:gap-10">
        {/* Left Column: Greeting + Calendar */}
        <div className="flex flex-col w-full lg:w-3/4 gap-5 md:gap-10">
          {userData && (
            <div className="bg-[#f7f7f9] h-[25vh] md:h-[30vh] p-4 md:p-6 rounded-3xl shadow-lg flex flex-col md:flex-row justify-between items-center hover:shadow-xl transition-shadow duration-300 fade-in-left">
              <div className="mx-5 md:mx-10">
                <h1 className="text-[6vh] md:text-[6vh] sm:text-[5vh] font-bold text-[#3a1078] font-semibold">
                  Hi, {userData.name} {userData.surname}! 👋
                </h1>
              </div>
              <div className="w-full md:w-1/3 h-[15vh] md:h-full sm:h-0 flex justify-center items-center">
                <DotLottieReact
                  src="https://lottie.host/e293ffde-604c-4608-8989-03852875a233/4qcsmg5xtt.lottie"
                  loop
                  autoplay
                  style={{ width: "100%", height: "90%" }}
                />
              </div>
            </div>
          )}

          <div className="bg-[#f7f7f8] rounded-3xl shadow-lg p-4 md:p-6 fade-in-left hover:shadow-xl transition-shadow duration-300">
            <div className="grid grid-cols-1 md:grid-cols-[40%_2px_60%] gap-3 md:gap-5 text-[#3a1078] text-[20px] md:text-[30px] font-bold tracking-wide uppercase mb-3 md:mb-5">
              <h1 className="font-semibold text-[4vh] md:text-[3vh] sm:text-[4vh] col-span-1">
                Calendar of Events
              </h1>
              <h2 className="font-semibold text-[4vh] md:text-[3vh] sm:text-[4vh] col-span-2">
                Events on {selectedDate.toDateString()}:
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[40%_2px_60%] w-full gap-4 items-start">
              <div>
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  className="border-2 border-[#3a1078] rounded-lg p-4 w-full custom-calendar-width"
                  tileContent={tileContent}
                />
              </div>
              <div className="hidden md:block border-l-2 border-dashed border-[#3a1078] h-full"></div>
              <div>{renderEvents()}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats */}
        <div className="w-full lg:w-1/4 flex flex-col gap-3 md:gap-5 fade-in-up">
          {[
            { label: "Members", count: 1500 }, // Example static
            { label: "Events", count: eventCount },
            { label: "Officers", count: officerCount },
            // { label: "Registered Members", count: userCount },
          ].map((item) => (
            <div
              key={item.label}
              className="w-full h-[15vh] md:h-[20vh] bg-[#f7f7f8] rounded-3xl flex items-center justify-center shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <p className="text-[#3a1078] font-bold text-lg md:text-xl">
                {item.label}: {item.count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
