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
  const [userData, setUserData] = useState(null);

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
      setUserData(userData); // Ensure userData is set here
    }
  }, []);

  useEffect(() => {
    const fetchEventCount = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (!userData || !userData.organizationName) {
          throw new Error("Organization name not found in user data.");
        }

        const organizationName = userData.organizationName;
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

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const renderEvents = () => {
    const filteredEvents = events.filter((event) => {
      const eventStart = new Date(event.dateStart);
      const eventEnd = new Date(event.dateEnd);
      const normalizedSelectedDate = new Date(
        selectedDate.setHours(0, 0, 0, 0)
      );

      // Normalize event dates (set to midnight for comparison)
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
      <div className="h-[10vh] w-full bg-[#f7f7f9] rounded-full flex items-center justify-between shadow-lg px-10">
        <p className="text-[#3a1078] text-[50px] font-bold tracking-[.15em] uppercase font-tungsten ">
          {userOrganizationName
            ? `${userOrganizationName} `
            : "Organization Dashboard"}
        </p>

        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="logo"
            className="h-[5vh] w-auto object-contain rounded-full"
          />
        </div>
      </div>
      <h1 className="font-tungsten text-[8vh] text-[#3a1078] px-5 flex items-center gap-4">
        <span className="flex-1 h-1 bg-[#3a1078]"></span>
        Dashboard
        <span className="flex-1 h-1 bg-[#3a1078]"></span>
      </h1>
      <div className="flex flex-row w-full h-full px-10 py-10 gap-10">
        <div className="flex flex-col w-3/4 gap-10">
          {userData && (
            <div className="bg-[#f7f7f9] h-[30vh] p-6 rounded-3xl shadow-lg flex justify-between items-center hover:shadow-xl transition-shadow duration-300 fade-in-left">
              <div className="mx-10">
                <h1 className="text-[8vh] font-bold text-[#3a1078] font-tungsten">
                  Hi, {userData.name} {userData.surname}! 👋
                </h1>
                <p className="text-2xl font-bold text-[#3a1078]">
                  kunware wala kang nababasa ha? thank you so much
                </p>
              </div>
              <div className="w-1/3 h-full flex justify-center items-center">
                <DotLottieReact
                  src="https://lottie.host/e293ffde-604c-4608-8989-03852875a233/4qcsmg5xtt.lottie"
                  loop
                  autoplay
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </div>
          )}

          <div className="bg-[#f7f7f8] rounded-3xl shadow-lg p-6">
            <div className="grid grid-cols-[40%_2px_60%] gap-5 text-[#3a1078] text-[30px] font-bold tracking-wide uppercase mb-5">
              <h1 className="font-tungsten text-[6vh] col-span-1">
                Calendar of Events
              </h1>
              <h2 className="font-tungsten text-[6vh] col-span-2">
                Events on {selectedDate.toDateString()}:
              </h2>
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
        </div>

        <div className="w-1/4 flex flex-col gap-5">
          <div className="w-full h-[20vh] bg-[#f7f7f8] rounded-3xl flex items-center justify-center shadow-md">
            <p className="text-[#3a1078] font-bold text-xl">Box 1</p>
          </div>
          <div className="w-full h-[20vh] bg-[#f7f7f8] rounded-3xl flex items-center justify-center shadow-md">
            <p className="text-[#3a1078] font-bold text-xl">
              Total Events: {eventCount}
            </p>
          </div>
          <div className="w-full h-[20vh] bg-[#f7f7f8] rounded-3xl flex items-center justify-center shadow-md">
            <p className="text-[#3a1078] font-bold text-xl">Box 3</p>
          </div>
          <div className="w-full h-[20vh] bg-[#f7f7f8] rounded-3xl flex items-center justify-center shadow-md">
            <p className="text-[#3a1078] font-bold text-xl">Box 4</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
