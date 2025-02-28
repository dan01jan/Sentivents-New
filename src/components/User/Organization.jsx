import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bgplain1 from "../../assets/website/bg_plain.png";
import logo from "../../assets/website/V_DarkerLogo.png";
import TUPLogo from "../../assets/website/TUP logo.png";
const apiUrl = import.meta.env.VITE_API_URL;

function Organization() {
  const [organizations, setOrganizations] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);

    const fetchOrganizations = async () => {
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
        const data = await response.json();
        console.log("Fetched organizations data:", data);
        setOrganizations(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizations();
    const intervalId = setInterval(fetchOrganizations, 2000);

    return () => clearInterval(intervalId);
  }, []);

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
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
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
        <h2 className="text-[6vh] font-tungsten text-[#3a1078] leading-tight uppercase mb-10">
          Organizations inside TUP
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-[150vh] px-5 pb-10">
          {organizations.map((org) => (
            <Link
              to={`/organization/${org._id}`}
              key={org._id}
              className="max-w-sm w-full shadow-lg"
            >
              <div className="relative bg-white shadow-md rounded-lg overflow-hidden">
                <img
                  src={org.image || "default-image-path"}
                  alt={org.name || "Organization Image"}
                  className="w-full h-[300px] object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-2xl font-bold text-gray-800">{org.name}</h2>
                <p className="mt-2 text-gray-600">{org.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
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

export default Organization;