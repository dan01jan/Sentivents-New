import React, { useState, useEffect } from "react";
import TUPLogo from "../../assets/website/TUP LOGO.png";
import logo from "../../assets/website/V_Logo.png";
import eventBG from "../../assets/website/eventBG.png";
import backgroundVideo from "../../assets/website/bg_events.mp4";
import { Link } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

// Define your mapping of organization names to categories
const organizationCategories = {
  // Academic organizations
  "Association of Civil Engineering Students of TUP Taguig Campus": "Academic",
  "Automotive Society of Engineering": "Academic",
  "Bachelor of Science in Electrical Engineering Guild": "Academic",
  // ... add more academic organizations

  // Non-Academic organizations
  "DOST Scholars Association for Innovation and Technology": "Non Academic",
  "Peer Facilitators Group": "Non Academic",
  "LANI Scholars of Technology and Engineering Pioneers": "Non Academic",

  // Multi-Faith organizations
  "Catholic Youth Movement": "Multi-Faith",
  "Christian Brotherhood International": "Multi-Faith",
  "Manila Technician Institute Christian Fellowship": "Multi-Faith",
  "TUPT Positive Lifestyle Under the Son Network": "Multi-Faith",
  "The Jesus Impact - TUP": "Multi-Faith",
};

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleEvents, setVisibleEvents] = useState(6); // Number of events to display initially
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState([]);

  // Convert fancy/unicode text to plain ASCII letters
  const normalizeText = (text) => {
    if (!text) return "";
    return text
      .normalize("NFKD") // Normalize Unicode variants
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-zA-Z0-9 ]/g, "") // Remove non-ASCII (fancy fonts etc.)
      .toLowerCase();
  };

  // The order in which you want to display categories
  const categoriesInOrder = [
    "Unknown",
    "Academic",
    "Non Academic",
    "Multi-Faith",
  ];

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);

    const fetchEvents = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${apiUrl}events/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("There are no events available at the moment.");
        }
        const data = await response.json();

        // Sort by dateStart descending
        const sortedEvents = data.sort(
          (a, b) => new Date(b.dateStart) - new Date(a.dateStart)
        );

        setEvents(sortedEvents);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    // Optionally adjust or remove the polling interval
    const intervalId = setInterval(fetchEvents, 500);
    return () => clearInterval(intervalId);
  }, []);

  const handleShowMore = () => {
    setVisibleEvents((prevVisibleEvents) => prevVisibleEvents + 6);
  };

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    setShowModal(true);
    const token = localStorage.getItem("authToken");
  
    try {
      const res = await fetch(`${apiUrl}events/${event._id}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    }
  };
  

  // Determine the category for an event based on its organization name
  const getEventCategory = (orgName) => {
    if (!orgName) return "Unknown";
    // Use the mapping; if not found, default to Unknown
    return organizationCategories[orgName.trim()] || "Unknown";
  };

  // Helper to display label; rename "Unknown" to "Overall Organization"
  const getCategoryLabel = (category) => {
    return (
      <span
        className={`text-[7vh] sm:text-[5vh] md:text[1vh]] lg:text-[5vh]  text-[#3a1078] leading-tight uppercase ${category === "Unknown"
          }`}
      >
        {category === "Unknown" ? "Overall Organization" : category}
      </span>

    );
  };

  // Get initials from event name (e.g., "Boodle Fight" -> "BF")
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word[0]?.toUpperCase())
      .join("");
  };
  

  // Check if event matches search (either start of name or initials)
  const matchesSearch = (event, term) => {
    if (!term) return true;
  
    const normalizedTerm = normalizeText(term);
    const name = event.name || "";
    const normalizedName = normalizeText(name);
    const initials = getInitials(normalizedName);
  
    return (
      normalizedName.startsWith(normalizedTerm) ||
      initials.startsWith(normalizedTerm)
    );
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.dateStart);
    const end = new Date(event.dateEnd);
  
    if (start <= now && now <= end) {
      return "Ongoing";
    } else if (now < start) {
      return "Upcoming";
    } else {
      return "Done";
    }
  };

  return (
    <>
      <div
        className="w-full h-auto flex justify-center items-center bg-cover bg-center py-16"
        style={{ backgroundImage: `url(${eventBG})` }}
      >
        <div className="max-w-screen-xl w-full px-4 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4">
            <h2 className="text-[8vh] sm:text-[4vh] md:text-[6vh] lg:text-[6vh] xl:text-[8vh]  font-semibold max-[1600px]:text-[8vh] max-[1800px]:text-[9vh] max-[2000px]:text-[10vh] font-tungsten text-[#3a1078] leading-none uppercase text-center">
              EVENTS
            </h2>
          </div>

          <div className="relative w-full flex justify-center md:justify-end">
            <video
              className="w-[300px] sm:w-[480px] md:w-[450px] lg:w-[550px] h-auto object-cover rounded-lg shadow-lg"
              src={backgroundVideo}
              autoPlay
              loop
              muted
            />
          </div>
        </div>
      </div>

      <section className="w-auto h-auto flex flex-col justify-center items-center bg-[#f7f7f8] py-16">
        {!isLoggedIn ? (
          <Link to="/login">
            <button className="px-6 py-2 bg-[#3a1078] text-white text-lg font-semibold rounded hover:bg-[#2a0858] transition">
              Login to View Events
            </button>
          </Link>
        ) : loading ? (
          <p className="text-center text-lg">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="max-w-screen-xl w-full px-4 md:px-10">
            <div className="mb-6 flex justify-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Events"
              className="px-4 py-2 w-full max-w-md border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3a1078]"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {["All", "Ongoing", "Upcoming", "Done"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded ${
                  statusFilter === status
                    ? "bg-[#3a1078] text-white"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-[#2a0858] hover:text-white transition`}
              >
                {status}
              </button>
            ))}
          </div>


            {categoriesInOrder.map((cat) => {
              const catEvents = events.filter((ev) => {
                const eventCategory = getEventCategory(ev.organization);
                const eventStatus = getEventStatus(ev);
              
                const statusMatches =
                  statusFilter === "All" || eventStatus === statusFilter;
              
                return eventCategory === cat && statusMatches && matchesSearch(ev, searchTerm);
              });
              
              

              if (catEvents.length === 0) return null;

              return (
                <div key={cat} className="mb-12">
                  <h2 className="text-3xl font-bold text-[#3a1078] mb-6 text-center uppercase">
                    {getCategoryLabel(cat)}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {catEvents.slice(0, visibleEvents).map((event) => (
                      <div
                      key={event._id}
                      className="relative w-full h-auto flex flex-col overflow-hidden group cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >                    
                        <div className="w-full bg-gray-200 flex items-center justify-center">
                          {event.images && event.images.length > 0 ? (
                            <img
                              src={event.images[0]}
                              alt={event.title || "Event Image"}
                              className="w-full h-[40vh] object-cover transition-transform transform group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-gray-500">
                              No Image Available
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 w-full py-4 bg-[#f7f7f8]">
                          <strong className="uppercase text-red-400 text-sm">
                            {event.type?.eventType || "Unknown"}
                          </strong>
                          <span className="mx-2 opacity-50">|</span>
                          <span className="text-gray-500 text-sm">
                            {event.dateStart
                              ? new Date(event.dateStart).toLocaleDateString()
                              : "No Date"}
                          </span>
                          <h3 className="text-lg font-bold text-[#3a1078]">
                            {event.name || "Untitled Event"}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {visibleEvents < events.length && (
              <div className="text-center">
                <button
                  onClick={handleShowMore}
                  className="mt-4 px-6 py-2 bg-[#3a1078] text-white text-lg font-semibold rounded hover:bg-[#2a0858] transition"
                >
                  Show More
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {showModal && selectedEvent && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-lg w-full relative">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-black"
          >
            ✖
          </button>
          <h2 className="text-xl font-bold mb-2">{selectedEvent.name}</h2>
          <p className="text-gray-600 mb-2">
            {selectedEvent.description || "No description available."}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(selectedEvent.dateStart).toLocaleString()} -{" "}
            {new Date(selectedEvent.dateEnd).toLocaleString()}
          </p>

          <h3 className="mt-4 font-semibold">Comments</h3>
          {comments.length > 0 ? (
            <ul className="mt-2 max-h-40 overflow-y-auto text-sm text-gray-700">
              {comments.slice(0, 3).map((comment) => (
                <li key={comment._id} className="border-b py-1">
                  {comment.user.name} : {comment.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 mt-2">No comments yet.</p>
          )}

          {/* Add this line below the comments */}
          <p className="text-m text-center text-red-400 mt-4 italic">
            Download the app to comment.
          </p>
        </div>
      </div>
    )}

      <footer className="w-full bg-[#ffffff] py-10 px-10 text-center text-gray-800 flex flex-col items-center gap-4">
        <div className="flex justify-center items-center gap-4">
          <img src={logo} alt="VOYS Logo" className="h-12 w-auto" />
          <img src={TUPLogo} alt="TUP Logo" className="h-12 w-auto" />
        </div>
        <p className="text-sm">
          &copy; 2024-2025. Empowering Events, Amplifying Voices — VOYS Event
          Management System
        </p>
      </footer>
    </>
  );
}

export default Events;
