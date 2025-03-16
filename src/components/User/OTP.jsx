import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

const OTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Pre-fill email from state (and disable editing)
  const [email] = useState(location.state?.email?.trim().toLowerCase() || "");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Join and trim the OTP digits
    const finalOtp = otp.join("").trim();
    // Log the final values to be sent
    console.log("Final Email to send:", email);
    console.log("Final OTP to send:", finalOtp);

    try {
      await axios.post(`${apiUrl}users/verify-otp`, { 
        email, 
        otp: finalOtp 
      });
      toast.success("Email verified successfully!", { autoClose: 2000 });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("OTP verification failed:", error.response?.data || error.message);
      toast.error(error.response?.data || "OTP verification failed.", { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Verification Code</h2>
        <p className="text-gray-600 mb-4">Enter the code sent to your email.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-lg font-medium">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              disabled
              className="px-4 py-2 border rounded w-full bg-gray-200"
            />
          </div>
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                className="w-12 h-12 border rounded text-center text-lg"
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg mt-4 hover:bg-green-700"
          >
            {loading ? "Verifying..." : "Confirm Code"}
          </button>
        </form>
        <button className="mt-4 text-blue-600 hover:underline">Resend Code</button>
      </div>
    </div>
  );
};

export default OTP;
