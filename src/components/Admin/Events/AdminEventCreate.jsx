import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom"; 

const apiUrl = import.meta.env.VITE_API_URL;

const AdminEventCreate = () => {
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
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictingEvents, setConflictingEvents] = useState([]);
  const navigate = useNavigate();

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

    // Pre-fill organization, department, and userId based on user data from localStorage
    const userData = JSON.parse(localStorage.getItem("userData"));

    // Try to retrieve values from specific keys first
    const officerOrgName = localStorage.getItem("officerOrgName");
    const officerDepartment = localStorage.getItem("officerDepartment");

    // If not set directly, extract from the organizations array in userData
    const organizationName =
      officerOrgName ||
      (userData &&
        userData.organizations &&
        userData.organizations.length > 0 &&
        userData.organizations[0].organization &&
        userData.organizations[0].organization.name
        ? userData.organizations[0].organization.name
        : "");

    const department =
      officerDepartment ||
      (userData &&
        userData.organizations &&
        userData.organizations.length > 0 &&
        userData.organizations[0].department
        ? userData.organizations[0].department
        : "");

    if (userData) {
      setFormData((prevData) => ({
        ...prevData,
        organization: organizationName,
        department: department,
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
  
    // Create previews (object URLs)
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
  
    setFormData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...previews],
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prevData) => {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(prevData.images[index].preview);
  
      const updatedImages = [...prevData.images];
      updatedImages.splice(index, 1);
  
      return { ...prevData, images: updatedImages };
    });
  };
  
const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.images.length === 0) {
    alert("Please select at least one image.");
    return;
  }

  const startDateTime = new Date(`${formData.dateStart}T${formData.timeStart}:00`);
  const endDateTime = new Date(`${formData.dateEnd}T${formData.timeEnd}:00`);

  try {
    const token = localStorage.getItem("authToken");

    // Step 1: Conflict Check
    const conflictCheck = await axios.post(`${apiUrl}events/check-conflict`, {
      dateStart: startDateTime,
      dateEnd: endDateTime
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (conflictCheck.data.conflict) {
      // Step 2: Show modal and stop submission
      setConflictingEvents([conflictCheck.data.conflictingEvent]);
      setShowConflictModal(true);
      return; // ✅ Stop event submission if conflict exists
    }

    // Step 3: Submit Event if no conflict
    const form = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      if (!["images", "dateStart", "dateEnd", "timeStart", "timeEnd"].includes(key)) {
        form.append(key, value);
      }
    }

    form.append("dateStart", startDateTime.toISOString());
    form.append("dateEnd", endDateTime.toISOString());
    formData.images.forEach((imgObj) => form.append("images", imgObj.file));
    if (formData.type) form.append("type", formData.type);

    const response = await fetch(`${apiUrl}events/create`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    const data = await response.json();
    if (response.ok) {
      toast.success("Event Created Successfully!", { position: "bottom-right", autoClose: 3000 });
      setTimeout(() => navigate("/admin/eventlist"), 3000);
    }

  } catch (err) {
    toast.error("Error checking or creating event: " + err.message, {
      position: "bottom-right",
      autoClose: 3000
    });
  }
};

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <h2 className="text-[5vh] font-tungsten text-[#3a1078] mb-6 text-center">
        Create Your Event
      </h2>
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-6"
      >
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
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

          <div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
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

          <div>
            <label
              htmlFor="dateEnd"
              className="block text-lg font-medium mb-2"
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

          <div>
            <label
              htmlFor="timeEnd"
              className="block text-lg font-medium mb-2"
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
            className="block text-lg font-medium mb-2"
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
            className="block text-lg font-medium mb-2"
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
          {formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {formData.images.map((imgObj, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imgObj.preview}
                    alt={`preview-${index}`}
                    className="w-full h-32 object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-800 transition group-hover:opacity-100 opacity-75"
                  >
                    ✕
                  </button>
                  
                </div>
              ))}
            </div>
          )}

        </div>

        {showConflictModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg text-center">
              <h3 className="text-2xl font-bold text-pink-600 mb-3">Event Conflict Detected</h3>
              <p className="mb-4">Your event overlaps with the following event(s):</p>
              <ul className="text-left mb-4 max-h-40 overflow-auto">
                {conflictingEvents.map((ev, i) => (
                  <li key={i} className="mb-1">
                    • {ev.name} ({new Date(ev.dateStart).toLocaleDateString()} - {new Date(ev.dateEnd).toLocaleDateString()})
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setShowConflictModal(false);
                  navigate("/admin/eventlist");
                }}
                className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition"
              >
                Okay, Got it!
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-[#3a1078] font-semibold text-white py-3 rounded-lg hover:bg-[#2a0858] transition duration-300"
        >
          Create Event
        </button>
      </form>
    </>
  );
};

export default AdminEventCreate;
