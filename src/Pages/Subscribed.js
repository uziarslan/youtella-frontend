import React, { useState, useContext, useCallback, useEffect } from 'react';
import Sidebar from '../Components/Sidebar';
import Interaction from '../Components/Interaction';
import Settings from '../Components/Settings';
import axiosInstance from '../services/axiosInstance';
import { AuthContext } from '../Context/AuthContext';
import profile from '../Assets/images/profile.png';

export default function Subscribed() {
    const [activeComponent, setActiveComponent] = useState('interaction');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedSummary, setSelectedSummary] = useState(null);
    const [resetKey, setResetKey] = useState(0);
    const [summaryGenerationCounter, setSummaryGenerationCounter] = useState(0);
    const [profileImage, setProfileImage] = useState(profile);

    const { user } = useContext(AuthContext);

    const isMobile = window.innerWidth <= 768;

    // Initialize profileImage with user?.profileImage?.path or default
    useEffect(() => {
        setProfileImage(user?.profileImage?.path || profile);
    }, [user]);

    const handleStartNew = () => {
        setActiveComponent('interaction');
        setSelectedSummary(null);
        setResetKey(prev => prev + 1);
        setIsSidebarOpen(false);
    };

    const handleSettingsClick = () => {
        setActiveComponent('settings');
        setIsSidebarOpen(false);
    };

    const handleGoBack = () => {
        setActiveComponent('interaction');
    };

    const handleSummarySelect = useCallback(async (summaryId) => {
        try {
            const response = await axiosInstance.get(`/api/summary/${summaryId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSelectedSummary(response.data);
            setActiveComponent('interaction');
            setIsSidebarOpen(false);
        } catch (error) {
            console.error('Failed to fetch summary:', error);
        }
    }, []);

    const handleSummaryGenerated = () => {
        setSummaryGenerationCounter(prev => prev + 1);
    };

    return (
        <div className="app-container max-width">
            {(isMobile && !isSidebarOpen) && (
                <button
                    className="sidebar-toggle"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <i className='bx bx-menu'></i>
                </button>
            )}
            <Sidebar
                onStartNew={handleStartNew}
                onSettingsClick={handleSettingsClick}
                onSummarySelect={handleSummarySelect}
                onSummaryGenerated={summaryGenerationCounter}
                isMobileOpen={isSidebarOpen}
                user={user}
                profileImage={profileImage}
                onClose={() => setIsSidebarOpen(false)}
            />

            {isMobile && isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="main-content">
                {activeComponent === 'interaction' ? (
                    <Interaction
                        key={resetKey}
                        subHeading="Supported format: YouTube, Zoom recorded meetings"
                        subscription={user.subscriptionStatus}
                        selectedSummary={selectedSummary}
                        onSummaryGenerated={handleSummaryGenerated}
                    />
                ) : (
                    <Settings
                        handleGoBack={handleGoBack}
                        user={user}
                        profileImage={profileImage}
                        setProfileImage={setProfileImage}
                    />
                )}
            </div>
        </div>
    );
}