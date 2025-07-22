import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../../assets/website/aboutvoys.png";
import Loader from "../Layouts/Loader.jsx";

const apiUrl = import.meta.env.VITE_API_URL;

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${apiUrl}users/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const result = await response.json().catch(() => {
                throw new Error("Invalid response from server.");
            });

            if (!response.ok) {
                throw new Error(result.message || "Invalid or expired token.");
            }

            // ✅ Clear any potentially stored session data
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setMessage("✅ Password reset successful. Redirecting to login...");
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen h-screen flex items-center justify-center bg-[#3a1078] p-4 relative">
            <div className="bg-[#f7f7f8] flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden max-w-7xl w-full h-auto md:h-[80vh]">
                <div className="w-full md:w-1/2 h-[50vh] md:h-auto flex items-center justify-center bg-[#f7f7f8]">
                    <img
                        src={logo}
                        alt="Logo"
                        className="max-w-[80%] max-h-[80%] object-contain"
                    />
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center h-full">
                    <h2 className="text-3xl font-bold text-[#3a1078] mb-4">
                        Reset Your Password
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        Enter a new password for your account.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6 pr-6">
                        <div className="flex flex-col">
                            <label htmlFor="password" className="text-lg text-black">
                                New Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                className="mt-2 px-5 py-4 text-m border-2 bg-[#d6e4f0] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 mt-6 font-bold bg-[#3a1078] text-white rounded-full hover:bg-[#4e31aa] transition duration-300 text-m uppercase"
                        >
                            Reset Password
                        </button>
                    </form>
                    {message && (
                        <p
                            className={`mt-4 text-center text-sm ${
                                message.includes("successful")
                                    ? "text-green-600"
                                    : "text-red-500"
                            }`}
                        >
                            {message}
                        </p>
                    )}
                </div>
            </div>
            {loading && <Loader />}
        </div>
    );
};

export default ResetPassword;
