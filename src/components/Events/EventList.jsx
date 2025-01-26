import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import './EventList.css';
import EventModal from './EventModal';
const apiUrl = import.meta.env.VITE_API_URL;

Modal.setAppElement('#root');

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
          className={`mx-1 px-3 py-1 rounded-full ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-pink-200'}`}
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
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;
  const [filter, setFilter] = useState({ type: '', date: '' });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${apiUrl}events/adminevents`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch events');
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

  const filterEvents = (filter) => {
    let filtered = [...events];

    if (filter.type) {
      filtered = filtered.filter((event) => event.type && event.type.eventType === filter.type);
    }

    if (filter.date) {
      filtered = filtered.filter(
        (event) => new Date(event.dateStart).toLocaleDateString() === new Date(filter.date).toLocaleDateString()
      );
    }

    setFilteredEvents(filtered);
    setCurrentPage(1);
  };

  const eventTypes = [...new Set(events.map((event) => event.type.eventType))];

  if (loading) {
    return <p>Loading events...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleNavigate = () => {
    navigate('/dashboard/createevents');
  };

  const handleUpdate = (event) => {
    const eventId = event._id;
    navigate(`/dashboard/updateevents/${eventId}`);
  };

  const handleModalOpen = (event) => {
    console.log("Event selected:", event); // Log to ensure the correct event is selected
    setSelectedEvent(event);
    localStorage.setItem('selectedEventId', event._id); // Store the event ID in local storage
    setModalIsOpen(true);
  };
  

  const handleModalClose = () => {
    setModalIsOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold text-teal-600 font-pacifico">EVENTS</h2>
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
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
        {currentEvents.map((event) => (
          <div
            key={event._id}
            className="rounded-lg overflow-hidden shadow-lg bg-white max-w-xs hover:shadow-xl transition duration-300 ease-in-out"
          >
            {event.images && event.images.length > 0 && (
              <img
                className="w-full h-24 object-cover"
                src={event.images[0]}
                alt={event.name}
              />
            )}
            <div className="px-2 py-2">
              <div className="font-bold text-sm mb-1 truncate">{event.name}</div>
              <p className="text-gray-700 text-xs mb-1 line-clamp-2">{event.description}</p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Type:</span> {event.type ? event.type.eventType : 'Unknown'}
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Date:</span> {new Date(event.dateStart).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-600 truncate">
                <span className="font-semibold">Location:</span> {event.location}
              </p>
            </div>
            <div className="px-2 pt-1 pb-2 flex justify-between items-center">
              <span className="inline-block bg-teal-200 text-teal-800 text-xs font-semibold px-2 py-1 rounded-full">
                {event.type.eventType}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdate(event)}
                  className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full transition duration-300 hover:bg-yellow-300"
                >
                  UPDATE
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="bg-red-200 text-red-800 text-xs font-semibold px-3 py-1 rounded-full transition duration-300 hover:bg-red-300"
                >
                  DELETE
                </button>
                <button
                  onClick={() => handleModalOpen(event)}
                  className="bg-pink-200 text-pink-800 text-xs font-semibold px-3 py-1 rounded-full transition duration-300 hover:bg-pink-300"
                >
                  More Info
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
      />

      {/* Modal */}
      <EventModal
        selectedEvent={selectedEvent}
        modalIsOpen={modalIsOpen}
        handleModalClose={handleModalClose}
        handleViewReports={() => {/* Implement this function */}}
        handleViewAttendance={() => {/* Implement this function */}}
        handleCreateQuestionnaire={() => {/* Implement this function */}}
      />
    </div>
  );
};

export default EventList;
