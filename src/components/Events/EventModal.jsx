import React, { useState, useEffect } from 'react';
import Modal from 'react-modal'; // Import Modal
import axios from 'axios'; // Import axios for API requests
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
const apiUrl = import.meta.env.VITE_API_URL;

// Set up modal accessibility
Modal.setAppElement('#root');

const EventModal = ({ selectedEvent, modalIsOpen, handleModalClose, handleViewReports, handleViewAttendance, handleCreateQuestionnaire }) => {
  const [hasQuestionnaire, setHasQuestionnaire] = useState(null);
  const navigate = useNavigate(); // Get the navigate function

  useEffect(() => {
    if (selectedEvent) {
      // Fetch if the event has a questionnaire
      const checkQuestionnaire = async () => {
        try {
          const response = await axios.get(`${apiUrl}questionnaires/check-questionnaire/${selectedEvent._id}`);
          setHasQuestionnaire(response.data.hasQuestionnaire);
        } catch (error) {
          console.error('Error checking for questionnaire:', error);
        }
      };

      checkQuestionnaire();
    }
  }, [selectedEvent]);

  if (!selectedEvent) return null; // Prevent rendering when no event is selected

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={handleModalClose}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">{selectedEvent.name}</h2>
        <div className="text-gray-700 text-sm mb-2">
          <p><strong>Description:</strong> {selectedEvent.description}</p>
          <p><strong>Location:</strong> {selectedEvent.location}</p>
          <p><strong>Type:</strong> {selectedEvent.type && selectedEvent.type.eventType ? selectedEvent.type.eventType : 'Unknown'}</p>
          <p><strong>Date:</strong> {new Date(selectedEvent.dateStart).toLocaleDateString()}</p>
        </div>

        {/* Indication if the event has a questionnaire */}
        {hasQuestionnaire === null ? (
          <p>Loading questionnaire status...</p>
        ) : hasQuestionnaire ? (
          <p className="text-green-500 font-bold mb-4">This event has a questionnaire.</p>
        ) : (
          <p className="text-red-500 font-bold mb-4">This event has no questionnaire yet.</p>
        )}

        {/* Display appropriate buttons */}
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => navigate('/dashboard/viewreports')}
            className="bg-teal-500 text-white px-3 py-1 rounded-full transition duration-300 hover:bg-teal-600 text-sm"
          >
            View Reports
          </button>
          <button
           onClick={() => navigate('/dashboard/attendancechart')}
            className="bg-yellow-500 text-white px-3 py-1 rounded-full transition duration-300 hover:bg-yellow-600 text-sm"
          >
            View Attendance
          </button>
          {hasQuestionnaire ? (
            <button
              onClick={() => navigate('/dashboard/viewquestions')}
              className="bg-pink-500 text-white px-3 py-1 rounded-full transition duration-300 hover:bg-pink-600 text-sm"
            >
              View Questionnaire
            </button>
          ) : (
            <button
            onClick={() => navigate('/dashboard/createquestionnaire')}
              className="bg-pink-500 text-white px-3 py-1 rounded-full transition duration-300 hover:bg-pink-600 text-sm"
            >
              Create Questionnaire
            </button>
          )}
        </div>

        <button
          onClick={handleModalClose}
          className="mt-4 bg-teal-500 text-white px-4 py-2 rounded-full transition duration-300 hover:bg-teal-600"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default EventModal;
