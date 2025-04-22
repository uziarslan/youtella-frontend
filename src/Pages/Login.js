import React, { useState, useContext, useEffect } from "react";
import loginImg from "../Assets/images/login.png";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext"; // Matching your Signup path

export default function Login() {
    // Single state object for form data
    const [formData, setFormData] = useState({
        username: "", // Email
        password: "",
    });
    const [error, setError] = useState(""); // For validation or API errors

    // Context and navigation
    const { login, isLoading, setIsLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    // Reset isLoading on mount
    useEffect(() => {
        setIsLoading(false);
    }, [setIsLoading]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const { username, password } = formData;

        // Validation
        if (!username || !password) {
            setError("All fields are required.");
            setIsLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
            setError("Please enter a valid email address.");
            setIsLoading(false);
            return;
        }

        try {
            // Call login from AuthContext
            const { data } = await login(formData);
            navigate(`/chat/${data.user._id}`);
        } catch (err) {
            setError(err.response?.data?.error || "Login failed. Please try again.");
            console.error("Login error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="authContainer max-width">
                <div className="row align-items-center w-100">
                    <div className="col-lg-6 align-items-center justify-content-center d-none d-lg-flex">
                        <img src={loginImg} alt="Placeholder" className="img-fluid" />
                    </div>
                    <div className="col-lg-6">
                        <h1 className="mb-4 authHeading">Login</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-2">
                                <input
                                    className="authInputs"
                                    placeholder="Enter your email address"
                                    type="email"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className="mb-2">
                                <input
                                    className="authInputs"
                                    placeholder="Enter password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            {error && <div className="mb-2 form-text text-danger">{error}</div>}
                            <div className="forgotPasswordLinkContainer mb-4">
                                <Link to="/forgot-password" className="forgotPasswordLink">
                                    Forgot Password?
                                </Link>
                            </div>
                            <button type="submit" className="submitBtn" disabled={isLoading}>
                                {isLoading ? "Logging in..." : "Login"}
                            </button>
                            <div className="mt-2">
                                <p className="redirect-link">
                                    Don’t have an account?{" "}
                                    <Link to="/signup" className="loginLink">
                                        Signup
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}