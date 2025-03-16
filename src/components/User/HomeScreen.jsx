import React, { useState, useEffect } from "react";
import bg2 from "../../assets/website/bg2.png";
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
import "../Layouts/Loader.jsx";
import TUPLogo from "../../assets/website/TUP LOGO.png";

const apiUrl = import.meta.env.VITE_API_URL;

function HomeScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const sortedEvents = data
          .filter((event) => new Date(event.dateStart) > new Date()) // Only future events
          .sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart)); // Sort ascending

        // Update state only once
        setEvents(sortedEvents.slice(0, 3));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    // Remove or adjust the interval if real-time updates are not needed
    // const intervalId = setInterval(fetchEvents, 5000); // example: every 5 seconds
    // return () => clearInterval(intervalId);
  }, []);

  const settings = {
    dots: false,
    infinite: false, // Disable infinite mode to prevent slide cloning
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

  const CustomArrow = ({ className, style, onClick, direction }) => (
    <div onClick={onClick}>{/* You can customize your arrow here */}</div>
  );

  const footerSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 15,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    prevArrow: <CustomArrow direction="prev" />,
    nextArrow: <CustomArrow direction="next" />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="w-full flex flex-col">
      <div className="relative w-full min-h-[70vh] ">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src={bg2}
          autoPlay
          loop
          muted
          alt="Background"
        />
        <div className="absolute inset-0 sm:bg-gradient-to-r sm:from-black/95 sm:to-black/25"></div>
        <div className="absolute inset-0 flex flex-col items-start justify-center h-full z-10 text-left pl-10">
          <h1 className="text-[12vh] font-bold text-white tracking-wide font-tungsten leading-none px-5 fade-in-left">
            Voice Out
            <strong className="block font-extrabold text-red-500">
              Your Sentiments
            </strong>
          </h1>

          <div className="flex flex-col items-start gap-5 mt-5 pl-5 pt-4 fade-in-left">
            <p className="text-2xl text-white font-roboto">
              An Event Management System with Sentiment Analysis
            </p>
            <div className="p-1 border-2 border-white">
              <button className="px-9 py-4 bg-red-500 text-white text-lg font-semibold hover:bg-[#2a0858] transition">
                Download our App
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="w-full h-[80vh] bg-[#f7f7f8] py-16 px-10">
        <div className="flex flex-col md:flex-row justify-between items-center py-10 px-10">
          <h2 className="text-[6vh] font-tungsten text-[#3a1078] leading-tight uppercase">
            UPCOMING EVENTS
          </h2>
          <Link
            to="/events"
            className="mt-4 md:mt-0 px-6 py-2 text-[#3a1078] text-sm transition hover:text-[#3795bd] uppercase"
          >
            Go to Event Page
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-lg">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">NO EVENTS AVAILABLE</p>
        ) : events.length === 0 ? (
          <h2 className="text-center text-xl text-gray-500">
            No Upcoming Events
          </h2>
        ) : (
          <Slider {...settings}>
            {events.map((event) => (
              <div
                key={event.id}
                className="overflow-hidden transition-transform transform hover:scale-105 flex flex-col px-10"
              >
                <div className="w-full h-[300px] flex items-center justify-center overflow-hidden">
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
                    <strong>{event.name || "No Name"}</strong>
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
        <div className="flex justify-center items-center">
          <img
            src={logo}
            alt="About Us"
            className="w-full max-w-[500px] h-auto md:h-[60vh] object-contain"
          />
        </div>
        <div className="text-center md:text-left max-w-[700px] mx-auto md:mx-0">
          <div className="flex justify-between items-center">
            <h2 className="text-[6vh] font-tungsten text-[#3a1078] leading-tight uppercase">
              About Us
            </h2>
            <Link
              to="/about"
              className="py-2 text-[#3a1078] text-sm transition hover:text-[#3795bd] uppercase"
            >
              Go to About Page
            </Link>
          </div>
          <p className="text-black text-lg mt-2">
            To be the leading platform that amplifies voices, fosters meaningful
            conversations, and drives positive change through innovative and
            inclusive event management.
          </p>
          <h3 className="text-[6vh] font-tungsten text-[#3a1078] leading-tight uppercase mt-8">
            Our Team
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[teamMember1, teamMember2, teamMember3, teamMember4].map(
              (member, index) => {
                const names = [
                  "Twinkle Ascano",
                  "Danize Armyn Fadullo",
                  "Ej Cezar Falogme",
                  "John Paul Francisco",
                ];
                return (
                  <div key={index} className="flex flex-col items-center">
                    <img
                      src={member}
                      alt="team member"
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#3795bd] hover:scale-105 transition-transform duration-300"
                    />
                    <p className="text-black mt-4 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                      {names[index]}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>
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
    </div>
  );
}

export default HomeScreen;
