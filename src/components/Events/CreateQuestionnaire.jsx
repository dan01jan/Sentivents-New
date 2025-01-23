import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for navigation
import './CreateQuestionnaire.css';  // Import the CSS file for styling
const apiUrl = import.meta.env.VITE_API_URL;

const CreateQuestionnaire = () => {
  const [questions, setQuestions] = useState([]);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [selectedEventId, setSelectedEventId] = useState(null);
  const navigate = useNavigate();  // Hook for navigation

  // Fetch the selectedEventId from local storage
  useEffect(() => {
    const storedEventId = localStorage.getItem('selectedEventId');
    if (storedEventId) {
      setSelectedEventId(storedEventId);
    } else {
      console.error('Selected Event ID not found in local storage');
    }
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/v1/questions/questions-with-traits');
        const data = await response.json();
        setQuestions(data);

        // Group questions by their trait
        const grouped = data.reduce((acc, question) => {
          const trait = question.traitId?.trait;
          if (!acc[trait]) {
            acc[trait] = [];
          }
          acc[trait].push(question);
          return acc;
        }, {});
        setGroupedQuestions(grouped);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  // Function to handle form submission and create questionnaire
  const handleCreateQuestionnaire = async () => {
    if (!selectedEventId || questions.length === 0) {
      console.error('Selected Event ID or questions missing');
      return;
    }

    const token = localStorage.getItem('authToken');  // Get the token from local storage

    try {
      const response = await fetch('http://localhost:4000/api/v1/questionnaires/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Include the token here
        },
        body: JSON.stringify({ eventId: selectedEventId, questions }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Questionnaire created successfully:', result);
        // Navigate to /dashboard/adminevents after successful creation
        navigate('/dashboard/events');
      } else {
        console.error('Error creating questionnaire:', result.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="questionnaire-container">
      <h1>Create Event Questionnaire</h1>

      {/* Display Selected Event ID if available */}
      {selectedEventId && <p>Selected Event ID: {selectedEventId}</p>}

      <div className="traits-container">
        {Object.keys(groupedQuestions).map((trait, index) => (
          <div key={index} className="trait-section">
            <h2 className="trait-title">{trait}</h2>
            <ul className="question-list">
              {groupedQuestions[trait].map((question, index) => (
                <li key={index} className="question-item">
                  <p className="question-text">{question.question}</p>
                  <div className="scale-container">
                    <label className="scale-label">Rate from 1 (Very Low) to 5 (Very High)</label>
                    <div className="likert-scale">
                      {[1, 2, 3, 4, 5].map((scale) => (
                        <button key={scale} className="scale-btn">
                          {scale}
                        </button>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="create-button-container">
        <button className="create-button" onClick={handleCreateQuestionnaire}>Create Questionnaire</button>
      </div>
    </div>
  );
};

export default CreateQuestionnaire;
