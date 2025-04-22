import React from "react";
import creditCardError from "../Assets/images/credit-card-error.svg";
export default function Cancel() {
    return (
        <div className="page-container">
            <div className="body-container">
                <img src={creditCardError} alt="Credit Card" />
                <h1 className="text-2xl font-bold mb-4">Thank You</h1>
                <p className="text-gray-700 mb-4">Payment cancled Successfully</p>
                <sub>You will be redirected to home page shortly
                    or click here to return to home page</sub>
                <a href="/pricing">Go to Dashboard</a>
            </div>
        </div>
    );
}