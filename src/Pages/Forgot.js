import React, { useState, useContext, useEffect } from "react";
import forgot from "../Assets/images/forgot.png";
import arrowLeft from "../Assets/images/arrow-left.svg";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { AuthContext } from "../Context/AuthContext";
import axiosInstance from "../services/axiosInstance";

export default function Forgot() {
    const [captchaToken, setCaptchaToken] = useState("");
    const [formData, setFormData] = useState({
        username: "",
    });
    const [message, setMessage] = useState({});

    const { isLoading, setIsLoading } = useContext(AuthContext);
    const navigate = useNavigate();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({});
        setIsLoading(true);
        const { username } = formData;

        // Validation
        if (!username) {
            setMessage({ error: "Email is required." });
            return;
        }

        try {
            const { data } = await axiosInstance.post("/api/auth/user/forgot-password", { ...formData, captcha: captchaToken });

            setMessage({ success: data.success });

            setTimeout(() => {
                navigate(`/verify-code?token=${data.resetToken}`);
            }, 3000)

            setIsLoading(false);

        } catch (error) {
            setIsLoading(false);
            if (error.response && error.response.data) {
                setMessage({ error: error.response.data.error });
            } else {
                setMessage({ error: "An unexpected error occurred." });
            }
        } finally {
            setIsLoading(false);
            setFormData({
                username: "",
            });
            setCaptchaToken("");
        }
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
                                <input name="username" required disabled={isLoading} onChange={handleChange} value={formData.email} className="authInputs" placeholder="Enter your email address" type="email" />
                            </div>
                            <div className="mb-4">
                                <ReCAPTCHA
                                    sitekey="6LdwQywrAAAAAEYV5i3Hj8Qgr6rfHNLq7FoR_YBO"
                                    onChange={handleCaptchaChange}
                                />
                            </div>
                            {message && <p className={`text-start ${message?.error ? "text-danger" : "text-success"}`}>{message.error || message.success}</p>}
                            <button disabled={isLoading} type="submit" className="submitBtn">{isLoading ? "Please wait..." : "Continue"}</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}