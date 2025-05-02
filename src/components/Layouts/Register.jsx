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
    previewImage: null,
    isAdmin: false,
  });

  const [orgSelections, setOrgSelections] = useState([
    { organization: "", role: "", department: "" },
  ]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updatedValue = value;

      if (name === "email") {
        updatedValue = value.toLowerCase();
      }

      const updatedData = {
        ...prev,
        [name]: updatedValue,
      };

      const nameTrimmed = (name === "name" ? updatedValue : updatedData.name).trim().toLowerCase();
      const surnameTrimmed = (name === "surname" ? updatedValue : updatedData.surname).trim().toLowerCase();

      if (nameTrimmed && surnameTrimmed) {
        updatedData.email = `${nameTrimmed}.${surnameTrimmed}@tup.edu.ph`;
      }

      return updatedData;
    });
  };

  const handleOrgChange = (index, e) => {
    const { name, value } = e.target;
    const updatedSelections = [...orgSelections];
    updatedSelections[index][name] = value;

    // Auto-set department based on organization
    if (name === "organization") {
      const selectedOrg = organizations.find((org) => org._id === value);
      let department = "None";
      if (selectedOrg) {
        const civil = [
          "ACES",
          "Association of Civil Engineering Students of TUP Taguig Campus",
          "GreeCS",
          "Green Chemistry Society TUP - Taguig",
        ];
        const bas = [
          "TEST",
          "Technical Educators Society – TUP Taguig",
        ];
        const electrical = [
          "BSEEG",
          "Bachelor of Science in Electrical Engineering Guild",
          "IECEP",
          "Institute of Electronics Engineers of the Philippines – TUPT Student Chapter",
          "ICS",
          "Instrumentation and Control Society – TUPT Student Chapter",
          "MTICS",
          "Manila Technician Institute Computer Society",
          "MRSP",
          "Mechatronics and Robotics Society of the Philippines Taguig Student Chapter",
        ];
        const mechanical = [
          "ASE",
          "Automotive Society of Engineering",
          "DMMS",
          "Die and Mould Maker Society – TUP Taguig",
          "EleMechS",
          "Electromechanics Society",
          "JPSME",
          "Junior Philippine Society of Mechanical Engineers",
          "JSHRAE",
          "Junior Society of Heating, Refrigeration and Air Conditioning Engineers",
          "METALS",
          "Mechanical Technologies and Leader’s Society",
          "TSNT",
          "TUP Taguig Society of Nondestructive Testing",
        ];

        if (civil.includes(selectedOrg.name)) department = "Civil and Allied Department";
        else if (bas.includes(selectedOrg.name)) department = "Basic Arts and Sciences Department";
        else if (electrical.includes(selectedOrg.name)) department = "Electrical and Allied Department";
        else if (mechanical.includes(selectedOrg.name)) department = "Mechanical and Allied Department";
      }
      updatedSelections[index].department = department;
    }

    // Ensure only one Officer role
    if (name === "role" && value === "Officer") {
      updatedSelections.forEach((entry, idx) => {
        if (idx !== index && entry.role === "Officer") {
          updatedSelections[idx].role = "";
        }
      });
    }

    setOrgSelections(updatedSelections);
  };

  const addOrganization = () => {
    setOrgSelections([...orgSelections, { organization: "", role: "", department: "" }]);
  };

  const removeOrganization = (index) => {
    const updatedSelections = orgSelections.filter((_, idx) => idx !== index);
    setOrgSelections(updatedSelections);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      image: file,
      previewImage: file ? URL.createObjectURL(file) : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoading(true);

    const officerCount = orgSelections.filter((sel) => sel.role === "Officer").length;
    if (officerCount > 1) {
      toast.error("You can only be an officer for one organization.", { position: "bottom-right", autoClose: 3000 });
      setIsSubmitting(false);
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "image" && key !== "previewImage") {
        formDataToSend.append(key, formData[key]);
      }
    });
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }
    formDataToSend.append("orgSelections", JSON.stringify(orgSelections));

    try {
      await axios.post(`${apiUrl}users/register`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Registration successful!", { position: "bottom-right", autoClose: 2000 });
      setTimeout(() => {
        navigate("/login", { state: { email: formData.email } });
      }, 2500);
    } catch (error) {
      console.error("Error registering the user:", error.response?.data || error.message);
      toast.error("Error registering the user.", { position: "bottom-right", autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const filteredOrganizations = organizations.filter(
    (org) => org.category === "Non Academic" || org.category === "Multi-Faith"
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3a1078] p-4">
      <div className="bg-[#f7f7f8] flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden w-full max-w-7xl">
        <div className="w-full md:w-1/2 flex items-center justify-center bg-[#f7f7f8] h-64 md:h-[80vh]">
          <img src={logo} alt="Logo" className="max-w-[80%] max-h-[80%] object-contain" />
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#3a1078] text-center md:text-left">Register to VOYS!</h2>
          <p className="text-base md:text-lg text-[#3a1078] font-medium mb-6 text-center md:text-left">
            Access the latest updates and announcements from your organization.
          </p>

          <div className="flex overflow-y-auto max-h-[70vh] pr-4 pl-2">
            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              {[
                { id: "name", label: "Name", type: "text", value: formData.name },
                { id: "surname", label: "Surname", type: "text", value: formData.surname },
                { id: "email", label: "Email", type: "email", value: formData.email, placeholder: "Auto-filled", disabled: true },
                { id: "password", label: "Password", type: "password", value: formData.password },
                {
                  id: "course",
                  label: "Course",
                  type: "text",
                  value: formData.course,
                  onChange: (e) => setFormData((prev) => ({ ...prev, course: e.target.value.toUpperCase() })),
                },
                {
                  id: "section",
                  label: "Section",
                  type: "text",
                  value: formData.section,
                  onChange: (e) => setFormData((prev) => ({ ...prev, section: e.target.value.toUpperCase() })),
                },
              ].map((field) => (
                <div key={field.id} className="flex flex-col">
                  <label htmlFor={field.id} className="text-lg text-[#3a1078] font-medium">{field.label}</label>
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    value={field.value}
                    onChange={field.onChange || handleChange}
                    placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}`}
                    required
                    disabled={field.disabled || false}
                    className={`mt-2 px-4 py-2 text-base border-2 ${field.value ? "bg-white" : "bg-[#d6e4f0]"} border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${field.disabled ? "cursor-not-allowed" : ""}`}
                  />
                  {field.id === "surname" && formData.name && formData.surname && (
                    <p className="text-sm text-green-700 mt-1">Your email will be: <strong>{formData.email}</strong></p>
                  )}
                </div>
              ))}

              {/* Organization Memberships */}
              <div>
                <h3 className="text-xl font-semibold text-[#3a1078] mb-2">Organization Memberships</h3>
                {orgSelections.map((entry, index) => (
                  <div key={index} className="border p-4 mb-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Organization Select */}
                      <div className="flex flex-col">
                        <label className="text-lg text-[#3a1078] font-medium">Organization</label>
                        <select
                          name="organization"
                          value={entry.organization}
                          onChange={(e) => handleOrgChange(index, e)}
                          required
                          className={`mt-2 px-4 py-2 text-base border-2 ${entry.organization ? "bg-white" : "bg-[#d6e4f0]"} border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
                        >
                          <option value="" disabled>Select organization</option>
                          {(index === 0 ? organizations : filteredOrganizations).map((org) => (
                            <option key={org._id} value={org._id}>{org.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Role Select */}
                      <div className="flex flex-col">
                        <label className="text-lg text-[#3a1078] font-medium">Role</label>
                        <select
                          name="role"
                          value={entry.role}
                          onChange={(e) => handleOrgChange(index, e)}
                          required
                          className={`mt-2 px-4 py-2 text-base border-2 ${entry.role ? "bg-white" : "bg-[#d6e4f0]"} border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
                        >
                          <option value="" disabled>Select role</option>
                          <option value="User">Member</option>
                          <option value="Officer">Officer</option>
                        </select>
                      </div>

                      {/* Department */}
                      <div className="flex flex-col">
                        <label className="text-lg text-[#3a1078] font-medium">Department</label>
                        <input
                          name="department"
                          type="text"
                          value={entry.department}
                          disabled
                          className="mt-2 px-4 py-2 bg-[#d6e4f0] border-2 border-gray-300 rounded-lg text-gray-500"
                        />
                      </div>
                    </div>

                    {orgSelections.length > 1 && (
                      <button type="button" onClick={() => removeOrganization(index)} className="mt-2 text-red-600 underline">Remove</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addOrganization} className="py-2 px-4 bg-[#3a1078] text-white rounded-lg">Add another Organization</button>
              </div>

              {/* Image Upload */}
              <div className="flex flex-col">
                <label className="text-lg text-[#3a1078] font-medium">Upload Image</label>
                <input type="file" name="image" onChange={handleImageChange} accept="image/*" className="mt-2 px-4 py-2 bg-[#d6e4f0] border-2 border-gray-300 rounded-lg" />
                {formData.previewImage && (
                  <div className="mt-4">
                    <img src={formData.previewImage} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-300" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 font-bold bg-[#3a1078] text-white rounded-lg hover:bg-[#4e31aa] transition duration-300 uppercase ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
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
