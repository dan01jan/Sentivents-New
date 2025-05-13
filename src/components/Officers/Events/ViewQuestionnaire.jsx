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
    <div className="p-4 max-w-screen mx-auto">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#3a1078] fade-in-left mb-6">
        View Event Questionnaire
      </h1>

      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 fade-in-left">
        <label className="text-lg sm:text-2xl text-[#3a1078] font-semibold">
          Accepting Responses:
        </label>
        <button
          onClick={toggleAcceptingResponses}
          className={`px-6 py-2 rounded-full text-white text-base sm:text-lg transition duration-300 ease-in-out ${acceptingResponses
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
            }`}
        >
          {acceptingResponses ? "Yes" : "No"}
        </button>
      </div>

      {questionnaire ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {questionnaire.questions.map((question, index) => (
            <div
              key={index}
              className="bg-[#f7f7f8] p-5 rounded-lg shadow-md text-center flex flex-col justify-between min-h-[20rem] hover:bg-[#f0f0f0] fade-in-up"
            >
              <div>
                <p className="text-base sm:text-lg font-bold text-[#3a1078] mb-2 break-words">
                  {question.question}
                </p>
                <p className="text-sm italic text-[#3a1078] mb-2 break-words">
                  {question.translated}
                </p>
                <p className="text-sm text-[#3a1078]">
                  Trait:
                  <strong className="text-red-600 ml-1">
                    {question.traitId?.trait}
                  </strong>
                </p>
              </div>

              <div className="flex justify-center flex-wrap gap-2 mt-4">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label
                    key={value}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-md shadow text-base font-bold text-gray-800 cursor-pointer hover:bg-gray-200"
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
        <p className="text-center text-gray-600 mt-8">Loading questionnaire...</p>
      )}
    </div>
  );

};

export default ViewQuestionnaire;
