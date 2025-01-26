import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateQuestionnaire.css';

const apiUrl = import.meta.env.VITE_API_URL;

const CreateQuestionnaire = () => {
  const [questions, setQuestions] = useState([]);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [selectedEventId, setSelectedEventId] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    const storedEventId = localStorage.getItem('selectedEventId');
    if (storedEventId) {
      setSelectedEventId(storedEventId);
    } else {
      console.error('Selected Event ID not found in local storage');
    }
  }, []);

  useEffect(() => {
    const fetchQuestionsByEvent = async () => {
      if (!selectedEventId) return;

      setLoading(true);
      try {
        console.log('Selected Event ID:', selectedEventId); // Log the event ID
        const response = await fetch(`${apiUrl}questions/event-type/${selectedEventId}`);
        const data = await response.json();

        if (response.ok) {
          // Group questions by traitId
          const grouped = data.reduce((acc, question) => {
            const trait = question.traitId?.trait || 'Unknown Trait';
            if (!acc[trait]) {
              acc[trait] = [];
            }
            acc[trait].push(question);
            return acc;
          }, {});

          setQuestions(data);
          setGroupedQuestions(grouped);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsByEvent();
  }, [selectedEventId]);

  const handleCreateQuestionnaire = async () => {
    if (!selectedEventId) {
      console.error('Event ID is missing');
      return;
    }

    const selectedQuestionIds = Object.keys(selectedQuestions).filter(
      (id) => selectedQuestions[id]
    );

    if (selectedQuestionIds.length === 0) {
      alert('Please select at least one question.');
      return;
    }

    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`${apiUrl}questionnaires/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: selectedEventId,
          selectedQuestions: selectedQuestionIds,
          ratings,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Questionnaire created successfully:', result);
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
      {selectedEventId && <p>Selected Event ID: {selectedEventId}</p>}

      {loading ? (
        <p>Loading questions...</p>
      ) : (
        <div className="traits-container">
          {Object.keys(groupedQuestions).map((trait) => (
            <div key={trait} className="trait-section">
              <h2 className="trait-title">{trait}</h2>
              <ul className="question-list">
                {groupedQuestions[trait].map((question) => (
                  <li key={question._id} className="question-item">
                    <div className="question-wrapper">
                      <input
                        type="checkbox"
                        className="small-checkbox"
                        checked={selectedQuestions[question._id] || false}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const selectedCount = Object.keys(selectedQuestions).filter(
                            (qId) => selectedQuestions[qId] && groupedQuestions[trait].some((q) => q._id === qId)
                          ).length;

                          if (isChecked && selectedCount >= 5) {
                            alert('You can select up to 5 questions per trait.');
                            return;
                          }
                          setSelectedQuestions((prev) => ({
                            ...prev,
                            [question._id]: isChecked,
                          }));
                        }}
                      />
                      <p>{question.question}</p>
                    </div>
                    <div className="likert-scale-boxes">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <div
                          key={value}
                          className={`likert-box ${
                            ratings[question._id] === value ? 'selected' : ''
                          }`}
                          onClick={() =>
                            setRatings((prev) => ({
                              ...prev,
                              [question._id]: value,
                            }))
                          }
                        >
                          {value}
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="create-button-container">
        <button className="create-button" onClick={handleCreateQuestionnaire}>
          Create Questionnaire
        </button>
      </div>
    </div>
  );
};

export default CreateQuestionnaire;
