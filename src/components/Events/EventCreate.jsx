import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './EventCreate.css';

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
    images: [], // Changed from null to empty array
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      setFormData(prevData => ({
        ...prevData,
        organization: userData.organization || '',
        department: userData.department || '',
        userId: userData.userId || '', // Add userId
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
    const files = e.target.files;
    // Ensure files are not empty and are images
    if (files.length === 0) {
      alert('Please select at least one image');
    } else {
      const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (validFiles.length === 0) {
        alert('No valid image files selected');
      } else {
        console.log('Valid image files:', validFiles);
        setFormData((prevData) => ({
          ...prevData,
          images: validFiles, // Store valid images only
        }));
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Combine date and time for both start and end
    const startDateTime = new Date(`${formData.dateStart}T${formData.timeStart}:00`);
    const endDateTime = new Date(`${formData.dateEnd}T${formData.timeEnd}:00`);
  
    // Ensure images are selected
    if (formData.images.length === 0) {
      alert('Please select at least one image.');
      return;
    }
  
    const form = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      if (key !== 'images' && key !== 'dateStart' && key !== 'dateEnd' && key !== 'timeStart' && key !== 'timeEnd') {
        form.append(key, value);
      }
    }
  
    // Append combined date and time as ISO string to the form
    form.append('dateStart', startDateTime.toISOString());
    form.append('dateEnd', endDateTime.toISOString());
  
    // Append images to FormData
    formData.images.forEach(file => {
      form.append('images', file);
    });
  
    // Log the form data to verify image handling
    for (let pair of form.entries()) {
      console.log(pair[0], pair[1]);
    }
  
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:4000/api/v1/events/create', {
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
            <label htmlFor="type" style={{ fontSize: '0.9rem' }}>Event Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              style={{ fontSize: '0.8rem' }}
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
        </div>

        {/* Move Description field below Name and Type */}
        <div className="form-group">
          <label htmlFor="description">Event Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Enter event description here"
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
