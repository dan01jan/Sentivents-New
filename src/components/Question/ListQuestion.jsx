import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const ListQuestion = () => {
    const [traits, setTraits] = useState([]);
    const [types, setTypes] = useState([]); // Changed from events to types
    const [selectedTrait, setSelectedTrait] = useState('');
    const [selectedType, setSelectedType] = useState(''); // Changed from selectedEvent
    const [question, setQuestion] = useState('');
    const [tempQuestions, setTempQuestions] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [traitsResponse, typesResponse, questionsResponse] = await Promise.all([
                    axios.get(`${apiUrl}traits/`),
                    axios.get(`${apiUrl}types/`), // Changed to fetch types instead of events
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
            typeId: selectedType, // Changed from eventId to typeId
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
            alert('Questions created successfully!');
        } catch (error) {
            console.error('Error creating questions:', error.message);
        }
    };

    return (
        <div style={styles.container}>
            <h1>Create Questions</h1>

            <form onSubmit={(e) => e.preventDefault()} style={styles.form}>
                {/* Question input */}
                <div style={styles.formGroup}>
                    <label htmlFor="question">Question:</label>
                    <input
                        id="question"
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Enter your question"
                        style={styles.input}
                    />
                </div>

                {/* Trait selection */}
                <div style={styles.formGroup}>
                    <label htmlFor="trait">Select Trait:</label>
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

                {/* Type selection */}
                <div style={styles.formGroup}>
                    <label htmlFor="type">Select Type:</label>
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

            {/* Display temporary questions */}
            {tempQuestions.length > 0 && (
                <>
                    <h2>Questions to be Created</h2>
                    <ul style={styles.tempList}>
                        {tempQuestions.map((q, index) => (
                            <li key={index}>
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

            {/* Display created questions */}
            <h2>Created Questions</h2>
            <div style={styles.questionList}>
                {questions.map((q) => (
                    <div key={q._id} style={styles.questionCard}>
                        <p><strong>Question:</strong> {q.question}</p>
                        <p><strong>Trait:</strong> {q.traitId?.trait || 'N/A'}</p>
                        <p><strong>Type:</strong> {q.typeId?.eventType || 'N/A'}</p>
                    </div>
                ))}
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

// Styling for a cute and user-friendly interface
const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '60%',
        margin: 'auto',
        textAlign: 'center',
    },
    form: {
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    formGroup: {
        marginBottom: '15px',
    },
    input: {
        padding: '8px',
        width: '250px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginTop: '5px',
    },
    select: {
        padding: '8px',
        width: '250px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginTop: '5px',
        backgroundColor: '#ffffff',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#6c5ce7',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    questionList: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        justifyContent: 'center',
        marginTop: '20px',
    },
    questionCard: {
        padding: '15px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        width: '200px',
        textAlign: 'left',
    },
    scaleContainer: {
        display: 'flex',
        gap: '10px',
        marginTop: '10px',
    },
    scaleBox: {
        width: '30px',
        height: '30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: '5px',
        border: '1px solid #ccc',
        cursor: 'pointer',
    },
};

export default ListQuestion;
