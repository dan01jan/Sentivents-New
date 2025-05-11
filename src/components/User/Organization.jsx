import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import bgplain1 from "../../assets/website/bg_plain.png";
import logo from "../../assets/website/V_DarkerLogo.png";
import TUPLogo from "../../assets/website/TUP LOGO.png";
import Loader from "../Layouts/Loader.jsx";

const apiUrl = import.meta.env.VITE_API_URL;

function Organization() {
  const [orgsWithEvents, setOrgsWithEvents] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOrgLoading, setIsOrgLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);

    const fetchOrganizationsAndEvents = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${apiUrl}organizations/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("There are no organizations available at the moment.");
        }

        const organizations = await response.json();

        const organizationsWithEvents = await Promise.all(
          organizations.map(async (org) => {
            try {
              const res = await fetch(`${apiUrl}organizations/${org._id}/events`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (!res.ok) {
                return { ...org, events: [] };
              }
              const data = await res.json();
              return { ...org, events: data.events };
            } catch {
              return { ...org, events: [] };
            }
          })
        );

        setOrgsWithEvents(organizationsWithEvents);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationsAndEvents();
    const intervalId = setInterval(fetchOrganizationsAndEvents, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleOrgClick = (orgId) => {
    setIsOrgLoading(true);
    localStorage.setItem("selectedOrgId", orgId);
    setTimeout(() => {
      navigate(`/organization/${orgId}`);
    }, 500);
  };

  if (!isLoggedIn) {
    return (
      <div
        className="w-full min-h-screen flex flex-col items-center justify-center bg-[#f7f7f8] pt-20"
        style={{
          backgroundImage: `url(${bgplain1})`,
          backgroundRepeat: "no-repeat",
        }}
      >
        <Link
          to="/login"
          className="flex justify-center items-center h-[10vh] bg-[#3a1078] text-white text-2xl font-bold py-3 px-6 rounded-2xl drop-shadow-2xl transition duration-300 ease-in-out transform hover:bg-[#5a20a2] hover:scale-105"
        >
          Login to View Organizations
        </Link>
      </div>
    );
  }

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <>
      <div
        className="w-full min-h-screen flex flex-col items-center bg-[#f7f7f8] pt-20"
        style={{
          backgroundImage: `url(${bgplain1})`,
          backgroundRepeat: "no-repeat",
        }}
      >
        <h2 className="text-[8vh] sm:text-[4vh] md:text-[6vh] lg:text-[6vh] xl:text-[6vh] font-semibold text-[#3a1078] leading-tight uppercase mb-10 text-center px-4">
          Organizations inside TUP
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-[150vh] px-5 pb-10">
          {orgsWithEvents.map((org) => (
            <div
              key={org._id}
              className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer"
              onClick={() => handleOrgClick(org._id)}
            >
              <img
                src={org.image || "default-image-path"}
                alt={org.name || "Organization Image"}
                className="w-full h-[200px] object-cover"
              />
              <div className="p-4">
                <h2 className="text-2xl font-bold text-gray-800">{org.name}</h2>
                <p className="mt-2 text-gray-600">{org.description}</p>
              </div>

              {/* Events list */}
              <div className="p-4 border-t">
                <h3 className="text-lg font-semibold text-[#3a1078] mb-2">Events</h3>
                {org.events.length > 0 ? (
                  <ul className="space-y-2">
                    {org.events.map((event) => (
                      <li key={event._id} className="text-sm text-gray-700">
                        📅 {event.name} <br />
                        <span className="text-xs text-gray-500">
                          {new Date(event.dateStart).toLocaleDateString()} —{" "}
                          {new Date(event.dateEnd).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">No events available</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isOrgLoading && <Loader />}

      <footer className="w-full bg-[#ffffff] py-10 px-10 text-center text-gray-800 flex flex-col items-center gap-4">
        <div className="flex justify-center items-center gap-4">
          <img src={logo} alt="VOYS Logo" className="h-12 w-auto" />
          <img src={TUPLogo} alt="TUP Logo" className="h-12 w-auto" />
        </div>
        <p className="text-sm">
          &copy; 2024-2025. Empowering Events, Amplifying Voices — VOYS Event Management System
        </p>
      </footer>
    </>
  );
}

export default Organization;
