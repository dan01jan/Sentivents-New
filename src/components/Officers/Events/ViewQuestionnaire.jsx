import React, { useState, useEffect } from 'react';
const apiUrl = import.meta.env.VITE_API_URL;

const ViewQuestionnaire = () => {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [acceptingResponses, setAcceptingResponses] = useState(false);

  useEffect(() => {
    const storedEventId = localStorage.getItem('selectedEventId');
    if (storedEventId) {
      setSelectedEventId(storedEventId);
    } else {
      console.error('Selected Event ID not found in local storage');
    }
  }, []);

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
        setAcceptingResponses(!acceptingResponses);
        console.log(data.message);
      } else {
        console.error('Error updating accepting responses:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="questionnaire-container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', width: '100%', maxWidth: '1200px', margin: 'auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4A90E2', marginBottom: '20px', textAlign: 'center' }}>View Event Questionnaire</h1>
      <div style={{ marginTop: '20px', textAlign: 'center', marginBottom: '20px'}}>
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
      {questionnaire ? (
        <div>
          {/* <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '10px', textAlign: 'center' }}>Questionnaire for Event: {questionnaire.eventId}</h2> */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)', // Ensure 5 columns per row
            gap: '20px',
            justifyContent: 'center',
            width: '100%', // Make sure it spans the whole page
          }}>
            {questionnaire.questions.map((question, index) => (
              <div key={index} style={{ 
                backgroundColor: '#f9f9f9', 
                padding: '20px', 
                borderRadius: '8px', 
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', 
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '1rem', color: '#333', fontWeight: 'bold' }}>{question.question}</p>
                <p style={{ fontSize: '1rem', color: '#555', fontStyle: 'italic' }}>{question.translated}</p>
                <p style={{ fontSize: '0.9rem', color: '#777' }}>Trait: {question.traitId?.trait}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label key={value} style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: '#333',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}>
                      <input type="radio" name={`question-${index}`} value={value} style={{ display: 'none' }} />
                      {value}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
        </div>
      ) : (
        <p style={{ textAlign: 'center' }}>Loading questionnaire...</p>
      )}
    </div>
  );
};

export default ViewQuestionnaire;
