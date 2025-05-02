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
  });

  const [orgSelections, setOrgSelections] = useState([
    { organization: "", role: "", department: "" }
  ]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
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

      // Always lowercase email input, even if typed manually
      if (name === "email") {
        updatedValue = value.toLowerCase();
      }

      const updatedData = {
        ...prev,
        [name]: updatedValue,
      };

      // Auto-generate email when both name and surname are present
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

    // Ensure only one Officer role is selected
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
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const officerCount = orgSelections.filter((sel) => sel.role === "Officer").length;
    if (officerCount > 1) {
      toast.error("You can only be an officer for one organization.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "image") {
        formDataToSend.append(key, formData[key]);
      }
    });
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }
    formDataToSend.append("orgSelections", JSON.stringify(orgSelections));

    try {
      const response = await axios.post(`${apiUrl}users/register`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Registration successful:", response.data);
      toast.success("Registration successful!", {
        position: "bottom-right",
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate("/login", { state: { email: formData.email } });
      }, 2500);
    } catch (error) {
      console.error("Error registering the user:", error.response?.data || error.message);
      toast.error("Error registering the user.", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrganizations = organizations.filter(
    (org) => org.category === "Non Academic" || org.category === "Multi-Faith"
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3a1078] p-4">
      <div className="bg-[#f7f7f8] h-64 md:h-[70vh] sm:h-[120vh] flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden w-full max-w-7xl">
        <div className="w-full md:w-1/2 h-56 md:h-auto flex items-center justify-center bg-[#f7f7f8] p-4">
          <img src={logo} alt="Logo" className="max-w-[80%] max-h-[80%] object-contain" />
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
                { id: "email", label: "Email", type: "email", value: formData.email },
                { id: "password", label: "Password", type: "password", value: formData.password },
                { id: "course", label: "Course", type: "text", value: formData.course },
                { id: "section", label: "Section", type: "text", value: formData.section },
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
                    onChange={handleChange}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    required
                    className="mt-2 px-4 py-2 text-base border-2 bg-[#d6e4f0] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  {field.id === "surname" && formData.name && formData.surname && (
                    <p className="text-sm text-green-700 mt-1">
                      Your email will be: <strong>{formData.email}</strong>
                    </p>
                  )}
                </div>
              ))}

              {/* Organization Selections and Image Upload kept unchanged */}
              {/* ... (same as your existing component) */}

              <div className="flex flex-col">
                <label className="text-lg text-[#3a1078] font-medium">Upload Image</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="mt-2 px-4 py-2 bg-[#d6e4f0] border-2 border-gray-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 font-bold bg-[#3a1078] text-white rounded-lg hover:bg-[#4e31aa] transition duration-300 uppercase"
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
