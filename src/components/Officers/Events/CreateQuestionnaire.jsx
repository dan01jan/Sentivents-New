import React, { useState, useEffect } from "react";
import { FaArrowAltCircleDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

const CreateQuestionnaire = () => {
  const [questions, setQuestions] = useState([]);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [selectedEventId, setSelectedEventId] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [ratings, setRatings] = useState({});
  const [expandedTraits, setExpandedTraits] = useState({});

  useEffect(() => {
    const storedEventId = localStorage.getItem("selectedEventId");
    if (storedEventId) {
      setSelectedEventId(storedEventId);
    } else {
      console.error("Selected Event ID not found in local storage");
    }
  }, []);

  useEffect(() => {
    const fetchQuestionsByEvent = async () => {
      if (!selectedEventId) return;

      setLoading(true);
      try {
        console.log("Selected Event ID:", selectedEventId); // Log the event ID
        const response = await fetch(
          `${apiUrl}questions/event-type/${selectedEventId}`
        );
        const data = await response.json();

        if (response.ok) {
          // Group questions by traitId
          const grouped = data.reduce((acc, question) => {
            const trait = question.traitId?.trait || "Unknown Trait";
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
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsByEvent();
  }, [selectedEventId]);

  const handleCreateQuestionnaire = async () => {
    if (!selectedEventId) {
      console.error("Event ID is missing");
      return;
    }

    const selectedQuestionIds = Object.keys(selectedQuestions).filter(
      (id) => selectedQuestions[id]
    );

    if (selectedQuestionIds.length === 0) {
      alert("Please select at least one question.");
      return;
    }

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(`${apiUrl}questionnaires/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        console.log("Questionnaire created successfully:", result);
        navigate("/dashboard/events");
      } else {
        console.error("Error creating questionnaire:", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
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
      navigate("/dashboard/events");
    } catch (error) {
      console.error("Error randomizing questionnaire:", error);
      alert(error.message);
    }
  };

  const toggleTrait = (trait) => {
    setExpandedTraits((prev) => ({
      ...prev,
      [trait]: !prev[trait],
    }));
  };

  return (
    <div className="p-4 max-w-full mx-auto ">
      <h1 className="text-[8vh] font-semibold text-[#3a1078] font-tungsten">
        Create Event Questionnaire
      </h1>
      <h1 className="font-tungsten text-[4vh] md:text-[5vh] text-[#3a1078] flex items-center gap-4 mt-8">
        <span className="flex-1 h-1 bg-[#3a1078]"></span>
        Choose your questions wisely or Randomize it
        <span className="flex-1 h-1 bg-[#3a1078]"></span>
      </h1>

      {loading ? (
        <p>Loading questions...</p>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedQuestions).map((trait) => (
            <div key={trait} className="mb-8 border-b pb-4">
              <button
                onClick={() => toggleTrait(trait)}
                className="w-full flex justify-between items-center text-[4vh] md:text-[5vh] font-bold text-[#3a1078] font-tungsten mb-4 focus:outline-none"
              >
                {trait}
                <FaArrowAltCircleDown
                  size={35}
                  className={`transform transition-transform duration-300 mr-5 ${
                    expandedTraits[trait] ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {expandedTraits[trait] && (
                <ul className="space-y-4 ">
                  {groupedQuestions[trait].map((question) => (
                    <li key={question._id} className="flex flex-col">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="h-5 w-5"
                          checked={selectedQuestions[question._id] || false}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            const selectedCount = Object.keys(
                              selectedQuestions
                            ).filter(
                              (qId) =>
                                selectedQuestions[qId] &&
                                groupedQuestions[trait].some(
                                  (q) => q._id === qId
                                )
                            ).length;

                            if (isChecked && selectedCount >= 5) {
                              alert(
                                "You can select up to 5 questions per trait."
                              );
                              return;
                            }
                            setSelectedQuestions((prev) => ({
                              ...prev,
                              [question._id]: isChecked,
                            }));
                          }}
                        />
                        <p className="text-gray-700">{question.question}</p>
                        <p className="text-gray-700 italic">
                          ({question.translated})
                        </p>
                      </div>
                      <div className="flex space-x-2 mt-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div
                            key={value}
                            className={`w-10 h-10 flex justify-center items-center border rounded-full cursor-pointer ${
                              ratings[question._id] === value
                                ? "bg-blue-500 text-white"
                                : "bg-gray-300 text-gray-700"
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
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center flex justify-center space-x-4">
        <button
          className="bg-[#3a1078] text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={handleCreateQuestionnaire}
        >
          Create Questionnaire
        </button>

        <button
          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onClick={handleRandomizeQuestions}
        >
          Random
        </button>
      </div>
    </div>
  );
};

export default CreateQuestionnaire;
