import React, { useState, useEffect } from 'react';
import './EventCreate.css';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const EventCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    organization: '',
    department: '',
    dateStart: '',
    dateEnd: '',
    timeStart: '',
    timeEnd: '',
    location: '',
    images: [],
  });

  const [eventTypes, setEventTypes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const response = await axios.get(`${apiUrl}types/`);
        console.log('Fetched event types:', response.data);

        if (Array.isArray(response.data)) {
          setEventTypes(response.data);
        } else {
          setError('Unexpected response format');
        }
      } catch (err) {
        console.error('Error fetching event types:', err);
        setError('Failed to fetch event types. Please try again.');
      }
    };

    fetchEventTypes();

    // Pre-fill organization and department based on user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      setFormData((prevData) => ({
        ...prevData,
        organization: userData.organization || '',
        department: userData.department || '',
        userId: userData.userId || '',
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith('image/')
    );
    setFormData((prevData) => ({
      ...prevData,
      images: files,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formData.images.length === 0) {
      alert('Please select at least one image.');
      return;
    }
  
    const startDateTime = new Date(
      `${formData.dateStart}T${formData.timeStart}:00`
    );
    const endDateTime = new Date(
      `${formData.dateEnd}T${formData.timeEnd}:00`
    );
  
    const form = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      if (!['images', 'dateStart', 'dateEnd', 'timeStart', 'timeEnd'].includes(key)) {
        form.append(key, value);
      }
    }
  
    form.append('dateStart', startDateTime.toISOString());
    form.append('dateEnd', endDateTime.toISOString());
    formData.images.forEach((file) => form.append('images', file));
  
    // Add 'type' field correctly as ObjectId
    if (formData.type) {
      form.append('type', formData.type);  // Should be ObjectId, not name
    }
  
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${apiUrl}events/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });
  
      const data = await response.json();
      if (response.ok) {
        alert('Event created successfully!');
      } else {
        alert('Error creating event: ' + data.message);
      }
    } catch (error) {
      alert('Error creating event: ' + error.message);
    }
  };
  
  
  return (
    <div className="event-create-container">
      <h2 className="event-create-title">Create Your Event</h2>
      <form onSubmit={handleSubmit} className="event-create-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Event Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="type">Event Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Event Type</option>
              {eventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.eventType}
                </option>
              ))}
            </select>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Event Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateStart">Start Date</label>
            <input
              type="date"
              id="dateStart"
              name="dateStart"
              value={formData.dateStart}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dateEnd">End Date</label>
            <input
              type="date"
              id="dateEnd"
              name="dateEnd"
              value={formData.dateEnd}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="timeStart">Start Time</label>
            <input
              type="time"
              id="timeStart"
              name="timeStart"
              value={formData.timeStart}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="timeEnd">End Time</label>
            <input
              type="time"
              id="timeEnd"
              name="timeEnd"
              value={formData.timeEnd}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="images">Event Images</label>
          <input type="file" name="images" multiple onChange={handleImageChange} />
        </div>

        <button type="submit" className="submit-button">
          Create Event
        </button>
      </form>
    </div>
  );
};

export default EventCreate;
