import React, { useState, useEffect } from "react";
import axios from "axios";
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

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiUrl}events/adminEvents`);
        if (response.data && response.data.length > 0) {
          setEvents(response.data);
        } else {
          setError("No events found");
        }
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

    try {
      const response = await axios.get(`${apiUrl}attendance/getUsersByEvent/${eventId}`);
      const eventResponse = await axios.get(`${apiUrl}events/${eventId}`);

      setAttendees(response.data || []);
      setEventName(eventResponse.data.name);

      const eventEndDate = new Date(eventResponse.data.dateEnd);
      const currentDate = new Date();
      const isDone = currentDate > eventEndDate;

      setEventStatus(isDone ? "done" : "ongoing");
    } catch (err) {
      setError("Error fetching attendees");
    } finally {
      setLoading(false);
    }
  };

  const handleCircleChange = (userId) => {
    setSelectedAttendees((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
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
        .filter((attendee) => selectedAttendees.includes(attendee.userId))
        .map((attendee) => ({
          userId: attendee.userId,
          hasAttended: true,
        }));

      await axios.put(`${apiUrl}attendance/updateUsersAttendance/${eventId}`, {
        attendees: attendeesToUpdate,
      });

      alert("Attendance approved successfully!");
      fetchAttendees();
    } catch (err) {
      setError("Error approving attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-4xl w-full">
        <h1 className="text-4xl font-extrabold text-gradient mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          Attendance Approval
        </h1>

        <div className="space-y-6">
          <label className="block text-lg font-medium text-gray-700">Select Event</label>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full p-4 border-2 rounded-lg shadow-md focus:ring focus:ring-blue-200 transition duration-300"
          >
            <option value="">Select an event</option>
            {events.length > 0 ? (
              events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))
            ) : (
              <option disabled>No events available</option>
            )}
          </select>

          {eventId && events.length > 0 && (
            <p className="mt-2 text-lg font-medium text-gray-600">
              Selected Event: {events.find((event) => event._id === eventId)?.name}
            </p>
          )}
        </div>

        <button
          onClick={fetchAttendees}
          disabled={loading}
          className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Fetch Attendees"}
        </button>

        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

        {attendees.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-100 to-pink-100 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Event Attendees</h2>

            <div className="grid grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Registered</h3>
                <ul>
                  {attendees.map((attendee) => (
                    <li key={attendee.userId} className="text-lg flex items-center">
                      {eventStatus === "ongoing" && !attendee.hasAttended && (
                        <div
                          onClick={() => handleCircleChange(attendee.userId)}
                          className={`w-6 h-6 rounded-full border-2 mr-2 cursor-pointer ${
                            selectedAttendees.includes(attendee.userId)
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300"
                          }`}
                        />
                      )}
                      {eventStatus === "ongoing" && attendee.hasAttended && (
                        <div
                          className="w-6 h-6 rounded-full border-2 mr-2 cursor-not-allowed bg-gray-200"
                        />
                      )}
                      {eventStatus === "done" && attendee.hasAttended && (
                        <div
                          className="w-6 h-6 rounded-full border-2 mr-2 cursor-not-allowed bg-gray-200"
                        />
                      )}
                      <span className="ml-4">{attendee.firstName} {attendee.lastName}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Attended</h3>
                <ul>
                  {attendees
                    .filter((attendee) => attendee.hasAttended)
                    .map((attendee) => (
                      <li key={attendee.userId} className="text-lg">
                        {attendee.firstName} {attendee.lastName}
                      </li>
                    ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Absent</h3>
                {eventStatus === "done" ? (
                  <ul>
                    {attendees
                      .filter((attendee) => !attendee.hasAttended)
                      .map((attendee) => (
                        <li key={attendee.userId} className="text-lg">
                          {attendee.firstName} {attendee.lastName}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-lg text-gray-500">Event not completed yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {attendees.length > 0 && selectedAttendees.length > 0 && (
          <button
            onClick={approveAttendance}
            className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl shadow-lg hover:bg-gradient-to-r hover:from-green-600 hover:to-teal-600 transition"
          >
            Approve Attendance
          </button>
        )}
      </div>
    </div>
  );
};

export default Attendance;
