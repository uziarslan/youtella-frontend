import React from 'react';

export default function Footer() {
    return (
        <footer className="">
            <div className="d-flex justify-content-center justify-content-sm-between flex-wrap gap-3 max-width px-5">
                <div className='d-flex justify-content-between align-items-center gap-3'>
                    <a href="/terms-of-usage" style={{ textDecoration: "none", color: "#666F8D", fontSize: "0.8rem" }}>Terms of Use</a>
                    <a href="/privacy-policy" style={{ textDecoration: "none", color: "#666F8D", fontSize: "0.8rem" }}>Privacy Policy</a>
                </div>
                <div>
                    <h6 style={{ fontSize: "0.9rem", color: "#666F8D" }} className="mb-0 text-center text-sm-start">Contact Us</h6>
                    <a href='mailto:support@youtella.ai' style={{ cursor: "pointer", textDecoration: "none" }} className='d-flex align-items-center gap-1'>
                        <i style={{ fill: "#666F8D", color: "#666F8D", fontSize: "0.8rem" }} className='bx bx-envelope'></i>
                        <p style={{ fontSize: "0.8rem", color: "#666F8D" }} className="my-0">support@youtella.ai</p>
                    </a>
                </div>
            </div>
            <p style={{ fontSize: "0.6rem", color: "#979797" }} className='text-center py-2'>&copy; 2025 Youtella. All rights reserved</p>
        </footer>
    );
}