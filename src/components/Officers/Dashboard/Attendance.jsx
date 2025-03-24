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
  const [fetchClicked, setFetchClicked] = useState(false);
  const [eventType, setEventType] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userData = JSON.parse(localStorage.getItem("userData"));
        // Try to get organization name from local storage (for officer users)
        const officerOrgName = localStorage.getItem("officerOrgName");
        const organizationName = officerOrgName || (userData && userData.organizationName);
        
        if (!organizationName) {
          throw new Error("Organization name not found in user data.");
        }
  
        // Append eventType as query param if provided
        const typeQuery = eventType ? `&type=${eventType}` : "";
        const response = await axios.get(
          `${apiUrl}events/adminevents?organization=${organizationName}${typeQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEvents(response.data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      }
    };
    fetchEvents();
  }, [eventType]);

  const fetchAttendees = async () => {
    if (!eventId) {
      setError("Please select an event");
      return;
    }
    setError("");
    setLoading(true);
    setFetchClicked(false);

    try {
      const response = await axios.get(`${apiUrl}attendance/getUsersByEvent/${eventId}`);
      const eventResponse = await axios.get(`${apiUrl}events/${eventId}`);

      setAttendees(response.data || []);
      setEventName(eventResponse.data.name);
    } catch (err) {
      setError("Error fetching attendees");
    } finally {
      setLoading(false);
      setFetchClicked(true);
    }
  };

  const handleCheckboxChange = (userId) => {
    setSelectedAttendees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
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
        .map((att) => ({ userId: att.userId, hasRegistered: true }));

      await axios.put(`${apiUrl}attendance/updateUsersAttendance/${eventId}`, {
        attendees: attendeesToUpdate,
      });

      toast.success("Approved User Registration", {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setAttendees((prev) =>
        prev.map((att) =>
          selectedAttendees.includes(att.userId)
            ? { ...att, hasRegistered: true }
            : att
        )
      );

      setSelectedAttendees([]);
      setTimeout(() => navigate("/dashboard/attendance"), 3000);
    } catch (err) {
      setError("Error approving attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <h1 className="text-[8vh] font-bold mb-4 font-tungsten text-[#3a1078]">
        Registration Approval
      </h1>
      <div className="flex gap-6">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-1/3">
          <h2 className="font-tungsten text-[4vh] text-[#3a1078] md:text-[6vh] sm:text-[4vh]">
            Select Event
          </h2>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setAttendees([]);
              setFetchClicked(false);
            }}
          >
            <option value="">Select an Event</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.name}
              </option>
            ))}
          </select>
          <button
            onClick={fetchAttendees}
            disabled={loading || !eventId}
            className="w-full py-2 bg-[#3a1078] text-white rounded-lg disabled:opacity-50 mt-5"
          >
            {loading ? "Loading..." : "Fetch Attendees"}
          </button>
          {fetchClicked && !loading && attendees.length === 0 && (
            <p className="text-red-500 mt-4">No attendees found</p>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 w-2/3">
          <h2 className="font-tungsten text-[4vh] text-[#3a1078] md:text-[6vh] sm:text-[4vh]">
            {eventName ? `${eventName} - Attendees` : "Event Attendees"}
          </h2>
          {attendees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border border-gray-300">Select</th>
                    <th className="p-2 border border-gray-300">Name</th>
                    <th className="p-2 border border-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee) => (
                    <tr key={attendee.userId} className="text-center">
                      <td className="p-2 border border-gray-300">
                        <input
                          type="checkbox"
                          disabled={attendee.hasRegistered}
                          checked={selectedAttendees.includes(attendee.userId)}
                          onChange={() => handleCheckboxChange(attendee.userId)}
                        />
                      </td>
                      <td className="p-2 border border-gray-300">
                        {attendee.firstName} {attendee.lastName}
                      </td>
                      <td className="p-2 border border-gray-300">
                        {attendee.hasRegistered ? (
                          <span className="text-green-600 font-bold">✔ Approved</span>
                        ) : (
                          "Pending"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No attendees to display</p>
          )}

          {selectedAttendees.length > 0 && (
            <button
              onClick={approveAttendance}
              className="w-full mt-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Approve Register
            </button>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Attendance;
