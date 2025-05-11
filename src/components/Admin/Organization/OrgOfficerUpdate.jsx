import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiUrl = import.meta.env.VITE_API_URL;

const OrgOfficerUpdate = ({ isOpen, onClose, organization }) => {
  const [officers, setOfficers] = useState([]);
  const orgId = organization?._id || organization?.id;

  // Fetch eligible officers when modal is open + org is valid
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (isOpen && organization && orgId) {
      fetch(`${apiUrl}organizations/eligible-officers/${orgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            setOfficers(
              data.map((officer) => ({
                ...officer,
                userId: officer.userId || officer._id,
              }))
            );
          }
        })
        .catch((error) => {
          console.error("Error fetching eligible officers:", error);
          toast.error("Failed to fetch eligible officers");
        });
    }
  }, [isOpen, organization, orgId]);

  // Reset officers list when modal closes
  useEffect(() => {
    if (!isOpen) setOfficers([]);
  }, [isOpen]);

  const handleOfficerChange = (index, field, value) => {
    const newOfficers = [...officers];
    newOfficers[index] = { ...newOfficers[index], [field]: value };

    if (field === "image" && value instanceof File) {
      newOfficers[index].image = value;
    }

    setOfficers(newOfficers);
  };

  const handleAddOfficer = () => {
    setOfficers([
      ...officers,
      { name: "", image: "", position: "", userId: `new_${Date.now()}` },
    ]);
    toast.info("New officer added");
  };

  const handleRemoveOfficer = (index) => {
    const newOfficers = officers.filter((_, i) => i !== index);
    setOfficers(newOfficers);
    toast.info("Officer removed locally");
  };

  const handleSaveOfficer = async (index) => {
    const officer = officers[index];
    const token = localStorage.getItem("authToken");

    const formData = new FormData();
    formData.append("name", officer.name);
    formData.append("position", officer.position);
    if (officer.image instanceof File) {
      formData.append("image", officer.image);
    }

    try {
      const response = await fetch(
        `${apiUrl}organizations/${orgId}/officers/${officer.userId}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update officer");
      }

      const result = await response.json();
      toast.success(`Officer ${officer.name} updated`);

      const updatedOfficers = [...officers];
      updatedOfficers[index] = {
        ...officer,
        ...result.officer,
      };
      setOfficers(updatedOfficers);
    } catch (error) {
      console.error("Error updating officer:", error);
      toast.error("Failed to update officer");
    }
  };

  const handleDeleteOfficer = async (index) => {
    const officer = officers[index];

    // If it's a new (unsaved) officer, just remove locally
    if (officer.userId.startsWith("new_")) {
      handleRemoveOfficer(index);
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete officer "${officer.name}"?`
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        `${apiUrl}organizations/${orgId}/officers/${officer.userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete officer");
      }

      toast.success(`Officer ${officer.name} deleted`);
      handleRemoveOfficer(index);
    } catch (error) {
      console.error("Error deleting officer:", error);
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

            {officers.map((officer, index) => (
              <div key={officer.userId} className="mb-6 border p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Officer {index + 1}</h3>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleSaveOfficer(index)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOfficer(index)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700">Name</label>
                  <input
                    type="text"
                    value={officer.name}
                    onChange={(e) =>
                      handleOfficerChange(index, "name", e.target.value)
                    }
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700">Image</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      handleOfficerChange(index, "image", file);
                    }}
                    className="w-full border p-2 rounded"
                    accept="image/*"
                  />
                  {officer.image &&
                    (officer.image instanceof File ? (
                      <img
                        src={URL.createObjectURL(officer.image)}
                        alt={`Officer ${index + 1}`}
                        className="mt-2 h-20 object-cover rounded"
                      />
                    ) : (
                      <img
                        src={officer.image}
                        alt={`Officer ${index + 1}`}
                        className="mt-2 h-20 object-cover rounded"
                      />
                    ))}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700">Position</label>
                  <input
                    type="text"
                    value={officer.position}
                    onChange={(e) =>
                      handleOfficerChange(index, "position", e.target.value)
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
            ))}

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
