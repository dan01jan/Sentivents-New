// 🟢 Add to your existing imports (no new files needed)
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

  // 🟠 New states for delete modal
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState(null);

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
    let filtered = events;
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
  }, [selectedOrganization, selectedType, events]);

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

  // 🟠 Replace window.confirm with this delete modal logic
  const openDeleteModal = (eventId) => {
    setEventIdToDelete(eventId);
    setDeleteModalIsOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
    setEventIdToDelete(null);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${apiUrl}events/${eventIdToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        showToastMessage("Event deleted successfully!");
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event._id !== eventIdToDelete)
        );
      }
       else {
        const data = await response.json();
        alert("Failed to delete event: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event. Please try again.");
    } finally {
      closeDeleteModal();
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000); // Toast disappears after 3 sec
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <h1 className="text-[8vh] font-bold mb-4 font-tungsten text-[#3a1078]">
        Admin Event List
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
                <div className="font-bold text-lg mb-2 truncate text-[#3a1078]">
                  {event.name || "No Name"}
                </div>
                <p className="text-gray-700 text-sm mb-2 line-clamp-3">
                  {event.description || "No Description"}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  <span className="font-semibold">Date:</span>{" "}
                  {event.dateStart
                    ? new Date(event.dateStart).toLocaleDateString()
                    : "No Date"}
                </p>
                <p className="text-xs text-gray-600 truncate mb-2">
                  <span className="font-semibold">Location:</span>{" "}
                  {event.location || "No Location"}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  <span className="font-semibold">Type:</span>{" "}
                  {event.type && event.type.eventType
                    ? event.type.eventType
                    : "Unknown"}
                </p>
              </div>
              {event.organization === "League of Student Organization" && (
                <div className="px-4 py-2 flex justify-center items-center border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleUpdate(event)}
                      className="bg-yellow-200 text-yellow-800 text-sm font-semibold px-4 py-2 rounded-full transition duration-300 hover:bg-yellow-300"
                    >
                      UPDATE
                    </button>
                    <button
                      onClick={() => openDeleteModal(event._id)}
                      className="bg-red-200 text-red-800 text-sm font-semibold px-4 py-2 rounded-full transition duration-300 hover:bg-red-300"
                    >
                      DELETE
                    </button>
                    <button
                      onClick={() => handleModalOpen(event)}
                      className="bg-pink-200 text-pink-800 text-sm font-semibold px-4 py-2 rounded-full transition duration-300 hover:bg-pink-300"
                    >
                      VIEW
                    </button>
                    <button
                      onClick={() => handleRegister(event)}
                      className="bg-blue-200 text-pink-800 text-sm font-semibold px-4 py-2 rounded-full transition duration-300 hover:bg-pink-300"
                    >
                      REGISTER APPROVAL
                    </button>
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

      {/* Existing event view modal */}
      <AdminEventModal
        selectedEvent={selectedEvent}
        modalIsOpen={modalIsOpen}
        handleModalClose={handleModalClose}
      />

      {/* 🟠 Inline Delete Confirm Modal */}
      {deleteModalIsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center"
          >
            <h2 className="text-xl font-semibold text-[#3a1078] mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={closeDeleteModal}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* 🟣 Toast Notification */}
{showToast && (
  <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg transition-opacity duration-300 z-50">
    {toastMessage}
  </div>
)}

    </div>
  );
};

export default AdminEventList;
