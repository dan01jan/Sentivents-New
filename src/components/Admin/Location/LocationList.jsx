import React, { useEffect, useState } from "react";
const apiUrl = import.meta.env.VITE_API_URL;

const LocationList = () => {
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

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
    if (!confirm("Delete this location?")) return;
    try {
      await fetch(`${apiUrl}locations/${id}`, { method: "DELETE" });
      fetchLocations();
    } catch (err) {
      console.error("Delete failed", err);
    }
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
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Locations</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setName("");
            setCapacity("");
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Create Location
        </button>
      </div>

      {locations.length === 0 ? (
        <p className="text-center text-gray-500">No locations yet.</p>
      ) : (
        <ul className="space-y-4">
          {locations.map((loc) => (
            <li
              key={loc._id}
              className="p-4 bg-white border rounded shadow-sm flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{loc.name}</div>
                <div className="text-sm text-gray-600">Capacity: {loc.capacity}</div>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(loc)}
                  className="text-yellow-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(loc._id)}
                  className="text-red-600 hover:underline"
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
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Location" : "Create Location"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Location Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
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
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationList;
