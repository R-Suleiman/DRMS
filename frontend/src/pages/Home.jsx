import { useState } from "react";
import { FileWarning, Lock, Mail, RotateCcw } from "lucide-react";
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
    const [otpCode, setOtpCode] = useState("");
    const [otpToken, setOtpToken] = useState("");
    const [stage, setStage] = useState("login");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState("");
    const [infoMessage, setInfoMessage] = useState("");

    const formatErrors = (response) => {
        if (!response) {
            setErrors({
                general: ["An unexpected error occurred. Please try again."],
            });
            return;
        }

        if (response.status === 422) {
            setErrors(
                response.data.errors || { general: [response.data.message] },
            );
        } else if (response.status === 403) {
            setErrors({ general: [response.data.message || "Access denied."] });
        } else {
            setErrors({
                general: ["An unexpected error occurred. Please try again."],
            });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors("");
        setInfoMessage("");

        axiosClient
            .post(`/login`, { email, password })
            .then(({ data }) => {
                if (!data.success) {
                    // Handle failed login from body since Apache strips status codes
                    setErrors({ general: [data.message || "Invalid Credentials"] });
                    return;
                }
                if (data.two_factor_required) {
                    setOtpToken(data.otp_token);
                    setInfoMessage(
                        "A one-time verification code has been sent to your email.",
                    );
                    setStage("verify");
                } else {
                    setUser(data.user);
                    setToken(data.token);
                    showTopSuccessAlert("Login Successful", `Welcome back!`);
                    navigate("/dashboard");
                }
            })
            .catch((err) => {
                const response = err.response;
                formatErrors(response);
            })
            .finally(() => setLoading(false));
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors("");
        setInfoMessage("");

        axiosClient
            .post(`/login/verify-otp`, {
                email,
                otp_code: otpCode,
                otp_token: otpToken,
            })
            .then(({ data }) => {
                setUser(data.user);
                setToken(data.token);
                showTopSuccessAlert("Login Successful", `Welcome back!`);
                navigate("/dashboard");
            })
            .catch((err) => {
                const response = err.response;
                formatErrors(response);
            })
            .finally(() => setLoading(false));
    };

    const handleResend = async () => {
        setLoading(true);
        setErrors("");
        setInfoMessage("");

        axiosClient
            .post(`/login/resend-otp`, { email })
            .then(({ data }) => {
                setOtpToken(data.otp_token);
                setInfoMessage(
                    "A new verification code has been sent to your email.",
                );
            })
            .catch((err) => {
                const response = err.response;
                formatErrors(response);
            })
            .finally(() => setLoading(false));
    };

    const backToLogin = () => {
        setStage("login");
        setOtpCode("");
        setOtpToken("");
        setInfoMessage("");
        setErrors("");
    };

    return (
        <div className="min-h-screen flex bg-slate-100">
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

            <div className="flex w-full lg:w-1/2 items-center justify-center">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-semibold mb-2">
                                {stage === "login"
                                    ? "Welcome back"
                                    : "Two-factor authentication"}
                            </h2>
                            <p className="text-gray-500 mb-6">
                                {stage === "login"
                                    ? "Login to continue"
                                    : "Enter the code sent to your email."}
                            </p>
                        </div>
                        <div className="bg-gray-800 p-2 rounded-full text-white text-2xl">
                            <Lock className="text-white text-2xl" />
                        </div>
                    </div>

                    {infoMessage && (
                        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                                <Mail className="text-slate-500" />
                                <span>{infoMessage}</span>
                            </div>
                        </div>
                    )}

                    {errors && (
                        <div className="p-2 text-red-500 font-semibold">
                            {Object.keys(errors).map((key) => (
                                <p
                                    key={key}
                                    className="border bg-red-600 rounded-md p-2 w-full text-white flex items-center text-sm space-x-2"
                                >
                                    <div className="text-xs">
                                        <FileWarning />
                                    </div>
                                    <span>{errors[key][0]}</span>
                                </p>
                            ))}
                        </div>
                    )}

                    {stage === "login" ? (
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
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
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
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                    placeholder="123456"
                                />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={loading}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Resend code
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center justify-center rounded-lg bg-gray-600 px-5 py-2.5 text-white transition hover:bg-gray-700 disabled:opacity-50"
                                >
                                    {loading ? "Verifying..." : "Verify"}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={backToLogin}
                                className="text-sm text-slate-500 hover:text-slate-700"
                            >
                                Back to login
                            </button>
                        </form>
                    )}

                    <p className="text-xs text-center text-gray-400 mt-6">
                        © {new Date().getFullYear()} Digital Records System
                    </p>
                </div>
            </div>
        </div>
    );
}
