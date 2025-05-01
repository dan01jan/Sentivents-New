import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/website/aboutvoys.png";
import Loader from "../Layouts/Loader.jsx";

const apiUrl = import.meta.env.VITE_API_URL;

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    course: "",
    section: "",
    image: null,
    isAdmin: false,
    // Other fields as needed…
  });

  // New state for organization selections
  const [orgSelections, setOrgSelections] = useState([
    { organization: "", role: "", department: "" }
  ]);

  // State to hold the full list of organizations
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add a state to track submission

  const navigate = useNavigate();

  // Fetch organizations from the API
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await axios.get(`${apiUrl}organizations/`);
        setOrganizations(response.data);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchOrganizations();
  }, []);

  // Handle changes for simple form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle changes for each dynamic organization selection
  const handleOrgChange = (index, e) => {
    const { name, value } = e.target;
    const updatedSelections = [...orgSelections];
    updatedSelections[index][name] = value;

    // Auto-set department based on selected organization
    if (name === "organization") {
      const selectedOrg = organizations.find((org) => org._id === value);
      let department = "None";
      if (selectedOrg) {
        // Switch/case logic for department based on organization name
        switch (selectedOrg.name) {
          case "ACES":
          case "Association of Civil Engineering Students of TUP Taguig Campus":
          case "GreeCS":
          case "Green Chemistry Society TUP - Taguig":
            department = "Civil and Allied Department";
            break;
          case "TEST":
          case "Technical Educators Society – TUP Taguig":
            department = "Basic Arts and Sciences Department";
            break;
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
            department = "Electrical and Allied Department";
            break;
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
            department = "Mechanical and Allied Department";
            break;
          default:
            department = "None";
        }
      }
      updatedSelections[index].department = department;
    }

    // If an entry is set to 'Officer', remove any other 'Officer' selections from other entries
    if (name === "role" && value === "Officer") {
      updatedSelections.forEach((entry, idx) => {
        if (idx !== index && entry.role === "Officer") {
          updatedSelections[idx].role = "";
        }
      });
    }
    setOrgSelections(updatedSelections);
  };

  // Add another organization selection
  const addOrganization = () => {
    setOrgSelections([...orgSelections, { organization: "", role: "", department: "" }]);
  };

  // Remove an organization selection
  const removeOrganization = (index) => {
    const updatedSelections = orgSelections.filter((_, idx) => idx !== index);
    setOrgSelections(updatedSelections);
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true); // Disable the button
    setLoading(true);

    // Check that at most one organization is selected as Officer
    const officerCount = orgSelections.filter((sel) => sel.role === "Officer").length;
    if (officerCount > 1) {
      toast.error("You can only be an officer for one organization.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      setIsSubmitting(false); // Re-enable the button
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    // Append simple form fields
    Object.keys(formData).forEach((key) => {
      if (key !== "image") {
        formDataToSend.append(key, formData[key]);
      }
    });
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }
    // Append organization selections as JSON string
    formDataToSend.append("orgSelections", JSON.stringify(orgSelections));

    try {
      const response = await axios.post(
        `${apiUrl}users/register`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Registration successful:", response.data);
      toast.success("Registration successful!", {
        position: "bottom-right",
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (error) {
      console.error(
        "Error registering the user:",
        error.response?.data || error.message
      );
      toast.error("Error registering the user.", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false); // Re-enable the button after submission
      setLoading(false);
    }
  };

  // Compute filtered organizations for additional selections (Non Academic or Multifaith)
  const filteredOrganizations = organizations.filter(
    (org) =>
      org.category === "Non Academic" || org.category === "Multi-Faith"
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3a1078] p-4">
      <div className="bg-[#f7f7f8] h-64 lg:h-[80vh] md:h-[70vh] sm:h-[120vh] flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden w-full max-w-7xl">
        <div className="w-full md:w-1/2 h-[70vh] md:h-auto flex items-center justify-center bg-[#f7f7f8]">
          <img
            src={logo}
            alt="Logo"
            className="max-w-[80%] max-h-[80%] object-contain"
          />
        </div>
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#3a1078] text-center md:text-left">
            Register to VOYS!
          </h2>
          <p className="text-base md:text-lg text-[#3a1078] font-medium mb-6 text-center md:text-left">
            Access the latest updates and announcements from your organization.
          </p>
          <div className="flex overflow-y-auto max-h-[70vh] pr-4 pl-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { id: "name", label: "Name", type: "text", value: formData.name },
                { id: "surname", label: "Surname", type: "text", value: formData.surname },
                { id: "email", label: "Email ", type: "email", value: formData.email, placeholder: "Auto-filled", disabled: true },
                { id: "password", label: "Password", type: "password", value: formData.password },
                {
                  id: "course",
                  label: "Course",
                  type: "text",
                  value: formData.course,
                  onChange: (e) =>
                    setFormData((prev) => ({
                      ...prev,
                      course: e.target.value.toUpperCase(),
                    })),
                },
                {
                  id: "section",
                  label: "Section",
                  type: "text",
                  value: formData.section,
                  onChange: (e) =>
                    setFormData((prev) => ({
                      ...prev,
                      section: e.target.value.toUpperCase(), // Convert to uppercase
                    })),
                },
              ].map((field) => (
                <div key={field.id} className="flex flex-col">
                  <label htmlFor={field.id} className="text-lg text-[#3a1078] font-medium">
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    value={field.value}
                    onChange={field.onChange || handleChange} // Use specific onChange if provided
                    placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}`}
                    required
                    disabled={field.disabled || false} // Apply the disabled attribute if specified
                    className={`mt-2 px-4 py-2 text-base border-2 ${field.value ? "bg-white" : "bg-[#d6e4f0]"
                      } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${field.disabled ? "cursor-not-allowed" : ""
                      }`}
                  />
                </div>
              ))}

              {/* Dynamic Organization Selections */}
              <div>
                <h3 className="text-xl font-semibold text-[#3a1078] mb-2">Organization Memberships</h3>
                {orgSelections.map((entry, index) => (
                  <div key={index} className="border p-4 mb-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col">
                        <label className="text-lg text-[#3a1078] font-medium">Organization</label>
                        <select
                          name="organization"
                          value={entry.organization}
                          onChange={(e) => handleOrgChange(index, e)}
                          required
                          className={`mt-2 px-4 py-2 text-base border-2 ${entry.organization ? "bg-white" : "bg-[#d6e4f0]"
                            } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
                        >
                          <option value="" disabled>
                            Select organization
                          </option>
                          {(index === 0 ? organizations : filteredOrganizations).map((org) => (
                            <option key={org._id} value={org._id}>
                              {org.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-lg text-[#3a1078] font-medium">Role</label>
                        <select
                          name="role"
                          value={entry.role}
                          onChange={(e) => handleOrgChange(index, e)}
                          required
                          className={`mt-2 px-4 py-2 text-base border-2 ${entry.role ? "bg-white" : "bg-[#d6e4f0]"
                            } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
                        >
                          <option value="" disabled>
                            Select role
                          </option>
                          <option value="User">Member</option>
                          <option value="Officer">Officer</option>
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-lg text-[#3a1078] font-medium">Department</label>
                        <input
                          name="department"
                          type="text"
                          value={entry.department}
                          onChange={(e) => handleOrgChange(index, e)}
                          placeholder="Department"
                          required
                          disabled
                          className="mt-2 px-4 py-2 bg-[#d6e4f0] border-2 border-gray-300 rounded-lg text-gray-500"
                        />
                      </div>
                    </div>
                    {orgSelections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOrganization(index)}
                        className="mt-2 text-red-600 underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOrganization}
                  className="py-2 px-4 bg-[#3a1078] text-white rounded-lg"
                >
                  Add another Organization
                </button>
              </div>

              <div className="flex flex-col">
                <label className="text-lg text-[#3a1078] font-medium">Upload Image</label>
                <input
                  type="file"
                  name="image"
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
                  className="mt-2 px-4 py-2 bg-[#d6e4f0] border-2 border-gray-300 rounded-lg"
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
                disabled={isSubmitting} // Disable the button when submitting
                className={`w-full py-3 font-bold bg-[#3a1078] text-white rounded-lg hover:bg-[#4e31aa] transition duration-300 uppercase ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                Register
              </button>
            </form>
          </div>
          <Link to="/login" className="mt-4 text-center text-[#3a1078] hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </div>

      <ToastContainer />
      {loading && <Loader />}
    </div>
  );
};

export default Register;
