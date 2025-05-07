import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiUrl = import.meta.env.VITE_API_URL;

const OrgOfficerUpdate = ({ isOpen, onClose, organization }) => {
  const [officers, setOfficers] = useState([]);

  const orgId = organization?._id || organization?.id;

  // Fetch eligible officers only when modal is open + org is valid
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (organization && organization._id) {
      fetch(`${apiUrl}organizations/eligible-officers/${organization._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            // Assuming data contains the officers, each with userId
            setOfficers(data.map((officer) => ({
              ...officer,
              userId: officer.userId || officer._id, // Ensure userId is set
            })));
          }
        })
        .catch((error) => {
          console.error("Error fetching eligible officers:", error);
          toast.error("Failed to fetch eligible officers");
        });
    }
  }, [organization]);
  

  // Reset officers list when modal closes
  useEffect(() => {
    if (!isOpen) {
      setOfficers([]);
    }
  }, [isOpen]);

  const handleOfficerChange = (index, field, value) => {
    const newOfficers = [...officers];
    newOfficers[index] = {
      ...newOfficers[index],
      [field]: value,
    };
  
    // If the image is a file, handle it separately
    if (field === "image" && value instanceof File) {
      newOfficers[index].image = value;
    }
  
    setOfficers(newOfficers);
  };
  

  const handleAddOfficer = () => {
    setOfficers([...officers, { name: "", image: "", position: "" }]);
    toast.info("New officer added");
  };

  const handleRemoveOfficer = (index) => {
    const newOfficers = officers.filter((_, i) => i !== index);
    setOfficers(newOfficers);
    toast.info("Officer removed locally");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
  
    const formData = new FormData();
  
    // Add userId and other fields
    const officersForSubmission = officers.map((officer) => {
      if (officer.image instanceof File) {
        return { ...officer, image: "" }; // Remove image for file uploads to be handled separately
      }
      return officer;
    });
  
    formData.append("officers", JSON.stringify(officersForSubmission));
  
    officers.forEach((officer, index) => {
      if (officer.image instanceof File) {
        formData.append(`image_${index}`, officer.image);
      }
    });
  
    try {
      const response = await fetch(
        `${apiUrl}organizations/${organization._id}/officers`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update officers");
      }
      toast.success("Officers updated successfully");
      setTimeout(() => onClose(), 3000);
    } catch (error) {
      console.error("Error updating officers:", error);
      toast.error("Failed to update officers");
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
              <h2 className="text-[5vh] font-tungsten text-[#3a1078] mb-6">
                Update Officers
              </h2>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {officers.map((officer, index) => (
                <div key={index} className="mb-6 border p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Officer {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveOfficer(index)}
                      className="text-red-600"
                    >
                      Remove
                    </button>
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
              <div className="flex justify-end space-x-2">
                <button
                  type="submit"
                  className="bg-[#3a1078] text-white px-4 py-2 rounded"
                >
                  Update Officers
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrgOfficerUpdate;
