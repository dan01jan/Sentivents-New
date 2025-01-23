import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './EventCreate.css';

const EventUpdate = () => {
  const { eventId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    dateStart: '',
    timeStart: '',
    dateEnd: '',
    timeEnd: '',
    location: '',
    images: [],
  });
  const [imagesToUpload, setImagesToUpload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/v1/events/${eventId}`);
        if (!response.ok) throw new Error('Failed to fetch event details.');
        const data = await response.json();
  
        const dateStart = new Date(data.dateStart);
        const dateEnd = new Date(data.dateEnd);
  
        setFormData({
          name: data.name,
          description: data.description,
          type: data.type,
          dateStart: dateStart.toISOString().split('T')[0],
          timeStart: dateStart.toTimeString().split(' ')[0].slice(0, 5),
          dateEnd: dateEnd.toISOString().split('T')[0],
          timeEnd: dateEnd.toTimeString().split(' ')[0].slice(0, 5),
          location: data.location,
          images: data.images || [],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchEventDetails();
  }, [eventId]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImagesToUpload(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
  
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userId = userData?.userId;
  
    if (!userId) {
      setError('User not authenticated. Please log in.');
      setSubmitting(false);
      return;
    }
  
    const formDataToSend = new FormData();
  
    // Combine date and time into full Date objects
    const dateStart = new Date(`${formData.dateStart}T${formData.timeStart}:00`);
    const dateEnd = new Date(`${formData.dateEnd}T${formData.timeEnd}:00`);
  
    formDataToSend.append('dateStart', dateStart);  // full Date object
    formDataToSend.append('dateEnd', dateEnd);      // full Date object
  
    // Add other fields as usual
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'images' && key !== 'dateStart' && key !== 'timeStart' && key !== 'dateEnd' && key !== 'timeEnd') {
        formDataToSend.append(key, value);
      }
    });
  
    // Handle existing images and new ones
    if (Array.isArray(formData.images)) {
      formData.images.forEach((imageUrl) => {
        formDataToSend.append('existingImages', imageUrl);
      });
    } else if (formData.images) {
      formDataToSend.append('existingImages', formData.images);
    }
  
    imagesToUpload.forEach((file) => {
      formDataToSend.append('images', file);
    });
  
    formDataToSend.append('userId', userId);
  
    try {
      const response = await fetch(`http://localhost:4000/api/v1/events/${eventId}`, {
        method: 'PUT',
        body: formDataToSend,
      });
  
      if (!response.ok) throw new Error('Failed to update event.');
  
      const data = await response.json();
      alert('Event updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) return <p>Loading event details...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <div className="event-update-container">
      <h2 className="event-update-title">Update Your Event</h2>
      <form onSubmit={handleSubmit} className="event-update-form">
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
            <option value="Academic">Academic</option>
            <option value="Recreational">Recreational</option>
            <option value="Sports">Sports</option>
            <option value="Social and Community">Social and Community</option>
            <option value="Professional Development">Professional Development</option>
            <option value="Student Development">Student Development</option>
            <option value="Competition">Competition</option>
          </select>
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
        </div>

        <div className="form-row">
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

        <button type="submit" className="submit-button" disabled={submitting}>
          {submitting ? 'Updating...' : 'Update Event'}
        </button>
      </form>

      {formData.images.length > 0 && (
        <div className="event-images-container">
          <h3>Existing Event Images</h3>
          <div className="image-preview-container">
            {formData.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Event image ${index + 1}`}
                className="event-image"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventUpdate;
