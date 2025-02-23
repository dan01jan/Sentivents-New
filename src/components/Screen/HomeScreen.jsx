import React, { useState, useEffect } from "react";
import backgroundVideo from "../../assets/website/events.mp4";
import logo from "../../assets/website/V_DarkerLogo.png";
import teamMember1 from "../../assets/website/google-logo.png";
import teamMember2 from "../../assets/website/google-logo.png";
import teamMember3 from "../../assets/website/google-logo.png";
import teamMember4 from "../../assets/website/google-logo.png";
import "../../index.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import "../Loader.jsx";
const apiUrl = import.meta.env.VITE_API_URL;

function HomeScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const sortedEvents = data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setEvents(sortedEvents.slice(0, 3));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
        },
      },
    ],
  };

  return (
    <div className="w-full flex flex-col">
      <div className="relative w-full min-h-[70vh]">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={backgroundVideo}
          autoPlay
          loop
          muted
        />
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center h-full z-10 text-center">
          <h1 className="mb-8 text-6xl font-bold text-white tracking-wide">
            VOYS
          </h1>
          <p className="mb-10 text-2xl text-white">
            An Event Management System with Sentiment Analysis
          </p>
          <div className="p-1 border-2 border-white">
            <button className="px-9 py-4 bg-[#3795bd] text-white text-lg font-semibold hover:bg-[#2a0858] transition">
              Download our App
            </button>
          </div>
        </div>
      </div>

      {/* Latest Events Section */}
      <section className="w-full h-[80vh] bg-[#f7f7f8] py-16 px-10">
        <div className="flex flex-col md:flex-row justify-between items-center py-10 px-10">
          <h2 className="text-4xl tracking-wide font-anton">LATEST EVENTS</h2>
          <Link
            to="/events"
            className="mt-4 md:mt-0 px-6 py-2 text-black text-sm transition hover:text-[#3795bd] uppercase"
          >
            Go to Event Page
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-lg">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <Slider {...settings}>
            {events.map((event) => (
              <div
                key={event.id}
                className="overflow-hidden transition-transform transform hover:scale-105 flex flex-col px-10"
              >
                <div className="w-full h-[250px] flex items-center justify-center overflow-hidden">
                  {event.images && event.images.length > 0 ? (
                    <img
                      src={event.images[0]}
                      alt={event.title || "Event Image"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image Available</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-4">{event.title}</h3>
                  <div className="flex items-center">
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
                  </div>
                  <p className="text-gray-700 text-xl leading-relaxed py-2">
                    <strong>{event.name || "No Name"}</strong>{" "}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed ">
                    {event.description.length > 100
                      ? `${event.description.substring(0, 100)}...`
                      : event.description}
                  </p>
                </div>
              </div>
            ))}
          </Slider>
        )}
      </section>
      <section className="w-full min-h-[80vh] bg-[#ffffff] py-16 px-10 grid grid-cols-1 md:grid-cols-2 items-center">
        <div className="flex justify-center md:justify-end mr-8">
          <img
            src={logo}
            alt="About Us"
            className="w-full max-w-[500px] h-[60vh]"
          />
        </div>
        <div className="text-center md:text-left max-w-[600px] mx-auto md:mx-0">
          <div className="flex justify-between items-center">
            <h2 className="text-5xl font-anton text-black leading-tight uppercase">
              About Us
            </h2>
            <Link
              to="/about"
              className="px-6 py-2 text-black text-sm transition hover:text-[#3795bd] uppercase"
            >
              Go to About Page
            </Link>
          </div>
          <p className="text-black text-lg mt-2">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Provident,
            ullam nihil repudiandae consequuntur ducimus necessitatibus eveniet
            velit eaque voluptatem pariatur aliquam, praesentium nostrum magnam
            accusantium explicabo quae sint vero sed.
          </p>
          <h3 className="text-4xl font-anton text-black mb-8 uppercase mt-5">
            Our Team
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[teamMember1, teamMember2, teamMember3, teamMember4].map(
              (member, index) => (
                <div key={index} className="flex flex-col items-center">
                  <img
                    src={member}
                    alt={`Team Member ${index + 1}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#3795bd] hover:scale-105 transition-transform duration-300"
                  />
                  <p className="text-black mt-4 font-semibold">
                    Team Member {index + 1}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <footer className="w-full bg-gray-800 py-20 text-center text-white">
        <h2 className="text-2xl font-semibold">3rd screen</h2>
      </footer>
    </div>
  );
}

export default HomeScreen;
