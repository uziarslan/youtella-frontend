import React, { useState, useContext, useEffect } from "react";
import forgot from "../Assets/images/forgot.png";
import arrowLeft from "../Assets/images/arrow-left.svg";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { AuthContext } from "../Context/AuthContext"; // Adjust path as needed

export default function Forgot() {
    const [captchaToken, setCaptchaToken] = useState("");
    const [formData, setFormData] = useState({
        email: "",
    });
    const [message, setMessage] = useState({});

    const { isLoading, setIsLoading } = useContext(AuthContext);

    useEffect(() => {
        setIsLoading(false);
    }, [setIsLoading]);

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage({});
        setIsLoading(true);
        const { email } = formData;

        // Validation
        if (!email) {
            setMessage({ error: "Email is required." });
            return;
        }

        // Simulate API call
        console.log("Sending password reset link to:", { ...formData, captchaToken });
        setIsLoading(false);
    }
    return (
        <>
            <div className="authContainer max-width">
                <div className="row align-items-center w-100">
                    <div className="col-lg-6 align-items-center justify-content-center d-none d-lg-flex">
                        <img
                            src={forgot}
                            alt="Placeholder"
                            className="img-fluid"
                        />
                    </div>
                    <div className="col-lg-6">
                        <Link to="/">
                            <button className="backBtn mb-5">
                                <img src={arrowLeft} alt="Back Button" />
                            </button>
                        </Link>
                        <h1 className="mb-4 authHeading">Forgot Password</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <input name="email" required disabled={isLoading} onChange={handleChange} value={formData.email} className="authInputs" placeholder="Enter your email address" type="email" />
                            </div>
                            <div className="mb-4">
                                <ReCAPTCHA
                                    sitekey="6LdwQywrAAAAAEYV5i3Hj8Qgr6rfHNLq7FoR_YBO"
                                    onChange={handleCaptchaChange}
                                />
                            </div>
                            {message.error && <p className="error">{message.error}</p>}
                            <button disabled={isLoading} type="submit" className="submitBtn">{isLoading ? "Please wait..." : "Continue"}</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}