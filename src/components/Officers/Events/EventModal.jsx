import React, { useState, useEffect } from "react";
import Modal from "react-modal"; // Import Modal
import axios from "axios"; // Import axios for API requests
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const apiUrl = import.meta.env.VITE_API_URL;

// Set up modal accessibility
Modal.setAppElement("#root");

const EventModal = ({ selectedEvent, modalIsOpen, handleModalClose }) => {
  const [hasQuestionnaire, setHasQuestionnaire] = useState(null);
  const navigate = useNavigate(); // Get the navigate function
  const [slotInfo, setSlotInfo] = useState(null);

  useEffect(() => {
    if (selectedEvent) {
      // Fetch if the event has a questionnaire
      const checkQuestionnaire = async () => {
        try {
          const response = await axios.get(
            `${apiUrl}questionnaires/check-questionnaire/${selectedEvent._id}`
          );
          setHasQuestionnaire(response.data.hasQuestionnaire);
        } catch (error) {
          console.error("Error checking for questionnaire:", error);
        }
      };
      const fetchSlotInfo = async () => {
            try {
              const response = await axios.get(
                `${apiUrl}attendance/slots/remaining?eventId=${selectedEvent._id}`
              );
              setSlotInfo(response.data);
            } catch (error) {
              console.error("Error fetching slot info:", error);
              setSlotInfo(null);
            }
          };

          checkQuestionnaire();
          fetchSlotInfo();
    }
  }, [selectedEvent, apiUrl]);

  if (!selectedEvent) return null; // Prevent rendering when no event is selected

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={handleModalClose}
      className="fixed inset-0 flex items-center justify-center z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full relative">
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-3xl text-gray-600 hover:text-gray-900"
        >
          &times;
        </button>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedEvent.name}
          </h2>
          <div className="text-gray-700 text-lg space-y-2">
            <p>
              <strong>Description:</strong> {selectedEvent.description}
            </p>
            <p>
              <strong>Location:</strong> {selectedEvent.location}
            </p>
            <p>
              <strong>Type:</strong>{" "}
              {selectedEvent.type?.eventType || "Unknown"}
            </p>
            <p className="text-gray-700 text-lg space-y-2">
              <span className="font-semibold">Start:</span>{" "}
              {selectedEvent.dateStart
                ? `${new Date(selectedEvent.dateStart).toLocaleDateString()} ${new Date(selectedEvent.dateStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : "No Start Date"}
            </p>

            <p className="text-gray-700 text-lg space-y-2">
              <span className="font-semibold">End:</span>{" "}
              {selectedEvent.dateEnd
                ? `${new Date(selectedEvent.dateEnd).toLocaleDateString()} ${new Date(selectedEvent.dateEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : "No End Date"}
            </p>
               <p className="text-gray-700 text-lg space-y-2">
                <span className="font-semibold">Capacity:</span> {slotInfo?.capacity ?? "Loading..."}{" | "}
                <span className="font-semibold">Slots Left:</span> {slotInfo?.remainingSlots ?? "Loading..."}
              </p>

              <p className="text-gray-700 text-lg space-y-2">
                <span className="font-semibold">Registered:</span> {slotInfo?.totalRegistered ?? "Loading..."}{" "}
                (
                <span className="font-semibold">Attended:</span> {slotInfo?.totalAttended ?? "Loading..."}{" | "}
                
                {new Date(selectedEvent?.dateEnd) > new Date() ? (
                  <span className="font-semibold">
                    Pending Attendance: {slotInfo?.totalPending ?? "Loading..."}
                  </span>
                ) : (
                  <span className="font-semibold">
                    Absent: {slotInfo?.totalAbsent ?? "Loading..."}
                  </span>
                )}
                )
              </p>
          </div>

          {hasQuestionnaire === null ? (
            <p className="text-gray-500">Loading questionnaire status...</p>
          ) : hasQuestionnaire ? (
            <p className="text-green-500 font-bold">
              This event has a questionnaire.
            </p>
          ) : (
            <p className="text-red-500 font-bold">
              This event has no questionnaire yet.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <button
              onClick={() => navigate("/dashboard/viewreports")}
              className="bg-teal-500 text-white px-5 py-2 rounded-full transition duration-300 hover:bg-teal-600 text-lg"
            >
              View Reports
            </button>
            <button
              onClick={() => navigate("/dashboard/attendancechart")}
              className="bg-yellow-500 text-white px-5 py-2 rounded-full transition duration-300 hover:bg-yellow-600 text-lg"
            >
              View Attendance
            </button>
            {hasQuestionnaire ? (
              <button
                onClick={() => navigate("/dashboard/viewquestions")}
                className="bg-pink-500 text-white px-5 py-2 rounded-full transition duration-300 hover:bg-pink-600 text-lg"
              >
                View Questionnaire
              </button>
            ) : (
              <button
                onClick={() => navigate("/dashboard/createquestionnaire")}
                className="bg-pink-500 text-white px-5 py-2 rounded-full transition duration-300 hover:bg-pink-600 text-lg"
              >
                Create Questionnaire
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EventModal;
