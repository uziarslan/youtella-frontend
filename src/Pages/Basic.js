import React, { useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Interaction from '../Components/Interaction';
import { AuthContext } from '../Context/AuthContext'; // Adjust path as per your setup

export default function Basic() {
    const { id } = useParams(); // Get the :id from the URL
    const { user, isLoading } = useContext(AuthContext); // Get user and isLoading
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            navigate("/");
        } else if (user._id !== id) {
            navigate("/");
        }

    }, [user, id, navigate, isLoading]);

    if (!user || user._id !== id) {
        return null;
    }

    return (
        <>
            <Navbar />
            <div className="basic-body">
                <Interaction subHeading="Supported format: Youtube" subscription={user.subscriptionStatus} />
            </div>
        </>
    );
}