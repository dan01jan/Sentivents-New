import React, { useState, useEffect } from 'react';
const apiUrl = import.meta.env.VITE_API_URL;


const ViewQuestionnaire = () => {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [acceptingResponses, setAcceptingResponses] = useState(false);

  // Fetch the selected event ID from local storage
  useEffect(() => {
    const storedEventId = localStorage.getItem('selectedEventId');
    if (storedEventId) {
      setSelectedEventId(storedEventId);
    } else {
      console.error('Selected Event ID not found in local storage');
    }
  }, []);

  // Fetch the questionnaire data for the selected event ID
  useEffect(() => {
    if (selectedEventId) {
      const fetchQuestionnaire = async () => {
        try {
          const response = await fetch(`${apiUrl}questionnaires/event/${selectedEventId}`);
          const data = await response.json();

          if (response.ok) {
            setQuestionnaire(data.questionnaire);
            setAcceptingResponses(data.questionnaire.acceptingResponses);
          } else {
            console.error('Error fetching questionnaire:', data.message);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };

      fetchQuestionnaire();
    }
  }, [selectedEventId]);

  // Function to toggle the accepting responses status
  const toggleAcceptingResponses = async () => {
    try {
      const response = await fetch(`${apiUrl}questionnaires/accepting-responses/${selectedEventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ acceptingResponses: !acceptingResponses }),
      });

      const data = await response.json();

      if (response.ok) {
        setAcceptingResponses(!acceptingResponses); // Toggle the state locally
        console.log(data.message);
      } else {
        console.error('Error updating accepting responses:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="questionnaire-container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4A90E2', marginBottom: '20px' }}>View Event Questionnaire</h1>

      {/* Display Event ID */}
      {selectedEventId && <p style={{ fontSize: '1rem', color: '#888' }}>Selected Event ID: {selectedEventId}</p>}

      {/* Display the questionnaire details */}
      {questionnaire ? (
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '10px' }}>Questionnaire for Event: {questionnaire.eventId}</h2>
          <h3 style={{ fontSize: '1.2rem', color: '#555', marginBottom: '10px' }}>Questions:</h3>
          <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
            {questionnaire.questions.map((question, index) => (
              <li key={index} style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '1rem', color: '#333' }}>{question.question}</p>
                {/* Display the associated trait */}
                <p style={{ fontSize: '0.9rem', color: '#777' }}>Trait: {question.traitId?.trait}</p>
              </li>
            ))}
          </ul>

          {/* Toggle button for accepting responses */}
          <div style={{ marginTop: '20px' }}>
            <label style={{ fontSize: '1rem', color: '#333', marginRight: '10px' }}>Accepting Responses:</label>
            <button
              onClick={toggleAcceptingResponses}
              style={{
                backgroundColor: acceptingResponses ? '#4CAF50' : '#FF6347',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '30px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                border: 'none',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#66BB6A'}
              onMouseOut={(e) => e.target.style.backgroundColor = acceptingResponses ? '#4CAF50' : '#FF6347'}
            >
              {acceptingResponses ? 'Yes' : 'No'}
            </button>
          </div>
        </div>
      ) : (
        <p>Loading questionnaire...</p>
      )}
    </div>
  );
};

export default ViewQuestionnaire;
