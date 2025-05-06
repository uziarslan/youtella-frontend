import React, { useState, useContext, useEffect } from "react";
import forgot from "../Assets/images/forgot.png";
import arrowLeft from "../Assets/images/arrow-left.svg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import axiosInstance from "../services/axiosInstance";

export default function Newpassword() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState({});

    const { isLoading, setIsLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(false);
    }, [setIsLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({});

        try {
            const { data } = await axiosInstance.post("/api/auth/user/reset-password", { password, resetToken: token });
            setMessage(data);
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        }

        catch (error) {
            setIsLoading(false);
            setMessage(error.response.data);
        }
        finally {
            setIsLoading(false);
            setPassword("");
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
                        <Link to="/login">
                            <button className="backBtn mb-5">
                                <img src={arrowLeft} alt="Back Button" />
                            </button>
                        </Link>
                        <h1 className="mb-4 authHeading">New Password</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <input value={password} onChange={(e) => setPassword(e.target.value)} className="authInputs" placeholder="Enter new password" type="password" />
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