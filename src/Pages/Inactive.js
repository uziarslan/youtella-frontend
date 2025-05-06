import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Modal from '../Components/Modal';
import FreeTestInteraction from '../Components/FreeTestInteraction';
import { AuthContext } from '../Context/AuthContext';
import Footer from '../Components/Footer';

export default function Inactive() {
    const [canUseInactive, setCanUseInactive] = useState(false);
    const [showTrialModal, setShowTrialModal] = useState(false);
    const [hasGeneratedSummary, setHasGeneratedSummary] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const usedNo = localStorage.getItem('usedNo');
        if (usedNo !== '1') {
            setCanUseInactive(true);
            if (!usedNo) {
                localStorage.setItem('usedNo', '0');
            }
        } else {
            setCanUseInactive(false);
            setShowTrialModal(true);
        }
    }, []);

    const handleSummaryGenerated = () => {
        setHasGeneratedSummary(true);
    };

    const handleGenerateSummaryRequest = () => {
        if (hasGeneratedSummary) {
            localStorage.setItem('usedNo', '1');
            setCanUseInactive(false);
            setShowTrialModal(true);
            return false;
        }
        return true;
    };

    const handleNavigate = (path) => {
        // Store navigation path and trigger modal hide
        setPendingNavigation(path);
        setShowTrialModal(false);
    };

    const handleModalClose = () => {
        // Execute pending navigation after modal fully closes
        if (pendingNavigation) {
            navigate(pendingNavigation);
            setPendingNavigation(null);
        }
        setShowTrialModal(false);
    };

    if (user?._id) {
        navigate(`/chat/${user._id}`);
        return null;
    }

    return (
        <>
            <Navbar />
            <div className="basic-body">
                {canUseInactive && (
                    <FreeTestInteraction
                        subHeading="Supported format: Youtube"
                        subscription="Test"
                        onSummaryGenerated={handleSummaryGenerated}
                        onGenerateSummaryRequest={handleGenerateSummaryRequest}
                    />
                )}
            </div>

            {/* Always render modal but control visibility */}
            <Modal
                id="trialUsedModal"
                show={showTrialModal}
                onClose={handleModalClose}
            >
                <div className="alertWrapper">!</div>
                <h5 className="modalText">Your next 2 summaries are free we'll email them to you so you never lose them.</h5>
                <div className="buttonWrapper">
                    <button
                        type="button"
                        className="outlineBtn"
                        onClick={() => handleNavigate('/login')}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className="wholebtn"
                        onClick={() => handleNavigate('/signup')}
                    >
                        Sign up
                    </button>
                </div>
            </Modal>
            <Footer />
        </>
    );
}