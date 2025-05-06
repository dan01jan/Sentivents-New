import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiUrl = import.meta.env.VITE_API_URL;

const OrgUpdate = ({ isOpen, onClose, organization }) => {
  const [name, setName] = useState(organization.name);
  const [description, setDescription] = useState(organization.description);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(organization.image);

  // Sync prop -> local state when modal opens or org changes
React.useEffect(() => {
  if (organization) {
    setName(organization.name || "");
    setDescription(organization.description || "");
    setPreview(organization.image || null);
    setImage(null); // reset uploaded image
  }
}, [organization]);


  const handleUpdate = async () => {
    const token = localStorage.getItem("authToken");
    const formData = new FormData();

    if (name !== organization.name) {
      formData.append("name", name);
    }
    if (description !== organization.description) {
      formData.append("description", description);
    }
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch(
        `${apiUrl}organizations/${organization._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update organization");
      }

      toast.success("Organization updated successfully!");
      setTimeout(() => onClose(), 3000);
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error("Failed to update organization. Please try again.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
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
            <h2 className="text-[5vh] font-tungsten text-[#3a1078] mb-6">
              Update Organization
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                {preview && (
                  <img
                    src={preview}
                    alt="Organization"
                    className="mb-2 w-full h-40 object-cover rounded-lg"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleUpdate}
                className="bg-[#3a1078] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2a0858] transition"
              >
                Update
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrgUpdate;
