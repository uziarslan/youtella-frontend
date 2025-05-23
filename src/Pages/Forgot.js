import React from "react";
import forgot from "../Assets/images/forgot.png";
import arrowLeft from "../Assets/images/arrow-left.svg";
import { Link } from "react-router-dom";

export default function Forgot() {
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
                        <form>
                            <div className="mb-4">
                                <input className="authInputs" placeholder="Enter your email address" type="email" />
                            </div>
                            <button type="submit" className="submitBtn">Continue</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}