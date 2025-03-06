import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/website/v_darkerlogo.png";
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
        autoClose: 3000,
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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3a1078] p-4">
      <div className="bg-[#f7f7f8] flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden max-w-7xl w-full h-auto md:h-[80vh]">
        <div className="hidden md:flex w-1/2 items-center justify-center bg-[#f7f7f8] p-8">
          <img src={logo} alt="Logo" className="max-w-full max-h-full" />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-4xl font-bold text-[#3a1078] text-center md:text-left">
              Register to VOYS!
            </h2>
            <p className="text-lg text-[#3a1078] font-medium text-center md:text-left">
              Join us and keep your data safe
            </p>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[70vh] pr-2">
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
                  <label htmlFor={field.id} className="text-xl text-[#3a1078]">
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
                    className="mt-2 px-4 py-3 text-m border-2 bg-[#d6e4f0] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="role" className="text-xl text-[#3a1078]">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="mt-2 px-4 py-3 text-m bg-[#d6e4f0] border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="" selected disabled>
                      Select a role
                    </option>
                    <option value="user">User</option>
                    <option value="officer">Officer</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="organization"
                    className="text-xl text-[#3a1078]"
                  >
                    Organization
                  </label>
                  <select
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    required
                    className="mt-2 px-4 py-3 text-m bg-[#d6e4f0] border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="" selected disabled>
                      Select an organization
                    </option>
                    {organizations.map((org) => (
                      <option key={org._id} value={org._id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="department"
                    className="text-xl text-[#3a1078]"
                  >
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="mt-2 px-4 py-3 text-m bg-[#d6e4f0] border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="" selected disabled>
                      Select department
                    </option>
                    <option value="Electrical and Allied Department">Electrical and Allied Department</option>
                    <option value="Mechanical and Allied Department">Mechanical and Allied Department</option>
                    <option value="Civil and Allied Department">Civil and Allied Department</option>
                    <option value="Basic Arts and Sciences Department">Basic Arts and Sciences Department</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="image" className="text-xl text-[#3a1078]">
                  Image
                </label>
                <input
                  type="file"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="mt-2 px-4 py-3 text-m bg-[#d6e4f0] border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <button
                type="submit"
                onSubmit={handleSubmit}
                className="w-full py-4 mt-4 font-bold bg-[#3a1078] text-white rounded-lg hover:bg-[#4e31aa] transition duration-300 text-m uppercase"
              >
                Register
              </button>

              <button
                type="button"
                onClick={() => alert("Google login not implemented yet")}
                className="w-full py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 text-m font-bold flex items-center justify-center"
              >
                <FaGoogle className="w-6 h-6 mr-3" />
                Register with Google
              </button>
            </form>
          </div>

          {/* Fixed footer */}
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
