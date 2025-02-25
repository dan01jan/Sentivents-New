import React, { useState, useEffect } from "react";
import TUPLogo from "../../assets/website/TUP logo.png";
import logo from "../../assets/website/V_logo.png";
import eventBG from "../../assets/website/eventBG.png";
import "../../../src/index.css";
import backgroundVideo from "../../assets/website/bg.mp4";
import { Link } from "react-router-dom";
const apiUrl = import.meta.env.VITE_API_URL;

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleEvents, setVisibleEvents] = useState(6); // Number of events to display initially

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${apiUrl}events/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("There are no events available at the moment.");
        }
        const data = await response.json();
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
    const intervalId = setInterval(fetchEvents, 500);

    return () => clearInterval(intervalId);
  }, []);

  const handleShowMore = () => {
    setVisibleEvents((prevVisibleEvents) => prevVisibleEvents + 6);
  };

  return (
    <>
      <div
        className="w-full h-[70vh] flex justify-center items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${eventBG})` }}
      >
        <div className="max-w-[150vh] w-full px-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4">
            <h2 className="text-[10vw] md:text-[150px] lg:text-[200px] font-tungsten text-[#3a1078] leading-tight uppercase">
              EVENTS
            </h2>
            <p className="text-black text-base md:text-lg">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit.
              Provident, ullam nihil repudiandae consequuntur ducimus
              necessitatibus eveniet velit eaque voluptatem pariatur aliquam,
              praesentium nostrum magnam accusantium explicabo quae sint vero
              sed.
            </p>
          </div>
          <div className="relative w-full h-auto flex justify-center md:justify-end">
            <video
              className="w-auto h-auto object-cover"
              src={backgroundVideo}
              autoPlay
              loop
              muted
            />
          </div>
        </div>
      </div>
      <section className="w-auto h-auto flex flex-col justify-center items-center bg-[#f7f7f8] py-16">
        {loading ? (
          <p className="text-center text-lg">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="max-w-[200vh] w-full px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.slice(0, visibleEvents).map((event) => (
                <div
                  key={event.id}
                  className="relative w-full h-[500px] flex flex-col overflow-hidden group"
                >
                  <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center">
                    {event.images && event.images.length > 0 ? (
                      <img
                        src={event.images[0]}
                        alt={event.title || "Event Image"}
                        className="w-full h-full object-cover transition-transform transform group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-gray-500">No Image Available</span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 w-full py-4 bg-[#f7f7f8]">
                    {event.type && event.type.eventType ? (
                      <strong className="uppercase text-red-400 text-sm">
                        {event.type.eventType}
                      </strong>
                    ) : (
                      <strong className="uppercase text-red-600">
                        Unknown
                      </strong>
                    )}
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
            {visibleEvents < events.length && (
              <button
                onClick={handleShowMore}
                className="mt-8 px-6 py-2 bg-[#3a1078] text-white text-lg font-semibold rounded hover:bg-[#2a0858] transition"
              >
                Show More
              </button>
            )}
          </div>
        )}
      </section>
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
