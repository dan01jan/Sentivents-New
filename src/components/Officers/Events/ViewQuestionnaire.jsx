import React, { useState, useEffect } from "react";
const apiUrl = import.meta.env.VITE_API_URL;

const ViewQuestionnaire = () => {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [acceptingResponses, setAcceptingResponses] = useState(false);

  useEffect(() => {
    const storedEventId = localStorage.getItem("selectedEventId");
    if (storedEventId) {
      setSelectedEventId(storedEventId);
    } else {
      console.error("Selected Event ID not found in local storage");
    }
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      const fetchQuestionnaire = async () => {
        try {
          const response = await fetch(
            `${apiUrl}questionnaires/event/${selectedEventId}`
          );
          const data = await response.json();

          if (response.ok) {
            setQuestionnaire(data.questionnaire);
            setAcceptingResponses(data.questionnaire.acceptingResponses);
          } else {
            console.error("Error fetching questionnaire:", data.message);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      };

      fetchQuestionnaire();
    }
  }, [selectedEventId]);

  const toggleAcceptingResponses = async () => {
    try {
      const response = await fetch(
        `${apiUrl}questionnaires/accepting-responses/${selectedEventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ acceptingResponses: !acceptingResponses }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAcceptingResponses(!acceptingResponses);
        console.log(data.message);
      } else {
        console.error("Error updating accepting responses:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-4 max-w-full mx-auto ">
      <h1 className="text-[8vh] font-semibold text-[#3a1078] font-tungsten fade-in-left">
        View Event Questionnaire
      </h1>
      <div className="mb-8 flex ">
        <label className="text-[4vh] text-[#3a1078] font-tungsten fade-in-left">
          Accepting Responses:
        </label>
        <button
          onClick={toggleAcceptingResponses}
          className={`px-6 rounded-full text-white text-lg transition duration-300 ease-in-out fade-in-left ${
            acceptingResponses
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {acceptingResponses ? "Yes" : "No"}
        </button>
      </div>

      {questionnaire ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {questionnaire.questions.map((question, index) => (
            <div
              key={index}
              className="bg-[#f7f7f8] p-6 rounded-lg shadow-md text-center flex flex-col justify-between h-80 hover:bg-[#f0f0f0] fade-in-up"
            >
              <div>
                <p className="text-lg font-bold text-[#3a1078] mb-2">
                  {question.question}
                </p>
                <p className="text-sm italic text-[#3a107 mb-2">
                  {question.translated}
                </p>
                <p className="text-sm text-[#3a107">
                  Trait: <strong className="text-red-600"> {question.traitId?.trait}</strong>
                </p>
              </div>

              <div className="flex justify-center gap-2 mt-4">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label
                    key={value}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-md shadow text-lg font-bold text-gray-800 cursor-pointer hover:bg-gray-200"
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={value}
                      className="hidden"
                    />
                    {value}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">Loading questionnaire...</p>
      )}
    </div>
  );
};

export default ViewQuestionnaire;
