import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom"; 

const apiUrl = import.meta.env.VITE_API_URL;

const EventCreate = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    organization: "",
    department: "",
    dateStart: "",
    dateEnd: "",
    timeStart: "",
    timeEnd: "",
    location: "",
    images: [],
  });

  const [eventTypes, setEventTypes] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // initialize navigate

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const response = await axios.get(`${apiUrl}types/`);
        console.log("Fetched event types:", response.data);

        if (Array.isArray(response.data)) {
          setEventTypes(response.data);
        } else {
          setError("Unexpected response format");
        }
      } catch (err) {
        console.error("Error fetching event types:", err);
        setError("Failed to fetch event types. Please try again.");
      }
    };

    fetchEventTypes();

    // Pre-fill organization and department based on user data from localStorage
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      setFormData((prevData) => ({
        ...prevData,
        organization: userData.organization || "",
        department: userData.department || "",
        userId: userData.userId || "",
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
      file.type.startsWith("image/")
    );
    setFormData((prevData) => ({
      ...prevData,
      images: files,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      alert("Please select at least one image.");
      return;
    }

    const startDateTime = new Date(
      `${formData.dateStart}T${formData.timeStart}:00`
    );
    const endDateTime = new Date(`${formData.dateEnd}T${formData.timeEnd}:00`);

    const form = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      if (
        !["images", "dateStart", "dateEnd", "timeStart", "timeEnd"].includes(
          key
        )
      ) {
        form.append(key, value);
      }
    }

    form.append("dateStart", startDateTime.toISOString());
    form.append("dateEnd", endDateTime.toISOString());
    formData.images.forEach((file) => form.append("images", file));

    // Add 'type' field correctly as ObjectId
    if (formData.type) {
      form.append("type", formData.type); // Should be ObjectId, not name
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${apiUrl}events/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok) {
        toast.success("Event Created Successfully!", {
          position: "bottom-right",
          autoClose: 3000,
        });
        setTimeout(() => {
          navigate("/dashboard/events");
        }, 3000);
      }
    } catch (error) {
      toast.error("Error creating event: " + error.message);
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <h2 className="text-3xl font-semibold text-center text-teal-700 mb-6">
        Create Your Event
      </h2>
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-lg font-medium mb-2 text-gray-700"
            >
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

          <div>
            <label
              htmlFor="type"
              className="block text-lg font-medium mb-2 text-gray-700"
            >
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
              {eventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.eventType}
                </option>
              ))}
            </select>
            {error && <p className="text-red-600 mt-1">{error}</p>}
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-lg font-medium mb-2 text-gray-700"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="dateStart"
              className="block text-lg font-medium mb-2 text-gray-700"
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

          <div>
            <label
              htmlFor="dateEnd"
              className="block text-lg font-medium mb-2 text-gray-700"
            >
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="timeStart"
              className="block text-lg font-medium mb-2 text-gray-700"
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

          <div>
            <label
              htmlFor="timeEnd"
              className="block text-lg font-medium mb-2 text-gray-700"
            >
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

        <div>
          <label
            htmlFor="location"
            className="block text-lg font-medium mb-2 text-gray-700"
          >
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

        <div>
          <label
            htmlFor="images"
            className="block text-lg font-medium mb-2 text-gray-700"
          >
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
        >
          Create Event
        </button>
      </form>
    </>
  );
};

export default EventCreate;
