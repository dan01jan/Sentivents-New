import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import EventModal from "./EventModal";
const apiUrl = import.meta.env.VITE_API_URL;
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowRight } from "react-icons/fa";
import Loader from "../../Layouts/Loader";
import { ToastContainer } from "react-toastify";
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
          className={`mx-1 px-3 py-1 rounded-full ${currentPage === number ? "bg-blue-500 text-white" : "bg-pink-200"
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
  const [user, setUser] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;
  const [userOrganizationName, setUserOrganizationName] = useState("");
  const [filter, setFilter] = useState({ type: "", date: "" });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const [groupByType, setGroupByType] = useState(true); // State to toggle grouping by type

  // Helper function: Get organization name (prefer officerOrgName if exists)
  const getOrganizationName = () => {
    const officerOrgName = localStorage.getItem("officerOrgName");
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    return (
      officerOrgName ||
      (storedUserData ? storedUserData.organizationName : null)
    );
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const organizationName = getOrganizationName();

        const response = await fetch(
          `${apiUrl}events/adminevents?organization=${organizationName}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();
        const active = data.filter((e) => !e.isArchived);
        const archived = data.filter((e) => e.isArchived);
        setEvents(active);
        setFilteredEvents(active);
        setArchivedEvents(archived);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userData = JSON.parse(localStorage.getItem("userData")); // Get user data

        // Fetch user data
        const response = await fetch(
          `${apiUrl}users/officer/${userData.userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        setUser(data);

        console.log("Logged in:", userData);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchUser();
  }, []);

  const handleArchive = async (eventId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${apiUrl}events/archive/${eventId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to archive event");

      toast.success("Event archived.");
      setTimeout(() => window.location.reload(), 1500); // reload after toast
    } catch (error) {
      toast.error("Archive error: " + error.message);
    }
  };


  const handleUnarchive = async (eventId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${apiUrl}events/unarchive/${eventId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to unarchive event");

      toast.success("Event unarchived.");
      setTimeout(() => {
        window.location.href = "/dashboard/events"; // navigate and reload
      }, 1500);
    } catch (error) {
      toast.error("Unarchive error: " + error.message);
    }
  };


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilter = { ...filter, [name]: value };
    setFilter(newFilter);
    filterEvents(newFilter);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;

    setLoading(true);
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
      setLoading(false);
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
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <Loader />
      </div>
    );
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
    localStorage.setItem("selectedEventId", event._id);
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

  const groupedEvents = groupByType
    ? groupEventsByType(filteredEvents)
    : { "No Grouping": filteredEvents };

  return (
    <div className="p-4 max-w-full mx-auto">
      <ToastContainer position="bottom-right" autoClose={3000} />
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Loader />
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 fade-in-left">
        <h2 className="text-[6vh] font-semibold text-[#3a1078] font-semibold">
          EVENTS
        </h2>
        <button
          type="button"
          onClick={handleNavigate}
          className="bg-[#3a1078] text-white font-semibold py-3 px-4 md:py-4 md:px-6 rounded-3xl flex items-center gap-2 hover:bg-[#3a1078c5] transition"
        >
          Create Event
          <FaArrowRight className="text-white text-lg" />
        </button>
        {/* <button
        onClick={() => setIsArchiveModalOpen(true)}
        className="bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-3xl hover:bg-gray-400 transition"
      >
        View Archived
      </button> */}

      </div>

      <div className="mb-4 flex justify-between items-center flex-wrap gap-2 fade-in-left">
        <div>
          <label htmlFor="type" className="mr-2">Filter by Type:</label>
          <select
            id="type"
            name="type"
            value={filter.type}
            onChange={handleFilterChange}
            className="px-4 py-2 rounded-full bg-gray-100"
          >
            <option value="">All</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date" className="mr-2">Filter by Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={filter.date}
            onChange={handleFilterChange}
            className="px-4 py-2 rounded-full bg-gray-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="mr-2">Group by Type</label>
          <input
            type="checkbox"
            checked={groupByType}
            onChange={() => setGroupByType(!groupByType)}
          />
        </div>
        <div>
          <button
            onClick={() => setIsArchiveModalOpen(true)}
            className="ml-4 bg-[#3a1078] text-white font-semibold px-4 py-2 rounded-full hover:bg-[#3795bd] transition"

          >
            View Archived
          </button>
        </div>
      </div>


      {Object.entries(groupedEvents).map(([type, events]) => (
        <div key={type} className="mb-6 fade-in-up">
          <h3 className="text-2xl font-semibold text-[#3a1078]">{type}</h3>
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
                  <div className="w-full h-48 bg-gray-200"></div>
                )}

                <div className="px-4 py-4">
                  <div className="font-bold text-xl mb-2 truncate text-[#3a1078]">
                    {event.name || "No Name"}
                  </div>
                  <div className="font-bold text-lg mb-2 truncate text-red-600">
                    {event.organization || "No Organization"}
                  </div>
                  {event.secondOrganization ? (
                    <p className="text-gray-700 text-sm mb-2 line-clamp-3">
                      In partnership with {event.secondOrganization}
                    </p>
                  ) : null}

                  <p className="text-gray-700 text-[1.7vh] mb-2 line-clamp-3">
                    {event.description || "No Description"}
                  </p>
                  <p className="text-[1.7vh] text-gray-600 mb-2 truncate">
                    <span className="font-semibold">Start:</span>{" "}
                    {event.dateStart
                      ? `${new Date(event.dateStart).toLocaleDateString()} ${new Date(event.dateStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : "No Start Date"}
                  </p>
                  <p className="text-[1.7vh] text-gray-600 mb-2 truncate">
                    <span className="font-semibold">End:</span>{" "}
                    {event.dateEnd
                      ? `${new Date(event.dateEnd).toLocaleDateString()} ${new Date(event.dateEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : "No End Date"}
                  </p>
                  <p className="text-[1.7vh] text-gray-600 mb-2 truncate">
                    <span className="font-semibold">Location:</span>{" "}
                    {event.location?.name || event.location || "No Location"}{" "}
                    (Remaining: {event.remainingCapacity ?? "0"}/{event.capacity ?? "0"})
                  </p>

                  <p className="text-[1.7vh] text-gray-600 mb-2 truncate">
                    <span className="font-semibold">Type:</span>{" "}
                    {event.type && event.type.eventType
                      ? event.type.eventType
                      : "Unknown"}
                  </p>
                </div>

                <div className="px-4 py-2 flex justify-center items-center border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleUpdate(event)}
                      className="bg-yellow-200 text-yellow-800 text-sm font-semibold px-4 py-2 rounded-full transition duration-300 hover:bg-yellow-300"
                      disabled={loading}
                    >
                      UPDATE
                    </button>
                    <button
                      onClick={() => handleArchive(event._id)}
                      className="bg-red-200 text-red-800 text-sm font-semibold px-4 py-2 rounded-full transition duration-300 hover:bg-red-300"
                      disabled={loading}
                    >
                      ARCHIVE
                    </button>
                    <button
                      onClick={() => handleModalOpen(event)}
                      className="bg-pink-200 text-pink-800 text-sm font-semibold px-4 py-2 rounded-full transition duration-300 hover:bg-pink-300"
                      disabled={loading}
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
        isOpen={isArchiveModalOpen}
        onRequestClose={() => setIsArchiveModalOpen(false)}
        className="relative bg-white rounded-xl p-6 max-w-3xl mx-auto mt-20 shadow-lg overflow-auto max-h-[80vh] "
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
      >

        <div className="flex justify-between items-center mb-4 justify-center gap-4">
          <h2 className="text-2xl font-semibold text-[#3a1078]">Archived Events</h2>
          <button
            onClick={() => setIsArchiveModalOpen(false)}
            className="text-gray-500 hover:text-red-500 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 max-h-[70vh] pr-2">
          {archivedEvents.length === 0 ? (
            <p className="text-center text-gray-500">No archived events found.</p>
          ) : (
            <div className="space-y-4">
              {archivedEvents.map((event) => (
                <div
                  key={event._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 border border-gray-200 p-4 sm:p-5 rounded-xl shadow-sm transition hover:shadow-md"

                >
                  {/* Event Info */}
                  <div className="mb-3 sm:mb-0">
                    <h3 className="text-lg font-semibold text-[#3a1078]">
                      {event.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                  </div>

                  {/* Action Button */}

                  <button
                    onClick={async () => await handleUnarchive(event._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition"

                  >
                    UNARCHIVE
                  </button>
                </div>

              ))}
            </div>
          )}
        </div>
      </Modal>



      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Confirm Delete"
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-70 z-40"
      >
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader />
              <p className="text-gray-600 mt-2 text-sm font-medium">
                Deleting event...
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Are you sure you want to delete this event?
              </h2>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-full text-sm transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm transition"
                  disabled={loading}
                >
                  Confirm
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EventList;
