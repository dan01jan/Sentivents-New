import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const apiUrl = import.meta.env.VITE_API_URL;

const ListQuestion = () => {
    const [traits, setTraits] = useState([]);
    const [types, setTypes] = useState([]);
    const [selectedTrait, setSelectedTrait] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [question, setQuestion] = useState('');
    const [tempQuestions, setTempQuestions] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');

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
                setError('Failed to fetch data');
                console.error(err);
            }
        };

        fetchData();
    }, []);

    const handleAddQuestion = () => {
        if (!question || !selectedTrait || !selectedType) {
            alert('Please enter a question, select a trait, and select a type.');
            return;
        }

        const newQuestion = {
            question,
            traitId: selectedTrait,
            typeId: selectedType,
        };

        setTempQuestions((prev) => [...prev, newQuestion]);
        setQuestion('');
        setSelectedTrait('');
        setSelectedType('');
    };

    const handleCreateQuestions = async () => {
        if (tempQuestions.length === 0) {
            alert('No questions to create. Add at least one question.');
            return;
        }

        try {
            const response = await axios.post(`${apiUrl}questions/bulk-create-questions`, {
                questions: tempQuestions,
            });

            setQuestions((prev) => [...prev, ...response.data]);
            setTempQuestions([]);

            // Show toast notification
            toast.success('Questions created successfully!');

            // Refresh the page after 3 seconds
            setTimeout(() => {
                window.location.href = '/dashboard/questions'; // Redirect to refresh the page
            }, 3000);
        } catch (error) {
            console.error('Error creating questions:', error.message);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Create Questions</h1>

            <form onSubmit={(e) => e.preventDefault()} style={styles.form}>
                <div style={styles.formGroup}>
                    <label htmlFor="question" style={styles.label}>Question:</label>
                    <input
                        id="question"
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Enter your question"
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="trait" style={styles.label}>Select Trait:</label>
                    <select
                        id="trait"
                        value={selectedTrait}
                        onChange={(e) => setSelectedTrait(e.target.value)}
                        style={styles.select}
                    >
                        <option value="">-- Select a Trait --</option>
                        {traits.map((trait) => (
                            <option key={trait._id} value={trait._id}>
                                {trait.trait || trait.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="type" style={styles.label}>Select Type:</label>
                    <select
                        id="type"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        style={styles.select}
                    >
                        <option value="">-- Select a Type --</option>
                        {types.map((type) => (
                            <option key={type._id} value={type._id}>
                                {type.eventType}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="button" onClick={handleAddQuestion} style={styles.button}>
                    Add Another Question
                </button>
            </form>

            {tempQuestions.length > 0 && (
                <>
                    <h2 style={styles.subHeading}>Questions to be Created</h2>
                    <ul style={styles.tempList}>
                        {tempQuestions.map((q, index) => (
                            <li key={index} style={styles.tempListItem}>
                                {q.question} - Trait: {traits.find((t) => t._id === q.traitId)?.trait || 'N/A'},
                                Type: {types.find((t) => t._id === q.typeId)?.eventType || 'N/A'}
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleCreateQuestions} style={styles.button}>
                        Create All Questions
                    </button>
                </>
            )}

            <h2 style={styles.subHeading}>Created Questions</h2>
            <div style={styles.questionList}>
                {questions.map((q) => (
                    <div key={q._id} style={styles.questionCard}>
                        <p><strong>Question:</strong> {q.question}</p>
                        <p><strong>Trait:</strong> {q.traitId?.trait || 'N/A'}</p>
                        <p><strong>Type:</strong> {q.typeId?.eventType || 'N/A'}</p>
                    </div>
                ))}
            </div>

            {error && <p style={styles.error}>{error}</p>}

            {/* ToastContainer to show the toast notifications */}
            <ToastContainer />
        </div>
    );
};


// Styling with a sleek design and user-friendly interface
const styles = {
    container: {
        padding: '30px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f1f3f6',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
        width: '75%',
        margin: '30px auto',
        textAlign: 'center',
    },
    heading: {
        fontSize: '2.5rem',
        color: '#4a90e2',
        marginBottom: '20px',
    },
    form: {
        marginBottom: '30px',
        padding: '25px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    formGroup: {
        marginBottom: '20px',
        width: '80%',
        textAlign: 'left',
    },
    label: {
        fontSize: '1.1rem',
        fontWeight: '500',
        marginBottom: '8px',
        color: '#333',
    },
    input: {
        padding: '12px',
        width: '100%',
        maxWidth: '350px',
        borderRadius: '8px',
        border: '2px solid #ccc',
        marginTop: '8px',
        fontSize: '1rem',
    },
    select: {
        padding: '12px',
        width: '100%',
        maxWidth: '350px',
        borderRadius: '8px',
        border: '2px solid #ccc',
        marginTop: '8px',
        backgroundColor: '#fff',
        fontSize: '1rem',
    },
    button: {
        padding: '12px 30px',
        backgroundColor: '#6c5ce7',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1.2rem',
        marginTop: '20px',
        transition: 'background-color 0.3s ease',
    },
    buttonHover: {
        backgroundColor: '#5a4cd8',
    },
    tempList: {
        listStyle: 'none',
        padding: '0',
        marginTop: '20px',
        textAlign: 'left',
    },
    tempListItem: {
        padding: '12px',
        backgroundColor: '#f7f7f7',
        borderRadius: '8px',
        marginBottom: '10px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    },
    questionList: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        justifyContent: 'center',
        marginTop: '30px',
    },
    questionCard: {
        padding: '20px',
        width: '250px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'left',
    },
    subHeading: {
        fontSize: '1.5rem',
        color: '#333',
        marginBottom: '15px',
    },
    error: {
        color: '#ff4d4d',
        fontWeight: 'bold',
        fontSize: '1.1rem',
    },
};

export default ListQuestion;
