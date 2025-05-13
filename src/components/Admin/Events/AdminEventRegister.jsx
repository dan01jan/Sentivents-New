import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

const AdminEventRegister = () => {
  const [eventId, setEventId] = useState("");
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  
  const navigate = useNavigate();

  // Get event ID from localStorage on component mount
  useEffect(() => {
    const storedEventId = localStorage.getItem("selectedEventId");
    if (storedEventId) {
      setEventId(storedEventId);
    } else {
      setError("No event selected.");
    }
  }, []);

  // Once eventId is set, fetch attendees and event details
  useEffect(() => {
    if (eventId) {
      fetchAttendees();
    }
  }, [eventId]);

  const fetchAttendees = async () => {
    setError("");
    setLoading(true);
    try {
      const attendeesResponse = await axios.get(
        `${apiUrl}attendance/getUsersByEvent/${eventId}`
      );
      const eventResponse = await axios.get(`${apiUrl}events/${eventId}`);

      setAttendees(attendeesResponse.data || []);
      setEventName(eventResponse.data.name);
    } catch (err) {
      setError("Error fetching attendees");
    } finally {
      setLoading(false);
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
      setError("Please select attendees to approve.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const attendeesToUpdate = attendees
        .filter((att) => selectedAttendees.includes(att.userId))
        .map((att) => ({ userId: att.userId, hasRegistered: true }));

      await axios.put(
        `${apiUrl}attendance/updateUsersAttendance/${eventId}`,
        { attendees: attendeesToUpdate }
      );

      toast.success("Approved User Registration", {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Update the local state for attendees
      setAttendees((prev) =>
        prev.map((att) =>
          selectedAttendees.includes(att.userId)
            ? { ...att, hasRegistered: true }
            : att
        )
      );
      setSelectedAttendees([]);
      setTimeout(() => navigate("/admin/eventlist"), 3000);
    } catch (err) {
      setError("Error approving attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <h1 className="text-[6vh] font-bold mb-4 font-semibold text-[#3a1078]">
        Registration Approval
      </h1>
      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading...</p>}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="font-medium text-[4vh] text-[#3a1078] md:text-[4vh] sm:text-[4vh]">
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
                        <span className="text-green-600 font-bold">
                          ✔ Approved
                        </span>
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
      <ToastContainer />
    </div>
  );
};

export default AdminEventRegister;
