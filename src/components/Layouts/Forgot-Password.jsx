import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../../assets/website/aboutvoys.png";
import Loader from "../Layouts/Loader.jsx";

const apiUrl = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(`${apiUrl}users/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setMessage("Reset link sent! Please check your email.");
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen h-screen flex items-center justify-center bg-[#3a1078] p-4 relative">
            <div className="bg-[#f7f7f8] flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden max-w-7xl w-full h-auto md:h-[80vh]">
                <div className="w-full md:w-1/2 h-[70vh] md:h-auto flex items-center justify-center bg-[#f7f7f8]">
                    <img
                        src={logo}
                        alt="Logo"
                        className="max-w-[80%] max-h-[80%] object-contain"
                    />
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center h-full">
                    <h2 className="text-4xl font-bold text-[#3a1078] mb-4">
                        Forgot your password?
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        Enter your email to receive a reset link.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6 pr-6">
                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-lg text-black">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="mt-2 px-5 py-4 text-m border-2 bg-[#d6e4f0] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 mt-6 font-bold bg-[#3a1078] text-white rounded-full hover:bg-[#4e31aa] transition duration-300 text-m uppercase"
                        >
                            Send Reset Link
                        </button>
                    </form>

                    {message && <p className="mt-4 text-green-600">{message}</p>}
                    {error && <p className="mt-4 text-red-600">{error}</p>}

                    <div className="mt-4 text-center text-[#3a1078]">
                        <p>
                            Remembered your password?{" "}
                            <strong className="text-red-500">
                                <a href="/login">Login</a>
                            </strong>
                        </p>
                    </div>
                </div>
            </div>

            {loading && <Loader />}
        </div>
    );
};

export default ForgotPassword;
