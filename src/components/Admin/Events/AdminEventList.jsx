import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import AdminEventModal from "./AdminEventModal";

const apiUrl = import.meta.env.VITE_API_URL;

const AdminEventList = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [archiveView, setArchiveView] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${apiUrl}events/events`);
        const data = await response.json();
        setEvents(data);
        setOrganizations([...new Set(data.map((event) => event.organization))]);
        setTypes([...new Set(data.map((event) => event.type.eventType))]);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events.filter((event) => {
      // If isArchived is undefined, treat it as false
      const isArchived = event.isArchived ?? false;
      return isArchived === archiveView;
    });

    if (selectedOrganization) {
      filtered = filtered.filter(
        (event) => event.organization === selectedOrganization
      );
    }

    if (selectedType) {
      filtered = filtered.filter(
        (event) => event.type.eventType === selectedType
      );
    }

    setFilteredEvents(filtered);
  }, [selectedOrganization, selectedType, events, archiveView]);


  const handleCreateEvent = () => {
    navigate("/admin/eventcreate");
  };

  const handleUpdate = (event) => {
    navigate(`/admin/eventupdate/${event._id}`, { state: { event } });
  };

  const handleRegister = (event) => {
    localStorage.setItem("selectedEventId", event._id);
    navigate(`/admin/eventregister/${event._id}`, { state: { event } });
  };

  const handleModalOpen = (event) => {
    localStorage.setItem("selectedEventId", event._id);
    setSelectedEvent(event);
    setModalIsOpen(true);
  };

  const handleModalClose = () => {
    setModalIsOpen(false);
    setSelectedEvent(null);
  };

  const handleArchiveToggle = async (eventId, toArchive) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${apiUrl}events/${toArchive ? "archive" : "unarchive"}/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showToastMessage(
          toArchive ? "Event archived successfully!" : "Event unarchived successfully!",
          toArchive ? "📦" : "🎉"
        );
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event._id === eventId ? { ...event, isArchived: toArchive } : event
          )
        );
      } else {
        const data = await response.json();
        alert("Failed to update archive status: " + data.message);
      }
    } catch (error) {
      console.error("Error archiving/unarchiving event:", error);
      alert("Error. Please try again.");
    }
  };

  const showToastMessage = (message, emoji = "✨") => {
    setToastMessage(`${emoji} ${message}`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <h1 className="text-[6vh] font-bold mb-4 font-semibold text-[#3a1078]">
        {archiveView ? "Archived Events" : "Admin Event List"}
      </h1>

      <div className="flex gap-4 mb-6 justify-center">
        <select
          onChange={(e) => setSelectedOrganization(e.target.value)}
          className="w-40 p-2 border rounded"
        >
          <option value="">All Organizations</option>
          {organizations.map((org) => (
            <option key={org} value={org}>
              {org}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-40 p-2 border rounded"
        >
          <option value="">All Event Types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <button
          onClick={() => setArchiveView(!archiveView)}
          className="ml-4 bg-[#3a1078] text-white font-semibold px-4 py-2 rounded-full hover:bg-[#3795bd] transition"
        >
          {archiveView ? "Show Active" : "View Archives"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {filteredEvents.map((event) => (
          <motion.div key={event._id} whileHover={{ scale: 1.05 }}>
            <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 ease-in-out mt-5 bg-white">
              {event.images && event.images.length > 0 ? (
                <img
                  className="w-full h-48 object-cover"
                  src={event.images[0]}
                  alt={event.name || "Event Image"}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200"></div>
              )}
              <div className="p-4">
                <div className="font-bold text-xl mb-2 truncate text-[#3a1078]">
                  {event.name || "No Name"}
                </div>
                <p className="text-gray-700 text-[1.7vh] mb-2 line-clamp-3">
                  {event.description || "No Description"}
                </p>
                <p className="text-[1.7vh] text-gray-600 mb-2 truncate">
                  <span className="font-semibold">Date:</span>{" "}
                  {event.dateStart
                    ? new Date(event.dateStart).toLocaleDateString()
                    : "No Date"}{" "}
                  to{" "}
                  {event.dateEnd
                    ? new Date(event.dateEnd).toLocaleDateString()
                    : "No Date"}
                </p>
                <p className="text-[1.7vh] text-gray-600 mb-2 truncate">
                  <span className="font-semibold">Location:</span>{" "}
                  {typeof event.location === "string"
                    ? event.location
                    : event.location?.name || "No Location"}{" "}
                  (Remaining: {event.remainingCapacity ?? "0"}/{event.capacity ?? "0"})
                </p>
                <p className="text-[1.7vh] text-gray-600 mb-2 truncate">
                  <span className="font-semibold">Type:</span>{" "}
                  {typeof event.type === "string"
                    ? event.type
                    : event.type?.eventType || "Unknown"}
                </p>
              </div>
              {event.organization === "League of Student Organization" && (
                <div className="px-4 py-2 flex justify-center items-center border-t border-gray-200">
                  <div className="flex space-x-3">
                    {!archiveView && (
                      <>
                        <button
                          onClick={() => handleUpdate(event)}
                          className="bg-yellow-200 text-yellow-800 text-sm font-semibold px-4 py-2 rounded-full transition duration-300 hover:bg-yellow-300"
                        >
                          UPDATE
                        </button>
                        <button
                          onClick={() => handleArchiveToggle(event._id, true)}
                          className="bg-red-200 text-red-800 text-sm font-semibold px-4 py-2 rounded-full transition duration-300 hover:bg-red-300"
                        >
                          ARCHIVE
                        </button>
                      </>
                    )}
                    {archiveView && (
                      <button
                        onClick={() => handleArchiveToggle(event._id, false)}
                        className="bg-green-200 text-green-800 text-sm font-semibold px-4 py-2 rounded-full transition duration-300 hover:bg-green-300"
                      >
                        UNARCHIVE
                      </button>
                    )}
                    <button
                      onClick={() => handleModalOpen(event)}
                      className="bg-pink-200 text-pink-800 text-sm font-semibold px-4 py-2 rounded-full transition duration-300 hover:bg-pink-300"
                    >
                      VIEW
                    </button>
                    {!archiveView && (
                      <button
                        onClick={() => handleRegister(event)}
                        className="bg-blue-200 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full transition duration-300 hover:bg-blue-300"
                      >
                        REGISTER APPROVAL
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <button
        className="fixed bottom-10 right-10 bg-[#3a1078] text-white p-4 rounded-full shadow-lg hover:bg-[#3a1078c5] transition"
        onClick={handleCreateEvent}
      >
        <FaPlus size={24} />
      </button>

      <AdminEventModal
        selectedEvent={selectedEvent}
        modalIsOpen={modalIsOpen}
        handleModalClose={handleModalClose}
      />

      {showToast && (
        <div className="fixed bottom-6 right-6 px-6 py-3 rounded-xl bg-pink-100 border border-pink-300 shadow-lg text-pink-900 font-medium text-sm transition-opacity duration-300 ease-in-out z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default AdminEventList;
