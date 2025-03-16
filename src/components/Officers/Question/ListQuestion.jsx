import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowDown, FaArrowRight, FaArrowAltCircleDown } from "react-icons/fa";

const apiUrl = import.meta.env.VITE_API_URL;

const ListQuestion = () => {
  const [traits, setTraits] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedTrait, setSelectedTrait] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [question, setQuestion] = useState("");
  const [translated, setTranslated] = useState("");
  const [tempQuestions, setTempQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleTypes, setVisibleTypes] = useState({});
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [traitsResponse, typesResponse, questionsResponse] = await Promise.all([
          axios.get(`${apiUrl}traits/`),
          axios.get(`${apiUrl}types/`),
          axios.get(`${apiUrl}questions/`),
        ]);

        setTraits(traitsResponse.data);
        setTypes(typesResponse.data);
        setQuestions(questionsResponse.data);
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleAddQuestion = () => {
    if (!question || !translated || !selectedTrait || !selectedType) {
      alert("Please enter a question, translated text, select a trait, and select a type.");
      return;
    }

    const newQuestion = {
      question,
      translated,
      traitId: selectedTrait,
      typeId: selectedType,
    };

    setTempQuestions((prev) => [...prev, newQuestion]);
    setQuestion("");
    setTranslated("");
    setSelectedTrait("");
    setSelectedType("");
  };

  const handleCreateQuestions = async () => {
    if (tempQuestions.length === 0) {
      alert("No questions to create. Add at least one question.");
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}questions/bulk-create-questions`, {
        questions: tempQuestions,
      });

      setQuestions((prev) => [...prev, ...response.data]);
      setTempQuestions([]);
      toast.success("Questions created successfully!");
      setTimeout(() => {
        window.location.href = "/dashboard/questions";
      }, 3000);
    } catch (error) {
      console.error("Error creating questions:", error.message);
      toast.error("Error creating questions");
    }
  };

  const handleDeleteQuestion = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this question?");
    if (!confirmed) return;
    try {
      await axios.delete(`${apiUrl}questions/${id}`);
      setQuestions((prev) => prev.filter((question) => question._id !== id));
      toast.success("Question deleted successfully!");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const handleEditQuestion = (questionObj) => {
    setEditingQuestion(questionObj);
    setQuestion(questionObj.question);
    setTranslated(questionObj.translated);
    setSelectedTrait(questionObj.traitId);
    setSelectedType(questionObj.typeId);
    setIsModalOpen(true);
  };

  const handleUpdateQuestion = async () => {
    if (!question || !translated || !selectedTrait || !selectedType) {
      alert("Please enter a question, translated text, select a trait, and select a type.");
      return;
    }
    try {
      const updatedQuestion = {
        ...editingQuestion,
        question,
        translated,
        traitId: selectedTrait,
        typeId: selectedType,
      };

      const response = await axios.put(
        `${apiUrl}questions/${editingQuestion._id}`,
        updatedQuestion
      );

      setQuestions((prev) =>
        prev.map((q) => (q._id === editingQuestion._id ? response.data : q))
      );

      setEditingQuestion(null);
      setQuestion("");
      setTranslated("");
      setSelectedTrait("");
      setSelectedType("");
      setIsModalOpen(false);
      toast.success("Question updated successfully!");
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    }
  };

  const groupQuestionsByTypeAndTrait = () => {
    return questions.reduce((acc, question) => {
      const typeName =
        question.typeId?.eventType ||
        types.find((t) => t._id === question.typeId)?.eventType ||
        "Uncategorized";
      const traitName =
        question.traitId?.trait ||
        traits.find((tr) => tr._id === question.traitId)?.trait ||
        "Uncategorized";

      if (!acc[typeName]) acc[typeName] = {};
      if (!acc[typeName][traitName]) acc[typeName][traitName] = [];
      acc[typeName][traitName].push(question);

      return acc;
    }, {});
  };

  const toggleVisibility = (type) => {
    setVisibleTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const groupedQuestions = groupQuestionsByTypeAndTrait();

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
        <h1 className="text-[5vh] md:text-[8vh] sm:text-[10vh] font-semibold text-[#3a1078] font-tungsten text-center md:text-left">
          Questionnaire Dashboard
        </h1>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setEditingQuestion(null);
          }}
          className="bg-[#3a1078] text-white font-semibold py-3 px-4 md:py-4 md:px-6 rounded-3xl flex items-center gap-2 hover:bg-[#3a1078c5] transition"
        >
          Create Questionnaire
          <FaArrowRight className="text-white text-lg" />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-md w-full max-w-lg relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingQuestion(null);
                setTempQuestions([]);
              }}
              className="absolute top-4 right-4 text-2xl"
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-6">
              {editingQuestion ? "Edit Question" : "Create Questions"}
            </h2>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label className="block text-lg font-medium mb-2">Question:</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Enter your question"
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2">Translated:</label>
                <input
                  type="text"
                  value={translated}
                  onChange={(e) => setTranslated(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Enter translated question"
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2">Select Trait:</label>
                <select
                  value={selectedTrait}
                  onChange={(e) => setSelectedTrait(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">-- Select a Trait --</option>
                  {traits.map((trait) => (
                    <option key={trait._id} value={trait._id}>
                      {trait.trait || trait.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-lg font-medium mb-2">Select Type:</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">-- Select a Type --</option>
                  {types.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.eventType}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                  className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex-1"
                >
                  {editingQuestion ? "Update Question" : "Add Another Question"}
                </button>
                {!editingQuestion && (
                  <button
                    type="button"
                    onClick={handleCreateQuestions}
                    className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex-1"
                  >
                    Submit Questionnaire
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <h1 className="font-tungsten text-[4vh] md:text-[5vh] text-[#3a1078] flex items-center gap-4 mt-8">
        <span className="flex-1 h-1 bg-[#3a1078]"></span>
        Created Questions
        <span className="flex-1 h-1 bg-[#3a1078]"></span>
      </h1>

      {Object.entries(groupedQuestions).map(([type, traits]) => (
        <div key={type} className="mb-8 border-b pb-4">
          <button
            onClick={() => toggleVisibility(type)}
            className="w-full flex justify-between items-center text-[4vh] md:text-[5vh] font-bold text-[#3a1078] font-tungsten mb-4 focus:outline-none"
          >
            {type}
            <FaArrowAltCircleDown
              size={35}
              className={`transform transition-transform duration-300 mr-5 ${
                visibleTypes[type] ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {visibleTypes[type] &&
            Object.entries(traits)
              .slice(0, 5)
              .map(([trait, questions]) => (
                <div key={trait} className="border border-gray-300 p-4 rounded-lg mb-4">
                  <h3 className="text-[3vh] md:text-[4vh] font-semibold font-tungsten text-[#3a1078] mb-3">
                    {trait}
                  </h3>
                  <table className="w-full border-collapse border border-gray-300 text-sm md:text-base">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2">#</th>
                        <th className="border border-gray-300 p-2">Question</th>
                        <th className="border border-gray-300 p-2">Translated</th>
                        <th className="border border-gray-300 p-2">Type</th>
                        <th className="border border-gray-300 p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.slice(0, 5).map((q, index) => (
                        <tr key={q._id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                          <td className="border border-gray-300 p-2">{q.question}</td>
                          <td className="border border-gray-300 p-2">{q.translated}</td>
                          <td className="border border-gray-300 p-2">{q.typeId?.eventType || "N/A"}</td>
                          <td className="border border-gray-300 p-2 text-center">
                            <button
                              className="text-blue-600 hover:underline"
                              onClick={() => handleEditQuestion(q)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 ml-4 hover:underline"
                              onClick={() => handleDeleteQuestion(q._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
        </div>
      ))}

      {error && <p className="text-red-600 font-semibold mt-4">{error}</p>}
      <ToastContainer />
    </div>
  );
};

export default ListQuestion;
