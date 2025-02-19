import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import EventModal from "./EventModal";
const apiUrl = import.meta.env.VITE_API_URL;
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

Modal.setAppElement("#root");

const Pagination = ({ currentPage, totalPages, paginate }) => {
  const pageNumbers = [];
  const maxVisibleButtons = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

  if (endPage - startPage + 1 < maxVisibleButtons) {
    startPage = Math.max(1, endPage - maxVisibleButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="mt-4 flex justify-center items-center space-x-2">
      <button
        onClick={() => paginate(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-full bg-pink-200 disabled:opacity-50"
      >
        &lt;
      </button>
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => paginate(number)}
          className={`mx-1 px-3 py-1 rounded-full ${
            currentPage === number ? "bg-blue-500 text-white" : "bg-pink-200"
          }`}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-full bg-pink-200 disabled:opacity-50"
      >
        &gt;
      </button>
    </div>
  );
};

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;
  const [filter, setFilter] = useState({ type: "", date: "" });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [groupByType, setGroupByType] = useState(true); // State to toggle grouping by type

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
        setEvents(data);
        setFilteredEvents(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilter = { ...filter, [name]: value };
    setFilter(newFilter);
    filterEvents(newFilter);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${apiUrl}events/${eventToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      setEvents(events.filter((event) => event._id !== eventToDelete));
      setFilteredEvents(
        filteredEvents.filter((event) => event._id !== eventToDelete)
      );

      toast.success("Event deleted successfully!", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Error: " + error.message, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      closeDeleteModal();
    }
  };

  const filterEvents = (filter) => {
    let filtered = [...events];

    if (filter.type) {
      filtered = filtered.filter(
        (event) => event.type && event.type.eventType === filter.type
      );
    }

    if (filter.date) {
      filtered = filtered.filter(
        (event) =>
          new Date(event.dateStart).toLocaleDateString() ===
          new Date(filter.date).toLocaleDateString()
      );
    }

    setFilteredEvents(filtered);
    setCurrentPage(1);
  };

  const eventTypes = [...new Set(events.map((event) => event.type.eventType))];

  const groupEventsByType = (events) => {
    return events.reduce((acc, event) => {
      const type = event.type.eventType || "Unknown";
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(event);
      return acc;
    }, {});
  };

  if (loading) {
    return <p>Loading events...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleNavigate = () => {
    navigate("/dashboard/createevents");
  };

  const handleUpdate = (event) => {
    const eventId = event._id;
    navigate(`/dashboard/updateevents/${eventId}`);
  };

  const handleModalOpen = (event) => {
    setSelectedEvent(event);
    localStorage.setItem("selectedEventId", event._id); // Store the event ID in local storage
    setModalIsOpen(true);
  };

  const handleModalClose = () => {
    setModalIsOpen(false);
    setSelectedEvent(null);
  };

  const openDeleteModal = (eventId) => {
    setEventToDelete(eventId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEventToDelete(null);
  };

  // Group events if necessary
  const groupedEvents = groupByType
    ? groupEventsByType(filteredEvents)
    : { "No Grouping": filteredEvents };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold text-teal-600 font-pacifico">
          EVENTS
        </h2>
        <button
          type="button"
          onClick={handleNavigate}
          className="bg-gradient-to-r from-pink-400 to-teal-500 text-white px-4 py-2 rounded-full text-sm shadow-lg hover:from-pink-500 hover:to-teal-600 transition duration-300 ease-in-out"
        >
          Create Event
        </button>
      </div>

      <div className="mb-4 flex justify-between">
        <div>
          <label htmlFor="type" className="mr-2">
            Filter by Type:
          </label>
          <select
            id="type"
            name="type"
            value={filter.type}
            onChange={handleFilterChange}
            className="px-4 py-2 rounded-full bg-gray-100"
          >
            <option value="">All</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date" className="mr-2">
            Filter by Date:
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={filter.date}
            onChange={handleFilterChange}
            className="px-4 py-2 rounded-full bg-gray-100"
          />
        </div>
        <div>
          <label className="mr-2">Group by Type</label>
          <input
            type="checkbox"
            checked={groupByType}
            onChange={() => setGroupByType(!groupByType)}
            className="mr-2"
          />
        </div>
      </div>

      {/* Display events */}
      {Object.entries(groupedEvents).map(([type, events]) => (
        <div key={type} className="mb-6">
          <h3 className="text-2xl font-semibold text-teal-600">{type}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
            {events.map((event) => (
              <div
                key={event._id}
                className="rounded-lg overflow-hidden shadow-lg bg-white max-w-full hover:shadow-2xl transition duration-300 ease-in-out mt-5"
              >
                {/* Event Image */}
                {event.images && event.images.length > 0 ? (
                  <img
                    className="w-full h-48 object-cover"
                    src={event.images[0]}
                    alt={event.name || "Event Image"}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200"></div> // Placeholder if no image
                )}

                <div className="px-4 py-4">
                  <div className="font-bold text-lg mb-2 truncate">
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

                <div className="px-4 py-2 flex justify-center items-center border-t border-gray-200">
                  {/* Action Buttons */}
                  <div className="flex space-x-3 "> 
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
      />

      <EventModal
        selectedEvent={selectedEvent}
        modalIsOpen={modalIsOpen}
        handleModalClose={handleModalClose}
        handleViewReports={() => {
          /* Implement this function */
        }}
        handleViewAttendance={() => {
          /* Implement this function */
        }}
        handleCreateQuestionnaire={() => {
          /* Implement this function */
        }}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Confirm Delete"
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-70 z-40"
      >
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Are you sure you want to delete this event?
          </h2>
          <div className="flex justify-end gap-3">
            <button
              onClick={closeDeleteModal}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-full text-sm transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm transition"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventList;
