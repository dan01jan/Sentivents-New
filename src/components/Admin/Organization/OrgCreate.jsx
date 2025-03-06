import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../Layouts/Loader";
const apiUrl = import.meta.env.VITE_API_URL;

// Function to determine department based on organization name
const getDepartment = (selectedOrganization) => {
  switch (selectedOrganization) {
    case "ACES":
    case "Association of Civil Engineering Students of TUP Taguig Campus":
    case "GreeCS":
    case "Green Chemistry Society TUP - Taguig":
      return "Civil and Allied Department";
  
    case "TEST":
    case "Technical Educators Society – TUP Taguig":
      return "Basic Arts and Sciences Department";
  
    case "BSEEG":
    case "Bachelor of Science in Electrical Engineering Guild":
    case "IECEP":
    case "Institute of Electronics Engineers of the Philippines – TUPT Student Chapter":
    case "ICS":
    case "Instrumentation and Control Society – TUPT Student Chapter":
    case "MTICS":
    case "Manila Technician Institute Computer Society":
    case "MRSP":
    case "Mechatronics and Robotics Society of the Philippines Taguig Student Chapter":
      return "Electrical and Allied Department";
  
    case "ASE":
    case "Automotive Society of Engineering":
    case "DMMS":
    case "Die and Mould Maker Society – TUP Taguig":
    case "EleMechS":
    case "Electromechanics Society":
    case "JPSME":
    case "Junior Philippine Society of Mechanical Engineers":
    case "JSHRAE":
    case "Junior Society of Heating, Refrigeration and Air Conditioning Engineers":
    case "METALS":
    case "Mechanical Technologies and Leader’s Society":
    case "TSNT":
    case "TUP Taguig Society of Nondestructive Testing":
      return "Mechanical and Allied Department";
  
    default:
      return "";
  }  
};

function OrgCreate({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false); // Update loading state

  // Update department when name is entered
  const handleNameChange = (e) => {
    const orgName = e.target.value;
    setName(orgName);
    setDepartment(getDepartment(orgName)); // Auto-update department
  };

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Set loading to true

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch(`${apiUrl}organizations/`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert("Organization created successfully!");
        onClose();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      alert("Failed to create organization");
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Create Organization
            </h2>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Organization Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter name"
                  value={name}
                  onChange={handleNameChange} // Auto-update department
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows="4"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Department (Auto-filled)
                </label>
                <input
                  id="department"
                  type="text"
                  value={department}
                  readOnly
                  className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Add Image
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
            {loading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Loader />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default OrgCreate;