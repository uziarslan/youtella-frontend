import React, { useState, useEffect } from "react";
import axiosInstance from "../services/axiosInstance";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import cameraIcon from "../Assets/images/camera-icon.svg";
import visa from "../Assets/images/visa.png";
import master from "../Assets/images/master.png";
import creditCard from "../Assets/images/credit-card.svg";
import profile from "../Assets/images/profile.png"
import edit from "../Assets/images/edit.svg";
import back from "../Assets/images/arrow-left.svg";
import Modal from "./Modal";
import PropTypes from 'prop-types';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// Stripe Payment Form Component
const PaymentForm = ({ onSuccess, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
            });

            if (stripeError) {
                setError(stripeError.message);
                setProcessing(false);
                return;
            }

            // Send payment method to your backend
            const { data } = await axiosInstance.post("/api/stripe/update-payment-method", {
                paymentMethodId: paymentMethod.id
            });

            onSuccess(data.message);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update payment method");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>
            {error && <div className="text-danger mb-3">{error}</div>}
            <div className="buttonWrapper">
                <button
                    type="button"
                    className="outlineBtn"
                    onClick={onClose}
                    disabled={processing}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="wholebtn"
                    disabled={!stripe || processing}
                >
                    {processing ? "Processing..." : "Update"}
                </button>
            </div>
        </form>
    );
};

export default function Settings({ handleGoBack, user, profileImage, setProfileImage }) {
    const [formData, setFormData] = useState({
        name: user?.name || "",
        username: user?.username || "",
    });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [cardDetails, setCardDetails] = useState(null);
    const [showCardModal, setShowCardModal] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);

    // Fetch card details on mount
    useEffect(() => {
        const fetchCardDetails = async () => {
            try {
                const { data } = await axiosInstance.get("/api/stripe/payment-method");
                setCardDetails(data.card);
            } catch (err) {
                setError(err.response?.data?.error || "Failed to load card details");
            }
        };

        if (user?.subscriptionStatus === "active") {
            fetchCardDetails();
        }
    }, [user]);

    // Update formData when user prop changes
    useEffect(() => {
        setFormData({
            name: user?.name || "",
            username: user?.username || "",
        });
    }, [user]);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            // Update parent state for immediate preview
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);

            // Prepare form data for backend
            const uploadData = new FormData();
            uploadData.append('profileImage', file);
            uploadData.append('name', formData.name);
            uploadData.append('username', formData.username);

            try {
                // Send the file and user data to the backend
                const { data } = await axiosInstance.put('/api/auth/user', uploadData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Update success message and user data
                setSuccessMessage(data.success || 'Profile updated successfully');
                setFormData({
                    name: data.user.name,
                    username: data.user.username,
                });

                // Clean up object URL
                URL.revokeObjectURL(imageUrl);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to update profile');
                // Revert to user image or default on error
                setProfileImage(user?.profileImage?.path || profile);
                // Clean up object URL
                URL.revokeObjectURL(imageUrl);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setError("");
    };

    const handleBlur = async () => {
        if (!user) return;

        if (formData.name !== user.name || formData.username !== user.username) {
            try {
                const { data } = await axiosInstance.put("/api/auth/user", {
                    name: formData.name,
                    username: formData.username,
                });
                setSuccessMessage(data.success);
            } catch (err) {
                setError(err.response?.data?.error || "Failed to update profile");
            }
        }
    };

    const handleCancelSubscription = async () => {
        try {
            const { data } = await axiosInstance.post("/api/stripe/cancel-subscription");
            setSuccessMessage(data.message);
            setCancelModalOpen(false);
            setCardDetails(null); // Clear card details after cancellation
        } catch (err) {
            setError(err.response?.data?.error || "Failed to cancel subscription");
        }
    };

    const handleUpdateSuccess = (message) => {
        setSuccessMessage(message);
        setShowCardModal(false);
        // Refresh card details
        const fetchCardDetails = async () => {
            try {
                const { data } = await axiosInstance.get("/api/stripe/payment-method");
                setCardDetails(data.card);
            } catch (err) {
                setError(err.response?.data?.error || "Failed to load card details");
            }
        };
        fetchCardDetails();
    };

    return (
        <div className="settingscard">
            {(error || successMessage) && (
                <div className={`form-text text-center mb-2 ${successMessage ? "text-success" : "text-danger"}`}>
                    {successMessage || error}
                </div>
            )}

            <div className="imageUpload">
                <img className="profileImg" src={profileImage} alt="Profile" />
                <label htmlFor="profile" className="upload">
                    <img src={cameraIcon} alt="Upload Button" />
                    <input
                        id="profile"
                        type="file"
                        accept=".png, .jpeg, .jpg"
                        className="d-none"
                        onChange={handleImageUpload}
                    />
                </label>
            </div>

            <div className="formInputs">
                <input
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="name"
                    value={formData.name}
                    type="text"
                    placeholder="Name"
                    className="profileInput"
                />
                <input
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="username"
                    value={formData.username}
                    type="email"
                    placeholder="Email address"
                    className="profileInput"
                />

                {user?.subscriptionStatus === "active" && cardDetails && (
                    <div className="card-input">
                        <span className="visa-logo">
                            <img
                                src={cardDetails.brand === "visa" ? visa : cardDetails.brand === "mastercard" ? master : ""}
                                alt={cardDetails.brand}
                            />
                        </span>
                        <span className="card-number">
                            **** **** **** {cardDetails.last4}
                        </span>
                        <span className="edit-icon">
                            <img
                                src={edit}
                                alt="Edit"
                                onClick={() => setShowCardModal(true)}
                                style={{ cursor: "pointer" }}
                            />
                        </span>
                    </div>
                )}

                {user?.subscriptionStatus === "active" && (
                    <div className="cancelSubscription">
                        <h5 className="cancelSubscriptionText">Cancel Subscription</h5>
                        <p className="cancelSubscriptionSubheading">
                            You can cancel your subscription at any time. You will continue to
                            have access to your account until your current billing period ends. ({cardDetails?.currentPeriodEnd.split("T")[0]})
                        </p>
                        <button
                            className="cacelSubscriptionBtn"
                            onClick={() => setCancelModalOpen(true)}
                        >
                            Cancel Subscription
                        </button>
                    </div>
                )}
            </div>

            <button onClick={handleGoBack} className="backButton">
                <img src={back} alt="Back" />
            </button>

            <Modal
                id="cancelSubscriptionModal"
                show={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
            >
                <div className="alertWrapper">!</div>
                <h5 className="modalText">Are you sure you want to cancel this subscription?</h5>
                <div className="buttonWrapper">
                    <button
                        type="button"
                        className="outlineBtn"
                        onClick={() => setCancelModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="wholebtn"
                        onClick={handleCancelSubscription}
                    >
                        Confirm
                    </button>
                </div>
            </Modal>

            <Modal
                id="updateCardModal"
                show={showCardModal}
                onClose={() => setShowCardModal(false)}
            >
                <div>
                    <div className="d-flex justify-content-center align-items-center">
                        <img src={creditCard} alt="Credit Card" />
                    </div>
                    <h5 className="modalText mb-4 mt-3">Update Payment Method</h5>
                </div>
                <Elements stripe={stripePromise}>
                    <PaymentForm
                        onSuccess={handleUpdateSuccess}
                        onClose={() => setShowCardModal(false)}
                    />
                </Elements>
            </Modal>
        </div>
    );
}

Settings.propTypes = {
    handleGoBack: PropTypes.func.isRequired,
    user: PropTypes.object,
    profileImage: PropTypes.string.isRequired,
    setProfileImage: PropTypes.func.isRequired
};