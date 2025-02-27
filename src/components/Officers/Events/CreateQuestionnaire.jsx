import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const handleRandomizeQuestions = async () => {
    if (!selectedEventId) {
      alert("Please select an event first.");
      return;
    }
  
    try {
      const response = await fetch(`${apiUrl}questionnaires/randomize-create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId: selectedEventId }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to randomize questions");
      }
  
      // Update selectedQuestions state with the randomized questions from the backend
      const randomizedSelection = {};
      data.questionnaire.questions.forEach((qId) => {
        randomizedSelection[qId] = true;
      });
  
      setSelectedQuestions(randomizedSelection);
      alert("Randomized questionnaire created successfully!");
      navigate('/dashboard/events');
    } catch (error) {
      console.error("Error randomizing questionnaire:", error);
      alert(error.message);
    }
  };
  

  return (
    <div className="container mx-auto px-4 py-6">
  <h1 className="text-3xl font-semibold mb-4">Create Event Questionnaire</h1>
  {selectedEventId && <p className="text-lg mb-4">Selected Event ID: {selectedEventId}</p>}

  {loading ? (
    <p>Loading questions...</p>
  ) : (
    <div className="space-y-6">
      {Object.keys(groupedQuestions).map((trait) => (
        <div key={trait} className="bg-gray-100 p-4 rounded-md shadow-md">
          <h2 className="text-xl font-medium text-gray-800">{trait}</h2>
          <ul className="space-y-4">
            {groupedQuestions[trait].map((question) => (
              <li key={question._id} className="flex flex-col">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="h-5 w-5"
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
                  <p className="text-gray-700">{question.question}</p>
                </div>
                <div className="flex space-x-2 mt-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div
                      key={value}
                      className={`w-10 h-10 flex justify-center items-center border rounded-full cursor-pointer ${
                        ratings[question._id] === value ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
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

    <div className="mt-6 text-center flex justify-center space-x-4">
      <button
        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={handleCreateQuestionnaire}
      >
        Create Questionnaire
      </button>

      <button
        className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
        onClick={handleRandomizeQuestions}
      >
        Random
      </button>
    </div>
  </div>

  );
};

export default CreateQuestionnaire;
