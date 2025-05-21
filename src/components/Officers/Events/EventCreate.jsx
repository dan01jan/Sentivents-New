import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Loader from "../../Layouts/Loader";

const apiUrl = import.meta.env.VITE_API_URL;

const EventCreate = () => {
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    organization: "",
    department: "",
    dateStart: "",
    dateEnd: "",
    location: "",
    capacity: "",
    images: [],
  });


  const [eventTypes, setEventTypes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [capacityWarning, setCapacityWarning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {

     const fetchOrganizations = async () => {
    try {
      const response = await axios.get(`${apiUrl}organizations/`);
      setOrganizations(response.data);
    } catch (err) {
      console.error("Error fetching organizations:", err);
    }
  };

  fetchOrganizations();

    const fetchEventTypes = async () => {
      try {
        const response = await axios.get(`${apiUrl}types/`);
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

    const userData = JSON.parse(localStorage.getItem("userData"));
    const officerOrgName = localStorage.getItem("officerOrgName");
    const organizationName =
      officerOrgName ||
      (userData && userData.organizationName ? userData.organizationName : "");
    const officerDepartment = localStorage.getItem("officerDepartment");
    const department =
      officerDepartment ||
      (userData && userData.department ? userData.department : "");

    if (userData) {
      setFormData((prevData) => ({
        ...prevData,
        organization: organizationName,
        department: department,
        userId: userData.userId || "",
      }));
    }
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch(`${apiUrl}locations`);
        const data = await res.json();
        setLocations(data);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
  if (!formData.location || !formData.capacity) {
    setCapacityWarning(false);
    return;
  }

  const selectedLocation = locations.find((loc) => loc._id === formData.location);

  if (selectedLocation) {
    const eventCapacity = parseInt(formData.capacity, 10);
    const locationCapacity = selectedLocation.capacity;

    if (eventCapacity > locationCapacity) {
      setCapacityWarning(true);
      toast.warning(`⚠️ Event capacity (${eventCapacity}) exceeds location capacity (${locationCapacity})`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } else {
      setCapacityWarning(false);
    }
  }
}, [formData.capacity, formData.location, locations]);



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
    setLoading(true);

    if (formData.images.length === 0) {
      toast.error("Please select at least one image.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }

    if (capacityWarning) {
  toast.error("Event capacity exceeds the selected location's capacity!", {
    position: "bottom-right",
    autoClose: 3000,
  });
  return;
}


    const startDateTime = new Date(`${formData.dateStart}T${formData.timeStart}:00`);
    const endDateTime = new Date(`${formData.dateEnd}T${formData.timeEnd}:00`);

    

    try {
      const token = localStorage.getItem("authToken");

      const conflictResponse = await fetch(`${apiUrl}events/check-conflict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dateStart: startDateTime.toISOString(),
          dateEnd: endDateTime.toISOString(),
          location: formData.location,
        }),
      });

      const conflictData = await conflictResponse.json();

      if (conflictData.conflict) {
        setShowConflictModal(true);
        setLoading(false);
        return;
      }

      const form = new FormData();
      for (const [key, value] of Object.entries(formData)) {
        if (!["images", "dateStart", "dateEnd", "timeStart", "timeEnd"].includes(key)) {
          form.append(key, value);
        }
      }

      form.append("dateStart", startDateTime.toISOString());
      form.append("dateEnd", endDateTime.toISOString());
      formData.images.forEach((file) => form.append("images", file));
      if (formData.type) {
        form.append("type", formData.type);
      }

      const response = await fetch(`${apiUrl}events/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Event Created Successfully!", {
          position: "bottom-right",
          autoClose: 3000,
        });
        setTimeout(() => {
          navigate("/dashboard/events");
        }, 3000);
      } else {
        toast.error(`Error: ${data.message}`, {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error("Error creating event: " + error.message, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Loader />
        </div>
      )}

      {/* 🎀 Cute Conflict Modal */}
      {showConflictModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center animate-bounceIn">
            <h3 className="text-2xl font-bold text-pink-600 mb-2">Oopsie! 😢</h3>
            <p className="text-gray-700">
              Your event overlaps with an existing one. Please pick another time!
            </p>
            <button
              onClick={() => {
                setShowConflictModal(false);
                navigate("/dashboard/events");
              }}
              className="mt-4 px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-full transition duration-300"
            >
              Okay, Got it!
            </button>
          </div>
        </div>
      )}

      {/* ⬇️ Your Form starts here */}
      <h2 className="text-[4vh] font-semibold text-[#3a1078] mb-6 text-center">
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
              className="block text-lg font-medium mb-2 "
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
              className="block text-lg font-medium mb-2 "
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
            className="block text-lg font-medium mb-2 "
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

        <div>
          <label htmlFor="secondOrganization" className="block text-lg font-medium mb-2">
            In partnership with: (Optional)
          </label>
          <select
            id="secondOrganization"
            name="secondOrganization"
            value={formData.secondOrganization}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">None</option>
            {organizations.map((org) => (
              <option key={org._id} value={org.name}>
                {org.name}
              </option>
            ))}
          </select>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="dateStart"
              className="block text-lg font-medium mb-2 "
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
              className="block text-lg font-medium mb-2 "
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
              className="block text-lg font-medium mb-2 "
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
              className="block text-lg font-medium mb-2 "
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

        {/* Location Select */}
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Location
        </label>
        <select
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
        >
          <option value="">Select a location</option>
          {locations.map((loc) => (
            <option key={loc._id} value={loc._id}>
              {loc.name} ({loc.capacity})
            </option>
          ))}
        </select>

        {/* Capacity Input */}
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Capacity
        </label>
        <input
          type="number"
          min="1"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
        />

        <div>
          <label
            htmlFor="images"
            className="block text-lg font-medium mb-2 "
          >
            Event Images
          </label>
          <input
            type="file"
            name="images"
            multiple
            onChange={(e) => {
              handleImageChange(e);
              const file = e.target.files[0];
              if (file) {
                setFormData((prev) => ({
                  ...prev,
                  previewImage: URL.createObjectURL(file),
                }));
              }
            }}
            accept="image/*"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {formData.previewImage && (
            <div className="mt-4">
              <img
                src={formData.previewImage}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
              />
            </div>
          )}
        </div>

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

export default EventCreate;
