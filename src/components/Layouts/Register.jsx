import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaGoogle } from "react-icons/fa";
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
    role: "",
    organization: "",
    department: "",
    course: "",
    section: "",
    image: null,
    isAdmin: false,
    isOfficer: false,
    isHead: false,
    declined: false,
    warningCount: 0,
    commentCooldown: null,
  });

  const [organizations, setOrganizations] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
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
    setFormData({ ...formData, [name]: value });

    if (name === "organization") {
      const selectedOrganizationName = organizations.find(
        (org) => org._id === value
      )?.name;
      let department = "";
      let newIsDisabled = true;

      switch (selectedOrganizationName) {
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
          department = "";
          newIsDisabled = false;
      }

      setFormData((prevData) => ({
        ...prevData,
        department: department,
      }));
      setIsDisabled(newIsDisabled);
    }
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        autoClose: 1000,
      });
      setTimeout(() => {
        navigate("/login");
      }, 3000);
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3a1078] p-4">
      <div className="bg-[#f7f7f8] h-64 md:h-[70vh] sm:h-[120vh] flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden w-full max-w-7xl">
        <div className="w-full md:w-1/2 h-56 md:h-auto flex items-center justify-center bg-[#f7f7f8] p-4">
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
                {
                  id: "name",
                  label: "Name",
                  type: "text",
                  value: formData.name,
                },
                {
                  id: "surname",
                  label: "Surname",
                  type: "text",
                  value: formData.surname,
                },
                {
                  id: "email",
                  label: "Email",
                  type: "email",
                  value: formData.email,
                },
                {
                  id: "password",
                  label: "Password",
                  type: "password",
                  value: formData.password,
                },
                {
                  id: "course",
                  label: "Course",
                  type: "text",
                  value: formData.course,
                },
                {
                  id: "section",
                  label: "Section",
                  type: "text",
                  value: formData.section,
                },
              ].map((field) => (
                <div key={field.id} className="flex flex-col">
                  <label
                    htmlFor={field.id}
                    className="text-lg text-[#3a1078] font-medium"
                  >
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
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "role", label: "Role", options: ["User", "Officer"] },
                  {
                    id: "organization",
                    label: "Organization",
                    options: organizations.map((org) => ({
                      value: org._id,
                      label: org.name,
                    })),
                  },
                  {
                    id: "department",
                    label: "Department",
                    options: [
                      "Electrical and Allied Department",
                      "Mechanical and Allied Department",
                      "Civil and Allied Department",
                      "Basic Arts and Sciences Department",
                    ],
                  },
                ].map(({ id, label, options }) => (
                  <div key={id} className="flex flex-col">
                    <label
                      htmlFor={id}
                      className="text-lg text-[#3a1078] font-medium"
                    >
                      {label}
                    </label>
                    <select
                      id={id}
                      name={id}
                      value={formData[id]}
                      onChange={handleChange}
                      required
                      className="mt-2 px-4 py-2 text-base bg-[#d6e4f0] border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="" disabled>
                        Select {label.toLowerCase()}
                      </option>
                      {options.map((opt) => (
                        <option key={opt.value || opt} value={opt.value || opt}>
                          {opt.label || opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="image"
                  className="text-lg text-[#3a1078] font-medium"
                >
                  Upload Image
                </label>
                <input
                  type="file"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="mt-2 px-4 py-2 text-base bg-[#d6e4f0] border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 font-bold bg-[#3a1078] text-white rounded-lg hover:bg-[#4e31aa] transition duration-300 text-base uppercase"
              >
                Register
              </button>

              <button
                type="button"
                onClick={() => alert("Google login not implemented yet")}
                className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 text-base font-bold flex items-center justify-center"
              >
                <FaGoogle className="w-5 h-5 mr-2" />
                Register with Google
              </button>
            </form>
          </div>
          <Link
            to="/login"
            className="mt-4 text-center text-[#3a1078] hover:underline"
          >
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