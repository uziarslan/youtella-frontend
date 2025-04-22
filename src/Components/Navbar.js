import React, { useContext } from "react";
import { Link } from "react-router-dom";
import logo from "../Assets/images/logo.png";
import { AuthContext } from "../Context/AuthContext"; // Adjust path as per your setup

export default function Navbar() {
    const { user } = useContext(AuthContext); // Access user and logout from AuthContext

    return (
        <nav className="navbar navbar-expand-lg max-width">
            <div className="container-fluid">
                <Link to="/">
                    <img src={logo} alt="Logo" className="logo" />
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <div className="navButtons ms-auto">
                        {/* Conditional rendering based on user login and subscription status */}
                        {user ? (
                            <>
                                {user?.subscriptionStatus === "free" && (
                                    <Link to="/pricing">
                                        <button className="go-premium">Get Premium</button>
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link to="/">
                                    <button className="login">Login</button>
                                </Link>
                                <Link to="/signup">
                                    <button className="signup">Sign Up</button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}