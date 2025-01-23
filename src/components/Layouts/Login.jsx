import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const apiUrl = import.meta.env.VITE_API_URL;

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`https://sentivents-new-backend.onrender.com/api/v1/users/weblogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
  
      const data = await response.json();
      console.log('Login response data:', data); // Log the entire response to debug
      console.log('Is Admin:', data.user.isAdmin); // Check if isAdmin is true
  
      if (data.user) {
        console.log('User data:', data.user); // Log the user object
  
        // Save the JWT token and user details in localStorage
        localStorage.setItem('authToken', data.token);
  
        // Save user details to localStorage
        localStorage.setItem('userData', JSON.stringify({
          name: `${data.user.name} ${data.user.surname}`,
          email: data.user.email,
          organization: data.user.organization,
          department: data.user.department,
          course: data.user.course,
          isAdmin: data.user.isAdmin, // Make sure you're accessing isAdmin from data.user
          userId: data.user.userId // Add the userId here
        }));
        
  
        console.log('User details saved:', data.user); // Log saved user data
      } else {
        console.log('User data not available.');
      }
  
      // Check if the user is an admin
      if (data.user.isAdmin === true && data.token) {
        console.log('Admin logged in, redirecting...');
        navigate('/dashboard/calendar');
      } else {
        alert('You are not an admin.');
      }
  
    } catch (error) {
      alert(error.message || 'Something went wrong');
    }
  };
  
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-300 to-indigo-300">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="text-lg text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              placeholder="Enter your email"
              required
              className="mt-2 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="password" className="text-lg text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Enter your password"
              required
              className="mt-2 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
