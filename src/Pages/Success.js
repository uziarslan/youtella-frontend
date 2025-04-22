import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import creditCard from "../Assets/images/credit-card.svg";
import creditCardError from "../Assets/images/credit-card-error.svg";

import axiosInstance from "../services/axiosInstance";

export default function Success() {
    const [status, setStatus] = React.useState("loading");
    const [errorMessage, setErrorMessage] = React.useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const isProcessingRef = useRef(false);
    const hasVerifiedRef = useRef(false);

    useEffect(() => {
        const verifyCheckout = async () => {
            if (hasVerifiedRef.current) {
                return;
            }

            if (isProcessingRef.current) {
                return;
            }
            isProcessingRef.current = true;
            hasVerifiedRef.current = true;

            const queryParams = new URLSearchParams(location.search);
            const sessionId = queryParams.get("session_id");

            if (!sessionId) {
                setStatus("error");
                setErrorMessage("Missing session ID. Please try again.");
                isProcessingRef.current = false;
                return;
            }

            const processedSessions = JSON.parse(localStorage.getItem("processedSessions") || "[]");
            if (processedSessions.includes(sessionId)) {
                setStatus("success");
                isProcessingRef.current = false;
                return;
            }

            try {
                const response = await axiosInstance.post("/api/stripe/checkout-success", {
                    sessionId,
                });

                setStatus("success");

                processedSessions.push(sessionId);
                localStorage.setItem("processedSessions", JSON.stringify(processedSessions));

                setTimeout(() => {
                    const userId = response.data.userId;
                    if (userId) {
                        navigate(`/chat/${userId}`);
                    } else {
                        navigate("/");
                    }
                }, 3000);

            } catch (err) {
                setStatus("error");
                setErrorMessage(
                    err.response?.data?.error ||
                    "Failed to verify your subscription. Please contact support."
                );

                processedSessions.push(sessionId);
                localStorage.setItem("processedSessions", JSON.stringify(processedSessions));
            } finally {
                isProcessingRef.current = false;
            }
        };

        verifyCheckout();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

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