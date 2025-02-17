import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiUrl = import.meta.env.VITE_API_URL;

const EventUpdate = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    dateStart: "",
    timeStart: "",
    dateEnd: "",
    timeEnd: "",
    location: "",
    images: [],
  });
  const [imagesToUpload, setImagesToUpload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [eventTypes, setEventTypes] = useState([]); // For event types

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const response = await fetch(`${apiUrl}types/`);
        if (!response.ok) throw new Error("Failed to fetch event types.");
        const data = await response.json();
        setEventTypes(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}events/${eventId}`);
        if (!response.ok) throw new Error("Failed to fetch event details.");
        const data = await response.json();

        const dateStart = new Date(data.dateStart);
        const dateEnd = new Date(data.dateEnd);

        setFormData({
          name: data.name,
          description: data.description,
          type: data.type,
          dateStart: dateStart.toISOString().split("T")[0],
          timeStart: dateStart.toTimeString().split(" ")[0].slice(0, 5),
          dateEnd: dateEnd.toISOString().split("T")[0],
          timeEnd: dateEnd.toTimeString().split(" ")[0].slice(0, 5),
          location: data.location,
          images: data.images || [],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventTypes();
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

    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.userId;

    if (!userId) {
      setError("User not authenticated. Please log in.");
      setSubmitting(false);
      return;
    }

    const formDataToSend = new FormData();

    const dateStart = new Date(
      `${formData.dateStart}T${formData.timeStart}:00`
    );
    const dateEnd = new Date(`${formData.dateEnd}T${formData.timeEnd}:00`);

    formDataToSend.append("dateStart", dateStart);
    formDataToSend.append("dateEnd", dateEnd);

    Object.entries(formData).forEach(([key, value]) => {
      if (
        key !== "images" &&
        key !== "dateStart" &&
        key !== "timeStart" &&
        key !== "dateEnd" &&
        key !== "timeEnd"
      ) {
        formDataToSend.append(key, value);
      }
    });

    if (Array.isArray(formData.images)) {
      formData.images.forEach((imageUrl) => {
        formDataToSend.append("existingImages", imageUrl);
      });
    } else if (formData.images) {
      formDataToSend.append("existingImages", formData.images);
    }

    imagesToUpload.forEach((file) => {
      formDataToSend.append("images", file);
    });

    formDataToSend.append("userId", userId);

    try {
      const response = await fetch(`${apiUrl}events/${eventId}`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (!response.ok) throw new Error("Failed to update event.");

      const data = await response.json();
      toast.success("Event updated successfully!");
      setTimeout(() => navigate("/dashboard/events"), 3000);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to update event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading event details...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <h2 className="text-2xl font-semibold text-center mb-6">
        Update Your Event
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
          <div className="form-group">
            <label htmlFor="name" className="block text-lg font-medium mb-2">
              Event Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="form-group">
            <label htmlFor="type" className="block text-lg font-medium mb-2">
              Event Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select Event Type</option>
              {eventTypes.map((eventType) => (
                <option key={eventType._id} value={eventType._id}>
                  {eventType.eventType}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group mb-4">
          <label
            htmlFor="description"
            className="block text-lg font-medium mb-2"
          >
            Event Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
          <div className="form-group">
            <label
              htmlFor="dateStart"
              className="block text-lg font-medium mb-2"
            >
              Start Date
            </label>
            <input
              type="date"
              id="dateStart"
              name="dateStart"
              value={formData.dateStart}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="timeStart"
              className="block text-lg font-medium mb-2"
            >
              Start Time
            </label>
            <input
              type="time"
              id="timeStart"
              name="timeStart"
              value={formData.timeStart}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
          <div className="form-group">
            <label htmlFor="dateEnd" className="block text-lg font-medium mb-2">
              End Date
            </label>
            <input
              type="date"
              id="dateEnd"
              name="dateEnd"
              value={formData.dateEnd}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeEnd" className="block text-lg font-medium mb-2">
              End Time
            </label>
            <input
              type="time"
              id="timeEnd"
              name="timeEnd"
              value={formData.timeEnd}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="form-group mb-4">
          <label htmlFor="location" className="block text-lg font-medium mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="form-group mb-4">
          <label htmlFor="images" className="block text-lg font-medium mb-2">
            Event Images
          </label>
          <input
            type="file"
            name="images"
            multiple
            onChange={handleImageChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition duration-300"
          disabled={submitting}
        >
          {submitting ? "Updating..." : "Update Event"}
        </button>
      </form>

      {formData.images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Existing Event Images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {formData.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Event image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventUpdate;
