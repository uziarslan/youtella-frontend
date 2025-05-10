import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import creditCard from "../Assets/images/credit-card.svg";
import creditCardError from "../Assets/images/credit-card-error.svg";

import axiosInstance from "../services/axiosInstance";

export default function Success() {
    const [status, setStatus] = React.useState("loading");
    const [errorMessage, setErrorMessage] = React.useState("");
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyCheckout = async () => {
            const queryParams = new URLSearchParams(location.search);
            const sessionId = queryParams.get("session_id");

            if (!sessionId) {
                setStatus("error");
                setErrorMessage("Missing session ID. Please try again.");
                return;
            }

            const lockKey = `verifying_${sessionId}`;

            // If already verifying this session, abort
            if (sessionStorage.getItem(lockKey)) {
                console.warn("Duplicate verification blocked by session lock.");
                return;
            }

            // Set lock immediately to block duplicate triggers
            sessionStorage.setItem(lockKey, "true");

            try {
                const response = await axiosInstance.post("/api/stripe/checkout-success", {
                    sessionId,
                });

                setStatus("success");

                // Navigate after a short delay
                setTimeout(() => {
                    const userId = response.data.userId;
                    navigate(userId ? `/chat/${userId}` : "/login");
                }, 3000);

            } catch (err) {
                setStatus("error");
                setErrorMessage(
                    err.response?.data?.error ||
                    "Failed to verify your subscription. Please contact support."
                );
            }
        };

        verifyCheckout();
    }, [navigate, location.search]);

    return (
        <div className="page-container">
            <div className="body-container">
                {status === "loading" && (
                    <>
                        <img src={creditCard} alt="Credit Card" />
                        <h1 className="text-2xl font-bold mb-4">Processing...</h1>
                        <p className="text-gray-700 mb-4">Verifying your payment. Please wait.</p>
                    </>
                )}
                {status === "success" && (
                    <>
                        <img src={creditCard} alt="Credit Card" />
                        <h1 className="text-2xl font-bold mb-4">Thank You</h1>
                        <p className="text-gray-700 mb-4">
                            Payment Done Successfully
                        </p>
                        <sub>You will be redirected to home page shortly
                            or click here to return to home page</sub>
                        <a href="/" className="text-blue-500 hover:underline">
                            Go to Dashboard
                        </a>
                    </>
                )}
                {status === "error" && (
                    <>
                        <img src={creditCardError} alt="Error" />
                        <h1>Error</h1>
                        <p>{errorMessage}</p>
                        <sub>You will be redirected to home page shortly
                            or click here to return to home page</sub>
                        <a href="/pricing">
                            Try Again
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}