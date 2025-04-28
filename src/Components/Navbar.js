import React, { useContext, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../Assets/images/logo.png";
import { AuthContext } from "../Context/AuthContext";

export default function Navbar() {
    const { user } = useContext(AuthContext);
    const collapseRef = useRef(null);

    const closeNavbar = () => {
        if (collapseRef.current) {
            collapseRef.current.classList.remove("show");
        }
    };

    return (
        <nav className="navbar navbar-expand-lg max-width">
            <div className="container-fluid">
                <Link to={user?._id ? `/chat/${user._id}` : "/"}>
                    <img src={logo} alt="Logo" className="logo" />
                </Link>
                {user?.subscriptionStatus !== "active" ? (
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                        onClick={closeNavbar} // Optional: Ensure manual close on click
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                ) : null}
                <div
                    className="navbar-collapse mt-4 mt-lg-0 collapse"
                    id="navbarNav"
                    ref={collapseRef}
                >
                    <div className="navButtons ms-auto navbar-nav">
                        {user ? (
                            <>
                                {user?.subscriptionStatus === "free" && (
                                    <Link
                                        className="nav-link p-0"
                                        to="/pricing"
                                        onClick={closeNavbar}
                                    >
                                        <button className="go-premium">Get Premium</button>
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link
                                    className="nav-link p-0"
                                    to="/login"
                                    onClick={closeNavbar}
                                >
                                    <button className="login">Login</button>
                                </Link>
                                <Link
                                    className="nav-link p-0"
                                    to="/signup"
                                    onClick={closeNavbar}
                                >
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