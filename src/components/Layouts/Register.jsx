import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaGoogle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    role: '',
    organization: '',
    department: '',
    course: '',
    section: '',
    image: null,
    isAdmin: false,
    isOfficer: false,
    warningCount: 0,
    commentCooldown: null,
  });

  const [organizations, setOrganizations] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await axios.get(`${apiUrl}organizations/`);
        setOrganizations(response.data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };

    fetchOrganizations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'organization') {
      const selectedOrganization = organizations.find(org => org._id === value)?.name;
      let department = '';
      let newIsDisabled = true;

      switch (selectedOrganization) {
        case 'ACES':
        case 'GreeCS':
          department = 'CAAD';
          break;
        case 'TEST':
          department = 'BASD';
          break;
        case 'BSEEG':
        case 'IECEP':
        case 'ICS':
        case 'MTICS':
        case 'MRSP':
          department = 'EAAD';
          break;
        case 'ASE':
        case 'DMMS':
        case 'EleMechS':
        case 'JPSME':
        case 'JSHRAE':
        case 'METALS':
        case 'TSNT':
          department = 'MAAD';
          break;
        default:
          department = '';
          newIsDisabled = false;
      }

      setFormData(prevData => ({
        ...prevData,
        department: department
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
      if (key !== 'image') {
        formDataToSend.append(key, formData[key]);
      }
    });
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await axios.post(`${apiUrl}users/register`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Registration successful:', response.data);
      // Redirect or show a success message here
    } catch (error) {
      console.error('Error registering the user:', error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen h-screen flex items-center justify-center bg-[#3a1078] p-4">
  <div className="bg-[#f7f7f8] flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden max-w-7xl w-full h-auto md:h-[80vh]">
    <div className="w-full md:w-1/2 h-64 md:h-auto flex items-center justify-center bg-[#f7f7f8]">
      {/* Add logo if needed */}
    </div>

    {/* Right Side - Register Form */}
    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center h-full">
      <h2 className="text-4xl font-bold text-[#3a1078] mb-4 text-center md:text-left">
        Register to VOYS!
      </h2>
      <p className="text-lg text-[#3a1078] font-medium mb-8 text-center md:text-left">
        Join us and keep your data safe
      </p>
      <form onSubmit={handleSubmit} className="space-y-6 pr-6">
        {/* Name */}
        <div className="flex flex-col">
          <label htmlFor="name" className="text-xl text-[#3a1078]">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
            className="mt-2 px-5 py-4 text-m border-2 bg-[#d6e4f0] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        {/* Surname */}
        <div className="flex flex-col">
          <label htmlFor="surname" className="text-xl text-[#3a1078]">Surname</label>
          <input
            id="surname"
            name="surname"
            type="text"
            value={formData.surname}
            onChange={handleChange}
            placeholder="Enter your surname"
            required
            className="mt-2 px-5 py-4 text-m border-2 bg-[#d6e4f0] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="email" className="text-xl text-[#3a1078]">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            className="mt-2 px-5 py-4 text-m border-2 bg-[#d6e4f0] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        {/* Password */}
        <div className="flex flex-col">
          <label htmlFor="password" className="text-xl text-[#3a1078]">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            className="mt-2 px-5 py-4 text-m bg-[#d6e4f0] border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        {/* Role */}
        <div className="flex flex-col">
          <label htmlFor="role" className="text-xl text-[#3a1078]">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="mt-2 px-5 py-4 text-m bg-[#d6e4f0] border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Select a role</option>
            <option value="user">User</option>
            <option value="officer">Officer</option>
          </select>
        </div>

        {/* Organization */}
        <div className="flex flex-col">
          <label htmlFor="organization" className="text-xl text-[#3a1078]">Organization</label>
          <select
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            required
            className="mt-2 px-5 py-4 text-m bg-[#d6e4f0] border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Select an organization</option>
            {organizations.map((org) => (
              <option key={org._id} value={org._id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
        {/* Department */}
        <div className="flex flex-col">
          <label htmlFor="department" className="text-xl text-[#3a1078]">Department</label>
          <input
            id="department"
            name="department"
            type="text"
            value={formData.department}
            onChange={handleChange}
            placeholder="Enter your department"
            className="mt-2 px-5 py-4 text-m bg-[#d6e4f0] border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        {/* Course */}
        <div className="flex flex-col">
          <label htmlFor="course" className="text-xl text-[#3a1078]">Course</label>
          <input
            id="course"
            name="course"
            type="text"
            value={formData.course}
            onChange={handleChange}
            placeholder="Enter your course"
            className="mt-2 px-5 py-4 text-m bg-[#d6e4f0] border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        {/* Section */}
        <div className="flex flex-col">
          <label htmlFor="section" className="text-xl text-[#3a1078]">Section</label>
          <input
            id="section"
            name="section"
            type="text"
            value={formData.section}
            onChange={handleChange}
            placeholder="Enter your section"
            className="mt-2 px-5 py-4 text-m bg-[#d6e4f0] border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        {/* Image */}
        <div className="flex flex-col">
          <label htmlFor="image" className="text-xl text-[#3a1078]">Image</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            className="mt-2 px-5 py-4 text-m bg-[#d6e4f0] border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 mt-6 font-bold bg-[#3a1078] text-white rounded-lg hover:bg-[#4e31aa] transition duration-300 text-m uppercase"
        >
          Register
        </button>
        <button
          onClick={() => alert('Google login not implemented yet')}
          className="w-full py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 text-m font-bold flex items-center justify-center"
        >
          <FaGoogle className="w-6 h-6 mr-3" />
          Register with Google
        </button>
      </form>

      <Link
        to="/login"
        className="mt-4 text-center text-[#3a1078] hover:underline"
      >
        Already have an account? Login
      </Link>
    </div>
  </div>
</div>

  );
};

export default Register;
