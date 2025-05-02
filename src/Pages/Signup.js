import React, { useState, useContext, useEffect } from "react";
import signup from "../Assets/images/signup.png";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext"; // Adjust path as needed
import ReCAPTCHA from "react-google-recaptcha";


export default function Signup() {
    // Single state object for form data
    const [formData, setFormData] = useState({
        name: "",
        username: "", // Email
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState(""); // For validation or API errors
    const [captchaToken, setCaptchaToken] = useState("");

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    // Context and navigation
    const { register, isLoading, setIsLoading } = useContext(AuthContext);

    useEffect(() => {
        setIsLoading(false);
    }, [setIsLoading]);

    const navigate = useNavigate();

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

        const { name, username, password, confirmPassword } = formData;

        // Validation
        if (!name || !username || !password || !confirmPassword) {
            setError("All fields are required.");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
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
            // Call register from AuthContext
            const { data } = await register({ ...formData, captcha: captchaToken });
            navigate(`/chat/${data.user._id}`);

        } catch (err) {
            setError(err.response?.data?.error || "Signup failed. Please try again.");
            console.error("Signup error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="authContainer max-width">
                <div className="row align-items-center w-100">
                    <div className="col-lg-6 align-items-center justify-content-center d-none d-lg-flex">
                        <img src={signup} alt="Signup Illustration" className="m-auto" />
                    </div>
                    <div className="col-lg-6">
                        <h1 className="mb-4 authHeading">Sign Up</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-2">
                                <input
                                    className="authInputs"
                                    placeholder="Enter your name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
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
                            <div className={`mb-${error ? "2" : "4"}`}>
                                <input
                                    className="authInputs"
                                    placeholder="Re-enter password"
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <ReCAPTCHA
                                className="mb-3"
                                sitekey="6LdwQywrAAAAAEYV5i3Hj8Qgr6rfHNLq7FoR_YBO"
                                onChange={handleCaptchaChange}
                            />
                            {error && <div className="mb-4 form-text text-danger">{error}</div>}
                            <button
                                type="submit"
                                className="submitBtn"
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating account..." : "Create account"}
                            </button>
                            <div className="mt-2">
                                <p className="redirect-link">
                                    Already have an account?{" "}
                                    <Link to="/login" className="loginLink">
                                        Login
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