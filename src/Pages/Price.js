import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import check from "../Assets/images/check.svg";
import cross from "../Assets/images/cross.svg";
import axiosInstance from "../services/axiosInstance";

export default function Price() {
    const [openFeature, setOpenFeature] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const toggleFeature = (feature) => {
        setOpenFeature(openFeature === feature ? null : feature);
    };

    // Handle "Start Premium" button click
    const handleStartPremium = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Use axiosInstance to create checkout session
            const response = await axiosInstance.post("/api/stripe/create-checkout-session");

            // Redirect to Stripe Checkout URL
            window.location.href = response.data.url;
        } catch (err) {
            console.error("Error creating checkout session:", err);
            setError(
                err.response?.data?.error ||
                "Failed to start premium subscription. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Pricing features data (unchanged)
    const features = [
        {
            name: "Summaries per day",
            free: "3",
            paid: "Unlimited",
            detail: "Get more summaries with a paid plan to never miss out on key insights.",
        },
        {
            name: "Bullet + Paragraph Summary",
            free: true,
            paid: true,
            detail: "Both free and paid users can access summaries in bullet and paragraph formats.",
        },
        {
            name: "Timestamps / Chapters",
            free: false,
            paid: true,
            detail: "Paid users can access timestamps and chapters for easier navigation.",
        },
        {
            name: "Non-YouTube Links (Zoom, etc.)",
            free: false,
            paid: true,
            detail: "Paid users can summarize non-YouTube links like Zoom recordings.",
        },
        {
            name: "Copy to Clipboard",
            free: true,
            paid: true,
            detail: "Easily copy summaries to your clipboard on both plans.",
        },
        {
            name: "Email Summary to Self",
            free: true,
            paid: true,
            detail: "Email summaries directly to yourself for quick access.",
        },
        {
            name: "Download PDF",
            free: false,
            paid: true,
            detail: "Paid users can download summaries as PDFs for offline access.",
        },
        {
            name: "Save & Reaccess Summaries",
            free: false,
            paid: true,
            detail: "Save and reaccess your summaries anytime with a paid plan.",
        },
        {
            name: "Ads Free",
            free: false,
            paid: true,
            detail: "Enjoy an ad-free experience with a paid plan.",
        },
        {
            name: "Multilingual Support",
            free: false,
            paid: true,
            detail: "Paid users can summarize content in multiple languages.",
        },
        {
            name: "Custom Summary Options",
            free: false,
            paid: true,
            detail: "Customize summary length, tone, and language with a paid plan.",
        },
        {
            name: "Chatbot Integration",
            free: false,
            paid: true,
            detail: "Interact with a chatbot for additional insights on paid plans.",
        },
    ];

    return (
        <>
            <Navbar />
            <div className="pricing-body">
                <div className="pricing-table">
                    <div style={{ backgroundColor: "#F6FAFF" }} className="row align-items-center border-bottom-custom">
                        <div className="col-12 col-md-4">
                            <div className="column-content"></div>
                        </div>
                        <div className="col-6 col-md-4 text-center p-3">
                            <div className="column-content">
                                <h3 className="table-heading">Free</h3>
                            </div>
                        </div>
                        <div style={{ backgroundColor: "#fff" }} className="col-6 col-md-4 text-center p-3">
                            <div className="column-content">
                                <h3 className="table-heading">Paid User ($5.99/month)</h3>
                            </div>
                        </div>
                    </div>
                    {features.map((feature, index) => (
                        <div className="row" key={index}>
                            <div style={{ backgroundColor: "#F6FAFF" }} className="col-12 col-md-4 feature-name feature-row px-3">
                                <div className="column-content">
                                    <div className="feature-toggle" onClick={() => toggleFeature(index)}>
                                        <i className={`bx bxs-chevron-${openFeature === index ? "down" : "right"}`}></i>
                                        <span>{feature.name}</span>
                                    </div>
                                    <div
                                        className={`feature-detail ${openFeature === index ? "open" : ""}`}
                                    >
                                        <p>{feature.detail}</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ backgroundColor: "#F6FAFF" }} className="col-6 col-md-4 text-center feature-row">
                                <div className="column-content">
                                    {typeof feature.free === "boolean" ? (
                                        feature.free ? (
                                            <span className="check">
                                                <img src={check} alt="Check" />
                                            </span>
                                        ) : (
                                            <span className="cross">
                                                <img src={cross} alt="Cross" />
                                            </span>
                                        )
                                    ) : (
                                        <span className="feature-detail-text">{feature.free}</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ backgroundColor: "#fff" }} className="col-6 col-md-4 text-center feature-row">
                                <div className="column-content">
                                    {typeof feature.paid === "boolean" ? (
                                        feature.paid ? (
                                            <span className="check">
                                                <img src={check} alt="Check" />
                                            </span>
                                        ) : (
                                            <span className="cross">
                                                <img src={cross} alt="Cross" />
                                            </span>
                                        )
                                    ) : (
                                        <span className="feature-detail-text">{feature.paid}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="row">
                        <div className="col-12 text-center p-0">
                            <button
                                className="start-premium-btn"
                                onClick={handleStartPremium}
                                disabled={isLoading}
                            >
                                Start Premium
                            </button>
                            {error && <p className="error-message" style={{ color: "red", marginTop: "10px" }}>{error}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}