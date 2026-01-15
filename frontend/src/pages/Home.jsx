import { useState } from "react";
import { Lock } from "lucide-react";
import RecordsImage from "../assets/images/records-1.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { showTopSuccessAlert } from "../utils/sweetAlert";
import axiosClient from "../assets/js/axios-client";

export default function Home() {
    const navigate = useNavigate();
    const { setUser, setToken } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        axiosClient
            .post(`/login`, { email, password })
            .then(({ data }) => {
                console.log(data)

                setUser(data.user);
                setToken(data.token);

                if (data.success === true) {
                    showTopSuccessAlert("Login Successful", `Welcome back!`);
                    navigate("/dashboard");
                }
            })
            .catch((err) => {
                const response = err.response;
                if (response) {
                    if (response.status === 422) {
                        setErrors(
                            response.data.errors || {
                                email: [response.data.message],
                            }
                        );
                    } else if (response.status === 403) {
                        setErrors({
                            general: [
                                response.data.message || "Access denied.",
                            ],
                        });
                    } else {
                        setErrors({
                            general: [
                                "An unexpected error occurred. Please try again.",
                            ],
                        });
                    }
                }
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="min-h-screen flex bg-slate-100">
            {/* Left branding */}
            <div className="hidden lg:flex w-1/2 items-center bg-linear-to-br from-gray-700 to-gray-900 text-white p-12">
                <div className="max-w-md mx-auto">
                    <img src={RecordsImage} alt="records image" />
                    <h1 className="text-4xl font-bold mb-4">
                        Digital Records, Simplified
                    </h1>
                    <p className="text-lg opacity-90">
                        Securely manage people, and documents from one place.
                    </p>
                </div>
            </div>

            {/* Right login */}
            <div className="flex w-full lg:w-1/2 items-center justify-center">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-semibold mb-2">
                                Welcome back
                            </h2>
                            <p className="text-gray-500 mb-6">
                                Login to continue
                            </p>
                        </div>
                        <div className="bg-gray-800 p-2 rounded-full text-white text-2xl">
                            <Lock className="text-white text-2xl" />
                        </div>
                    </div>

                    {errors && (
                        <div className="p-2 text-red-500 font-semibold">
                            {Object.keys(errors).map((key) => (
                                <p key={key}>{errors[key][0]}</p>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                placeholder="email@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p className="text-xs text-center text-gray-400 mt-6">
                        © {new Date().getFullYear()} Digital Records System
                    </p>
                </div>
            </div>
        </div>
    );
}
