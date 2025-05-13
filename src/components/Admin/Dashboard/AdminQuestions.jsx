import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowRight, FaArrowAltCircleDown } from "react-icons/fa";
import Loader from "../../Layouts/Loader";

const apiUrl = import.meta.env.VITE_API_URL;

const AdminQuestions = () => {
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
  const [loading, setLoading] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const resetForm = () => {
    setQuestion("");
    setTranslated("");
    setSelectedTrait("");
    setSelectedType("");
  };

  const handleAddQuestion = () => {
    if (!question || !translated || !selectedTrait || !selectedType) {
      toast.error("Please fill in all fields before adding a question.");
      return;
    }

    const newQuestion = { question, translated, traitId: selectedTrait, typeId: selectedType };
    setTempQuestions((prev) => [...prev, newQuestion]);
    resetForm();
    toast.success("Question added to the list!");
  };

  const handleCreateQuestions = async () => {
    if (tempQuestions.length === 0) {
      toast.error("No questions to create. Add at least one question.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}questions/bulk-create-questions`, {
        questions: tempQuestions,
      });
      setQuestions((prev) => [...prev, ...response.data]);
      setTempQuestions([]);
      toast.success("Questions created successfully!");
      setTimeout(() => {
        window.location.href = "/admin/adminquestions";
      }, 2000);
    } catch (error) {
      toast.error("Error creating questions");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this question?");
    if (!confirmed) return;
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      toast.success("Question deleted successfully!");
    } catch {
      toast.error("Failed to delete question");
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestion(q.question);
    setTranslated(q.translated);
    setSelectedTrait(q.traitId);
    setSelectedType(q.typeId);
    setIsModalOpen(true);
  };

  const handleUpdateQuestion = async () => {
    if (!question || !translated || !selectedTrait || !selectedType) {
      toast.error("Please fill in all fields before updating the question.");
      return;
    }
    setLoading(true);
    try {
      const updatedQuestion = {
        ...editingQuestion,
        question,
        translated,
        traitId: selectedTrait,
        typeId: selectedType,
      };
      const response = await axios.put(`${apiUrl}questions/${editingQuestion._id}`, updatedQuestion);
      setQuestions((prev) => prev.map((q) => (q._id === editingQuestion._id ? response.data : q)));
      toast.success("Question updated successfully!");
      setEditingQuestion(null);
      resetForm();
      setIsModalOpen(false);
    } catch {
      toast.error("Failed to update question");
    } finally {
      setLoading(false);
    }
  };

  const groupQuestionsByTypeAndTrait = () => {
    return questions.reduce((acc, question) => {
      const typeName =
        question.typeId?.eventType || types.find((t) => t._id === question.typeId)?.eventType || "Uncategorized";
      const traitName =
        question.traitId?.trait || traits.find((tr) => tr._id === question.traitId)?.trait || "Uncategorized";
      if (!acc[typeName]) acc[typeName] = {};
      if (!acc[typeName][traitName]) acc[typeName][traitName] = [];
      acc[typeName][traitName].push(question);
      return acc;
    }, {});
  };

  const toggleVisibility = (type) => {
    setVisibleTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const groupedQuestions = groupQuestionsByTypeAndTrait();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
        <h1 className="text-[5vh] md:text-[6vh] sm:text-[10vh] font-semibold text-[#3a1078] font-semibold text-center md:text-left">
          Questionnaire Dashboard
        </h1>
        <button
          onClick={() => setShowWarningModal(true)}
          className="bg-[#3a1078] text-white font-semibold py-3 px-4 md:py-4 md:px-6 rounded-3xl flex items-center gap-2 hover:bg-[#3a1078c5] transition"
        >
          Create Questionnaire
          <FaArrowRight className="text-white text-lg" />
        </button>
      </div>

      {/* MODALS */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-md w-full max-w-lg relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingQuestion(null);
                resetForm();
              }}
              className="absolute top-4 right-4 text-2xl"
            >
              ✕
            </button>
            <h2 className="text-[5vh] font-bold mb-4 font-semibold text-[#3a1078]">
              {editingQuestion ? "Edit Question" : "Create Questions"}
            </h2>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Enter question"
              />
              <input
                type="text"
                value={translated}
                onChange={(e) => setTranslated(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Enter translated question"
              />
              <select value={selectedTrait} onChange={(e) => setSelectedTrait(e.target.value)} className="w-full p-3 border rounded-lg">
                <option value="">-- Select a Trait --</option>
                {traits.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.trait || t.name}
                  </option>
                ))}
              </select>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full p-3 border rounded-lg">
                <option value="">-- Select a Type --</option>
                {types.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.eventType}
                  </option>
                ))}
              </select>

              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                  className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 flex-1"
                >
                  {editingQuestion ? "Update Question" : "Add Another Question"}
                </button>
                {!editingQuestion && (
                  <button
                    type="button"
                    onClick={handleCreateQuestions}
                    className="bg-[#3a1078] text-white py-3 px-4 rounded-lg hover:bg-[#2a0858] flex-1"
                  >
                    Submit Questionnaire
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {showWarningModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-lg relative">
            <button onClick={() => setShowWarningModal(false)} className="absolute top-4 right-4 text-2xl">
              ✕
            </button>
            <h2 className="text-[5vh] font-bold mb-4 font-semibold text-[#3a1078]">⚠️ Important Notice</h2>
            <p className="mb-6 text-lg text-gray-700">
              Questionnaires should be approved by a registered psychometrician. Kindly coordinate with a psychometrician before creating a
              questionnaire.
            </p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowWarningModal(false)} className="px-4 py-2 rounded-lg border hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  setIsModalOpen(true);
                  setEditingQuestion(null);
                  resetForm();
                }}
                className="bg-[#3a1078] text-white px-4 py-2 rounded-lg hover:bg-[#2a0858]"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUESTIONS */}
      <h1 className="font-semibold text-[4vh] md:text-[5vh] text-[#3a1078] flex items-center gap-4 mt-8">
        <span className="flex-1 h-1 bg-[#3a1078]"></span>
        Created Questions
        <span className="flex-1 h-1 bg-[#3a1078]"></span>
      </h1>

      {Object.entries(groupedQuestions).map(([type, traits]) => (
        <div key={type} className="mb-8 border-b pb-4">
          <button onClick={() => toggleVisibility(type)} className="w-full flex justify-between items-center text-[4vh] md:text-[5vh] font-bold text-[#3a1078] font-semibold mb-4 focus:outline-none">
            {type}
            <FaArrowAltCircleDown
              size={35}
              className={`transform transition-transform duration-300 mr-5 ${visibleTypes[type] ? "rotate-180" : "rotate-0"}`}
            />
          </button>

          {visibleTypes[type] &&
            Object.entries(traits).map(([trait, questions]) => (
              <div key={trait} className="border border-gray-300 p-4 rounded-lg mb-4">
                <h3 className="text-[3vh] md:text-[4vh] font-semibold font-semibold text-[#3a1078] mb-3">{trait}</h3>
                <table className="w-full border-collapse border border-gray-300 text-sm md:text-base">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">#</th>
                      <th className="border p-2">Question</th>
                      <th className="border p-2">Translated</th>
                      <th className="border p-2">Type</th>
                      {/* <th className="border p-2">Actions</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q, index) => (
                      <tr key={q._id} className="hover:bg-gray-50">
                        <td className="border p-2 text-center">{index + 1}</td>
                        <td className="border p-2">{q.question}</td>
                        <td className="border p-2">{q.translated}</td>
                        <td className="border p-2">{q.typeId?.eventType || "N/A"}</td>
                        {/* <td className="border p-2 text-center">
                          <button className="text-blue-600 hover:underline" onClick={() => handleEditQuestion(q)}>
                            Edit
                          </button>
                          <button className="text-red-600 ml-4 hover:underline" onClick={() => handleDeleteQuestion(q._id)}>
                            Delete
                          </button>
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      ))}

      {error && <p className="text-red-600 font-semibold mt-4">{error}</p>}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default AdminQuestions;
