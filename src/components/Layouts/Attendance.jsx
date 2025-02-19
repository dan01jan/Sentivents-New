import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

const Attendance = () => {
  const [eventId, setEventId] = useState("");
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [eventStatus, setEventStatus] = useState("");
  const [fetchClicked, setFetchClicked] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiUrl}events/adminEvents`);
        setEvents(response.data || []);
      } catch (err) {
        setError("Error fetching events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const fetchAttendees = async () => {
    if (!eventId) {
      setError("Event ID is required");
      return;
    }
    setError("");
    setLoading(true);
    setFetchClicked(true);
    try {
      const response = await axios.get(`${apiUrl}attendance/getUsersByEvent/${eventId}`);
      const eventResponse = await axios.get(`${apiUrl}events/${eventId}`);
      setAttendees(response.data || []);
      setEventName(eventResponse.data.name);
      setEventStatus(new Date() > new Date(eventResponse.data.dateEnd) ? "done" : "ongoing");
    } catch (err) {
      setError("Error fetching attendees");
    } finally {
      setLoading(false);
    }
  };

  const handleCircleChange = (userId) => {
    setSelectedAttendees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const approveAttendance = async () => {
    if (!eventId || selectedAttendees.length === 0) {
      setError("Please select an event and attendees to approve.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const attendeesToUpdate = attendees
        .filter((att) => selectedAttendees.includes(att.userId))
        .map((att) => ({ userId: att.userId, hasAttended: true }));
      
      await axios.put(`${apiUrl}attendance/updateUsersAttendance/${eventId}`, {
        attendees: attendeesToUpdate,
      });
      
      toast.success("Approved User Attendance");
      setTimeout(() => navigate("/dashboard/attendance"), 3000);
      fetchAttendees();
    } catch (err) {
      setError("Error approving attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Attendance Approval
      </h1>
      <div className="flex w-full max-w-5xl gap-6">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-1/2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Select Event</h2>
          <div className="space-y-2">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event._id} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={`event-${event._id}`}
                    name="selectedEvent"
                    value={event._id}
                    checked={eventId === event._id}
                    onChange={(e) => {
                      setEventId(e.target.value);
                      setAttendees([]);
                      setFetchClicked(false);
                    }}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor={`event-${event._id}`} className="text-lg font-medium text-gray-700">
                    {event.name}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No events available</p>
            )}
          </div>
          <button
            onClick={fetchAttendees}
            disabled={loading || !eventId}
            className="w-full py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 mt-5"
          >
            {loading ? "Loading..." : "Fetch Attendees"}
          </button>
          {fetchClicked && attendees.length === 0 && (
            <p className="text-red-500 mt-4">No attendees found</p>
          )}
        </div>

        {attendees.length > 0 && (
          <div className="bg-white shadow-lg rounded-2xl p-8 w-1/2 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Event Attendees</h2>
              <ul>
                {attendees.map((attendee) => (
                  <li key={attendee.userId} className="flex items-center space-x-3 text-lg">
                    <div
                      onClick={() => handleCircleChange(attendee.userId)}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                        selectedAttendees.includes(attendee.userId) ? "bg-blue-500" : "border-gray-300"
                      }`}
                    />
                    <span>
                      {attendee.firstName} {attendee.lastName}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {selectedAttendees.length > 0 && (
              <button
                onClick={approveAttendance}
                className="w-full mt-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Approve Attendance
              </button>
            )}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Attendance;
