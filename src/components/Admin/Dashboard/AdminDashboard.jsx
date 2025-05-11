import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";
import "./AdminCalendar.css";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

function AdminDashboard() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [orgCount, setOrgCount] = useState(0);
  const [approvalOrgData, setApprovalOrgData] = useState([]); // aggregated pending approvals data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOfficers, setSelectedOfficers] = useState([]); // pending officers to show in modal
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [date, setDate] = useState(new Date());
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [events, setEvents] = useState([]);

  // Ensure admin is logged in
  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    if (storedUserData && storedUserData.isAdmin) {
      setUserData(storedUserData);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch organizations
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const fetchOrganizations = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${apiUrl}organizations/`, {
          headers: { Authorization: `Bearer ${token}` },
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

  // Fetch organization count
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const fetchOrgCount = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${apiUrl}organizations/get/count`, {
          headers: { Authorization: `Bearer ${token}` },
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

  // Fetch upcoming events
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${apiUrl}events/events/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch upcoming events");
        }
        const data = await response.json();
        setUpcomingEvents(data);
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
      }
    };
    fetchUpcomingEvents();
  }, []);

  // Fetch pending officer approval requests (aggregated)
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${apiUrl}users/organizations/officers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Pending approvals response:", response.data);
        setApprovalOrgData(response.data || []);
      } catch (error) {
        console.error("Error fetching pending approvals:", error);
      }
    };
    fetchPendingApprovals();
  }, []);

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${apiUrl}events/events`);
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const handleViewClick = (org) => {
    setSelectedOrg(org);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrg(null);
    setSelectedOfficers([]);
    setSelectedOrgId(null);
  };

  // For calendar: get events on a specific date
  const getEventsForDate = (date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.dateStart);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Modal: open pending officers for a given organization
  const openApprovalModal = (orgId, officers) => {
    setSelectedOrgId(orgId);
    setSelectedOfficers(officers);
  };

  // Approve an officer
  const handleApprove = async (officerId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${apiUrl}users/organizations/officers/${officerId}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to approve officer.");
      // Remove approved officer from approvalOrgData and modal list
      setApprovalOrgData((prevData) =>
        prevData.map((org) => {
          if (org._id === selectedOrgId) {
            return {
              ...org,
              officers: org.officers.filter(
                (officer) => officer._id !== officerId
              ),
            };
          }
          return org;
        })
      );
      setSelectedOfficers((prev) =>
        prev.filter((officer) => officer._id !== officerId)
      );
    } catch (error) {
      console.error(error);
    }
  };

  // Decline an officer
  const handleDecline = async (officerId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${apiUrl}users/organizations/officers/${officerId}/decline`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to decline officer.");
      const data = await response.json();
      alert(data.message);
      // Remove declined officer from approvalOrgData and modal list
      setApprovalOrgData((prevData) =>
        prevData.map((org) => {
          if (org._id === selectedOrgId) {
            return {
              ...org,
              officers: org.officers.filter(
                (officer) => officer._id !== officerId
              ),
            };
          }
          return org;
        })
      );
      setSelectedOfficers((prev) =>
        prev.filter((officer) => officer._id !== officerId)
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-row pl-10">
      <div className="flex flex-col lg:flex-row p-4 lg:pl-10">
        {/* Left side */}
        <div className="flex flex-col w-full lg:w-3/4 pr-0 lg:pr-5">
          {userData && (
            <div className="bg-[#f7f7f9] h-auto lg:h-[30vh] p-6 rounded-3xl shadow-lg mb-10 flex flex-col lg:flex-row justify-between items-center hover:shadow-xl transition-shadow duration-300">
              <div className="mx-10 text-center lg:text-left">
                <h1 className="text-[5vh] lg:text-[6vh] font-bold text-[#3a1078] font-tungsten">
                  Hi, {userData.name} {userData.surname}! 👋
                </h1>
              </div>
              <div className="w-full lg:w-1/3 h-full flex justify-center items-center">
                <DotLottieReact
                  src="https://lottie.host/e293ffde-604c-4608-8989-03852875a233/4qcsmg5xtt.lottie"
                  loop
                  autoplay
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </div>
          )}
        <div className="h-auto lg:h-[30vh] w-full bg-[#f7f7f9] flex flex-wrap lg:flex-nowrap rounded-3xl justify-center items-center shadow-lg px-4 lg:px-10 gap-4 lg:gap-8 hover:shadow-xl transition-shadow duration-300">
          <div className="w-full lg:w-1/2 h-[20vh] bg-[#3a1078] flex items-center rounded-3xl justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <p className="text-[#f7f7f8] font-bold text-lg lg:text-xl">
              Org. Count: {orgCount}
            </p>
          </div>
          <div className="w-full lg:w-1/2 h-[20vh] bg-[#3a1078] flex items-center rounded-3xl justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <p className="text-[#f7f7f8] font-bold text-lg lg:text-xl">
              Events: {events.length}
            </p>
          </div>
        </div>

          <section className="w-full bg-[#f7f7f9] shadow-lg px-4 lg:px-10 mt-6 lg:mt-11 h-auto lg:h-[40vh] overflow-y-auto rounded-3xl hover:shadow-xl transition-shadow duration-300">
            {loading ? (
              <p className="text-center text-[#3a1078]">Loading...</p>
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : (
              <div className="border-b-4 border-[#f7f7f9]">
                <table className="w-full text-left text-sm lg:text-xl text-[#3a1078] font-bold">
                  <thead className="sticky top-0 bg-[#f7f7f8] text-[#3a1078]">
                    <tr>
                      <th className="w-[15%] p-2 lg:p-5">Organization</th>
                      <th className="w-[70%] p-2 lg:p-5">Details</th>
                      <th className="w-[15%] p-2 lg:p-5 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.map((org) => (
                      <tr
                        key={org.id}
                        className="hover:bg-[#f0f0f0] transition-colors duration-300"
                      >
                        <td className="p-2 lg:p-5 align-middle">
                          <img
                            src={org.image}
                            alt={org.name}
                            className="w-12 h-12 lg:w-16 lg:h-16 rounded-full"
                          />
                        </td>
                        <td className="p-2 lg:p-5 align-middle">
                          <h3 className="text-[#3a1078] font-bold text-sm lg:text-lg">
                            {org.name}
                          </h3>
                          <p className="text-gray-600 text-xs lg:text-sm">
                            {org.description}
                          </p>
                        </td>
                        <td className="p-2 lg:p-5 text-center align-middle">
                          <button
                            className="bg-[#3a1078] text-white px-2 py-1 lg:px-4 lg:py-2 rounded-lg hover:bg-[#2a0d5e] transition"
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
        </div>

        {/* Right side */}
        <div className="w-full lg:w-1/4 px-0 lg:px-5 mt-6 lg:mt-0">
          <div className="flex justify-center lg:justify-start">
            <Calendar
              onChange={setDate}
              value={date}
              tileContent={({ date, view }) => {
                if (view === "month") {
                  const dayEvents = getEventsForDate(date);
                  return dayEvents.length > 0 ? (
                    <div className="text-xs text-center mt-1">
                      {dayEvents.map((event, index) => (
                        <div key={index}>{event.name}</div>
                      ))}
                    </div>
                  ) : null;
                }
                return null;
              }}
              className="calendar-custom hover:shadow-lg transition-shadow duration-300"
            />
          </div>
          <div className="mt-6 lg:mt-10">
            <h2 className="text-lg lg:text-xl font-bold text-[#3a1078]">
              Upcoming Events
            </h2>
            <ul className="mt-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <li
                    key={event._id}
                    className="mb-2 hover:bg-[#f0f0f0] transition-colors duration-300"
                  >
                    <div className="bg-[#f7f7f9] p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                      <h3 className="text-sm lg:text-lg font-bold text-[#3a1078]">
                        {event.name}
                      </h3>
                      <p className="text-gray-600 text-xs lg:text-sm">
                        {new Date(event.dateStart).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-sm lg:text-base">No upcoming events</li>
              )}
            </ul>
          </div>
          <div className="mt-6 lg:mt-10">
            <h2 className="text-lg lg:text-xl font-bold text-[#3a1078]">
              Pending Officers Approval
            </h2>
            <ul className="mt-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
              {approvalOrgData
                .filter((org) => org.officers && org.officers.length > 0)
                .map((org) => {
                  const pending = org.officers;
                  return (
                    <div
                      key={org._id || org.name}
                      className="relative bg-white rounded-lg p-4 shadow-md hover:shadow-xl transition cursor-pointer"
                      onClick={() => openApprovalModal(org._id, pending)}
                    >
                      <h2 className="text-center text-sm lg:text-lg text-[#3a1078] font-semibold">
                        {org.name}
                      </h2>
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {pending.length}
                      </div>
                    </div>
                  );
                })}
            </ul>
          </div>
        </div>
      </div>
      {/* Modal for officer approvals */}
      {selectedOfficers.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              &times;
            </button>
            <h2 className="text-4xl font-bold mb-4 text-[#3a1078]">
              Officer Approvals
            </h2>
            {selectedOfficers.map((officer) => (
              <div key={officer._id} className="mb-4 p-4 border rounded-lg">
                <img
                  src={
                    officer.image ||
                    "https://res.cloudinary.com/do2utxjmc/image/upload/v1741749795/3918329-200_bpfm11.png"
                  }
                  alt="Officer"
                  className="w-24 h-24 rounded-full mb-2 mx-auto"
                />
                <p className="text-2xl text-center text-[#3a1078] font-semibold">
                  {officer.name} {officer.surname}
                </p>
                <p className="text-center text-[#3a1078]">{officer.email}</p>
                <div className="flex space-x-4 mt-2 justify-center">
                  <button
                    onClick={() => handleApprove(officer._id)}
                    className="bg-[#3a1078] text-white px-4 py-2 rounded-lg hover:bg-[#3a1078c5]"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecline(officer._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-400"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
