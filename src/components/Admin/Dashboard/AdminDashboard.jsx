import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";
import "./AdminCalendar.css";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const apiUrl = import.meta.env.VITE_API_URL;

function AdminDashboard() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [orgCount, setOrgCount] = useState(0); // New state for organization count
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    if (storedUserData && storedUserData.isAdmin) {
      setUserData(storedUserData);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchOrganizations = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${apiUrl}organizations/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(
            "There are no organizations available at the moment."
          );
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

  // New useEffect to fetch the organization count
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchOrgCount = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${apiUrl}organizations/get/count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch organization count");
        }
        const data = await response.json();
        setOrgCount(data.orgCount);
      } catch (error) {
        console.error("Error fetching organization count:", error);
      }
    };

    fetchOrgCount();
    const countIntervalId = setInterval(fetchOrgCount, 2000);

    return () => clearInterval(countIntervalId);
  }, []);

  const handleViewClick = (org) => {
    setSelectedOrg(org);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrg(null);
  };

  return (
    <div className="flex flex-row pl-10">
      <div className="flex flex-col w-3/4 pr-5">
        {userData && (
          <div className="bg-[#f7f7f9] h-[30vh] p-6 rounded-3xl shadow-lg mb-10 flex justify-between items-center hover:shadow-xl transition-shadow duration-300">
            <div className="mx-10">
              <h1 className="text-[8vh] font-bold text-[#3a1078] font-tungsten">
                Hi, {userData.name} {userData.surname}! 👋
              </h1>
              {/* <p className="text-2xl font-bold text-[#3a1078] ">
                kunware wala kang nababasa ha? thank you so much
              </p> */}
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
        <div className="h-[30vh] w-full bg-[#f7f7f9] flex rounded-3xl justify-center items-center shadow-lg px-10 gap-8 hover:shadow-xl transition-shadow duration-300">
          {/* Updated Box 1 to display total organizations */}
          <div className="w-1/4 h-[20vh] bg-[#3a1078] flex items-center rounded-3xl justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <p className="text-[#f7f7f8] font-bold text-xl">
              Org. Count: {orgCount}
            </p>
          </div>
          <div className="w-1/4 h-[20vh] bg-[#3a1078] flex items-center rounded-3xl justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <p className="text-[#f7f7f8] font-bold text-xl">Box 2</p>
          </div>
          <div className="w-1/4 h-[20vh] bg-[#3a1078] flex items-center rounded-3xl justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <p className="text-[#f7f7f8] font-bold text-xl">Box 3</p>
          </div>
          <div className="w-1/4 h-[20vh] bg-[#3a1078] flex items-center rounded-3xl justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <p className="text-[#f7f7f8] font-bold text-xl">Box 4</p>
          </div>
        </div>

        <section className="w-full bg-[#f7f7f9] shadow-lg px-10 mt-11 h-[40vh] overflow-y-auto rounded-3xl hover:shadow-xl transition-shadow duration-300">
          {loading ? (
            <p className="text-white text-center">Loading...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <div className="border-b-4 border-[#f7f7f9]">
              <table className="w-full text-left text-xl text-[#3a1078] font-bold">
                <thead className="sticky top-0 bg-[#f7f7f8] text-[#3a1078]">
                  <tr>
                    <th className="w-[15%] p-5">Organization</th>
                    <th className="w-[70%] p-5">Details</th>
                    <th className="w-[15%] p-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((org) => (
                    <tr
                      key={org.id}
                      className="hover:bg-[#f0f0f0] transition-colors duration-300"
                    >
                      <td className="p-5 align-middle">
                        <img
                          src={org.image}
                          alt={org.name}
                          className="w-16 h-16 rounded-full"
                        />
                      </td>
                      <td className="p-5 align-middle">
                        <h3 className="text-[#3a1078] font-bold text-lg">
                          {org.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {org.description}
                        </p>
                      </td>
                      <td className="p-5 text-center align-middle">
                        <button
                          className="bg-[#3a1078] text-white px-4 py-2 rounded-lg hover:bg-[#2a0d5e] transition"
                          onClick={() => handleViewClick(org)}
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="sticky bottom-0 bg-[#f7f7f8] h-10">
                  <tr>
                    <td colSpan="3" className="p-0"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        {isModalOpen && selectedOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-5 rounded-lg shadow-lg w-1/2 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl font-bold mb-4">{selectedOrg.name}</h2>
              <img
                src={selectedOrg.image}
                alt={selectedOrg.name}
                className="w-32 h-32 rounded-full mb-4"
              />
              <p className="text-gray-600 mb-4">{selectedOrg.description}</p>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-1/4 px-5">
        <div className="flex">
          <Calendar
            onChange={setDate}
            value={date}
            className="calendar-custom hover:shadow-lg transition-shadow duration-300"
          />
        </div>
        <div className="mt-10">
          <h2 className="text-xl font-bold text-[#3a1078]">Upcoming Events</h2>
          <ul className="mt-4">
            <li className="mb-2 hover:bg-[#f0f0f0] transition-colors duration-300">
              <div className="bg-[#f7f7f9] p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-lg font-bold text-[#3a1078]">secret</h3>
                <p className="text-gray-600">03/20/2030</p>
              </div>
            </li>
          </ul>
        </div>
        <div className="mt-10">
          <h2 className="text-xl font-bold text-[#3a1078]">New Officers</h2>
          <ul className="mt-4">
            <li className="mb-2 hover:bg-[#f0f0f0] transition-colors duration-300">
              <div className="bg-[#f7f7f9] p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-lg font-bold text-[#3a1078]">ej cezar</h3>
                <p className="text-gray-600">president</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
