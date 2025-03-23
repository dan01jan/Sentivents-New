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
      return "Multiple";
  }
};

function OrgCreate({ isOpen, onClose }) {
  const [organizations, setOrganizations] = useState([
    { name: "", description: "", department: "", image: null }
  ]);
  const [loading, setLoading] = useState(false);

  // Update a specific organization's field by index
  const handleOrgChange = (index, field, value) => {
    const newOrganizations = [...organizations];
    newOrganizations[index][field] = value;
    // Auto-update department if the name changes
    if (field === "name") {
      newOrganizations[index]["department"] = getDepartment(value);
    }
    setOrganizations(newOrganizations);
  };

  // Add a new blank organization form
  const addOrganization = () => {
    setOrganizations([
      ...organizations,
      { name: "", description: "", department: "", image: null }
    ]);
  };

  // Remove an organization form by index
  const removeOrganization = (index) => {
    const newOrganizations = organizations.filter((_, i) => i !== index);
    setOrganizations(newOrganizations);
  };

  // Handle submission by building a FormData object
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      // Create an array of organization objects (excluding image files)
      const orgDataArray = organizations.map((org) => ({
        name: org.name,
        description: org.description
      }));
      formData.append("organizations", JSON.stringify(orgDataArray));

      // Append each image file if provided, using keys like "image_0", "image_1", etc.
      organizations.forEach((org, index) => {
        if (org.image) {
          formData.append(`image_${index}`, org.image);
        }
      });

      const response = await fetch(`${apiUrl}organizations/bulk`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert("Organizations created successfully!");
        onClose();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating organizations:", error);
      alert("Failed to create organizations");
    } finally {
      setLoading(false);
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
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Create Organizations
            </h2>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {organizations.map((org, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">
                    Organization {index + 1}
                  </h3>
                  <div className="mb-3">
                    <label
                      htmlFor={`name_${index}`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Organization Name
                    </label>
                    <input
                      id={`name_${index}`}
                      type="text"
                      placeholder="Enter name"
                      value={org.name}
                      onChange={(e) =>
                        handleOrgChange(index, "name", e.target.value)
                      }
                      required
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor={`description_${index}`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Description
                    </label>
                    <textarea
                      id={`description_${index}`}
                      rows="4"
                      placeholder="Enter description"
                      value={org.description}
                      onChange={(e) =>
                        handleOrgChange(index, "description", e.target.value)
                      }
                      required
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor={`department_${index}`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Department (Auto-filled)
                    </label>
                    <input
                      id={`department_${index}`}
                      type="text"
                      value={org.department}
                      readOnly
                      className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor={`image_${index}`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Add Image
                    </label>
                    <input
                      id={`image_${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleOrgChange(index, "image", e.target.files[0])
                      }
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                  </div>
                  {organizations.length > 1 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeOrganization(index)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={addOrganization}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg"
                >
                  Add Another Organization
                </button>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
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
