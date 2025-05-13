import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiUrl = import.meta.env.VITE_API_URL;

const OrgOfficerUpdate = ({ isOpen, onClose, organization }) => {
  const [officers, setOfficers] = useState([]);
  const orgId = organization?._id || organization?.id;

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchOfficers = async () => {
      try {
        const response = await fetch(`${apiUrl}organizations/eligible-officers/${orgId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data) {
          const normalize = (name) => name?.toLowerCase().trim();

          const grouped = data.reduce((acc, officer) => {
            const normName = normalize(officer.name);
            if (!acc[normName]) acc[normName] = [];
            acc[normName].push(officer);
            return acc;
          }, {});

          const filtered = Object.values(grouped).flatMap((group) => {
            const withImage = group.filter((o) => !!o.image);
            return withImage.length > 0 ? withImage : [group[0]];
          });

          setOfficers(
            filtered.map((officer) => ({
              ...officer,
              userId: officer.userId || officer._id,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching officers:", error);
        toast.error("Failed to fetch eligible officers");
      }
    };

    if (isOpen && orgId) {
      fetchOfficers();
    }
  }, [isOpen, orgId]);

  useEffect(() => {
    if (!isOpen) setOfficers([]);
  }, [isOpen]);

  const handleOfficerChange = (index, field, value) => {
    const updated = [...officers];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "image" && value instanceof File) {
      updated[index].image = value;
    }
    setOfficers(updated);
  };

  const handleAddOfficer = () => {
    setOfficers([...officers, { name: "", image: "", position: "" }]);
    toast.info("New officer added");
  };

  const handleCreateOfficer = async (index) => {
    const officer = officers[index];
    const token = localStorage.getItem("authToken");

    const isDuplicate = officers.some(
      (existing, i) =>
        i !== index &&
        existing.name.trim().toLowerCase() === officer.name.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast.error("An officer with this name already exists.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", officer.name);
      formData.append("position", officer.position);
      if (officer.image) {
        formData.append("image", officer.image);
      }

      const response = await fetch(`${apiUrl}organizations/${orgId}/officers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to add officer: ${text}`);
      }

      const result = await response.json();
      toast.success(`Officer ${officer.name} added successfully`);

      const updated = [...officers];
      updated[index] = {
        ...result.officer,
        userId: result.officer.userId || result.officer._id,
      };
      setOfficers(updated);
    } catch (error) {
      console.error("Create officer error:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleSaveOfficer = async (index) => {
    const officer = officers[index];
    const token = localStorage.getItem("authToken");

    const officerId = officer._id || officer.userId;

    if (!officerId || !orgId) {
      toast.error("Missing officer or organization ID");
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}organizations/${orgId}/officers/${officerId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // 👈 Add this
          },
          body: JSON.stringify({ position: officer.position }), // 👈 Send JSON
        }
      );

      if (!response.ok) throw new Error("Failed to update officer");

      const result = await response.json();
      toast.success(`Updated officer ${officer.name}`);

      const updated = [...officers];
      updated[index] = { ...result.officer };
      setOfficers(updated);
    } catch (error) {
      console.error("Update officer error:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

const handleDeleteOfficer = async (index) => {
  const officer = officers[index];
  const token = localStorage.getItem("authToken");
  const officerId = officer.userId || officer._id;

  if (!orgId || !officerId) {
    toast.error("Missing data");
    return;
  }

  if (!window.confirm(`Are you sure you want to delete ${officer?.name}?`)) return;

  try {
    const response = await fetch(
      `${apiUrl}organizations/${orgId}/officers/${officerId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to delete officer");

    // Remove officer from the officers list in UI after successful deletion
    const updated = officers.filter((_, i) => i !== index);
    setOfficers(updated);

    toast.success(`Officer ${officer?.name} deleted successfully`);
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Failed to delete officer");
  }
};


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ToastContainer />
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[5vh] font-semibold text-[#3a1078] mb-6">
                Update Officers
              </h2>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
            </div>

            {officers.map((officer, index) => {
              const isExisting = !!(officer._id || officer.userId);
              const isReadOnly = isExisting;
              return (
                <div key={officer.userId || index} className="mb-6 border p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Officer {index + 1}</h3>
                    <div className="flex space-x-2">
                      {isExisting ? (
                        <button
                          onClick={() => handleSaveOfficer(index)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCreateOfficer(index)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Add
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteOfficer(index)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={officer.name}
                    onChange={(e) => handleOfficerChange(index, "name", e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full border p-2 rounded ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />

                  <div className="mb-4">
                    <label className="block text-gray-700">Image</label>
                    {officer.image && typeof officer.image === "string" && (
                      <img
                        src={officer.image}
                        alt={`Officer ${index + 1}`}
                        className="mt-2 h-20 object-cover rounded"
                      />
                    )}
                    {!isReadOnly && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleOfficerChange(index, "image", e.target.files[0])}
                        className="mt-2"
                      />
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700">Position</label>
                    <input
                      type="text"
                      value={officer.position}
                      onChange={(e) => handleOfficerChange(index, "position", e.target.value)}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                </div>
              );
            })}

            <div className="mb-4">
              <button
                type="button"
                onClick={handleAddOfficer}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Add Officer
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrgOfficerUpdate;