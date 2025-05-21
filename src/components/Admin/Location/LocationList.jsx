import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
const apiUrl = import.meta.env.VITE_API_URL;

const LocationList = () => {
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${apiUrl}locations/`);
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error("Failed to fetch locations", err);
    }
  };

  const resetForm = () => {
    setName("");
    setCapacity("");
    setIsEditing(false);
    setEditId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, capacity };

    try {
      if (isEditing) {
        await fetch(`${apiUrl}locations/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`${apiUrl}locations/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      resetForm();
      fetchLocations();
    } catch (err) {
      console.error(isEditing ? "Failed to update location" : "Failed to create location", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${apiUrl}locations/${id}`, { method: "DELETE" });
      fetchLocations();
    } catch (err) {
      console.error("Delete failed", err);
    }
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleEdit = (location) => {
    setIsEditing(true);
    setEditId(location._id);
    setName(location.name);
    setCapacity(location.capacity);
    setShowModal(true);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[6vh] font-bold mb-4 font-semibold text-[#3a1078]">
          Locations</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setName("");
            setCapacity("");
            setShowModal(true);
          }}
          className="fixed bottom-10 right-10 bg-[#3a1078] text-white p-4 rounded-full shadow-lg hover:bg-[#3a1078c5] hover:shadow-xl transition"

        >
          <FaPlus size={24} />

        </button>

      </div>

      {locations.length === 0 ? (
        <div className="text-center text-[#3a1078] py-10">
          <div className="text-3xl mb-2">📍</div>
          <p className="text-lg font-semibold">No locations yet</p>
          <p className="text-sm text-gray-400">Start by adding your first location.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <li
              key={loc._id}
              className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm transition hover:shadow-md flex flex-col justify-between"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-[#3a1078]">{loc.name}</h3>
                <span className="inline-block mt-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                  Capacity: {loc.capacity}
                </span>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(loc)}
                  className="bg-gray-100 text-[#3a1078] text-sm font-medium px-4 py-2 rounded-full shadow-sm hover:underline transition"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(true);
                    setDeleteId(loc._id);
                  }}
                  className="bg-gray-100 text-red-600 text-sm font-medium px-4 py-2 rounded-full shadow-sm hover:underline transition"
                >
                  Delete
                </button>
              </div>

            </li>
          ))}
        </ul>
      )}


      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-[#3a1078]">
              {isEditing ? "Update Location" : "Create Location"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Location Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3a1078]"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3a1078]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3a1078] text-white rounded hover:bg-[#3a1078c5]"
                >
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Delete Location</h2>
            <p className="mb-6">Are you sure you want to delete this location? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationList;
