import React, { useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import { AuthContext } from '../Context/AuthContext'; // Adjust path as per your setup
import FreeTestInteraction from '../Components/FreeTestInteraction';

export default function Basic() {
    const { id } = useParams(); // Get the :id from the URL
    const { user, isLoading } = useContext(AuthContext); // Get user and isLoading
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            navigate("/login");
        } else if (user._id !== id) {
            navigate("/login");
        }

    }, [user, id, navigate, isLoading]);

    if (!user || user._id !== id) {
        return null;
    }

    return (
        <>
            <Navbar />
            <div className="basic-body p-3 p-md-0">
                <FreeTestInteraction subHeading="Supported format: Youtube, Upto 100MB of video and 5MB of audio" />
            </div>
        </>
    );
}