import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/axiosInstance';
import gearIcon from "../Assets/images/gear-icon.svg";
import logo from "../Assets/images/logo.png";
import searchIcon from "../Assets/images/search-icon.svg";
import PropTypes from 'prop-types';

export default function Sidebar({ isMobileOpen, onStartNew, onSettingsClick, user, onSummarySelect, onSummaryGenerated, profileImage, onClose }) {
    const [summaries, setSummaries] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [tooltip, setTooltip] = useState({
        text: '',
        visible: false,
        position: { x: 0, y: 0 }
    });

    const fetchSummaries = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/api/summaries');
            setSummaries(response.data);
        } catch (error) {
            console.error('Failed to fetch summaries:', error);
        }
    }, []);

    useEffect(() => {
        fetchSummaries();
    }, [fetchSummaries]);

    useEffect(() => {
        if (onSummaryGenerated) {
            fetchSummaries();
        }
    }, [onSummaryGenerated, fetchSummaries]);

    const filteredSummaries = summaries.filter((summary) =>
        summary.summaryTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSummaryClick = (summaryId) => {
        onSummarySelect(summaryId);
        if (onClose) onClose();
    };

    const handleMouseEnter = (e, text) => {
        const rect = e.target.getBoundingClientRect();
        setTooltip({
            text,
            visible: true,
            position: {
                x: rect.right + 10,  // Show tooltip to the right of the list item
                y: rect.top - 5
            }
        });
    };

    const handleMouseLeave = () => {
        setTooltip(prev => ({ ...prev, visible: false }));
    };


    return (
        <div className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="user">
                    <div className="user-avatar">
                        <img src={profileImage} alt="User Avatar" />
                    </div>
                    <span className="username">{user?.name}</span>
                    <div className="settings-icon" onClick={onSettingsClick}>
                        <img src={gearIcon} alt="Setting Button" />
                    </div>
                </div>
            </div>
            <div className="search-bar">
                <div className='serach-icon-wrapper'>
                    <img src={searchIcon} alt='Search Input' />
                    <input
                        type="text"
                        placeholder="Search for summaries..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>
            <div className="chat-history">
                <h3>SUMMARY HISTORY</h3>
                <ul>
                    {filteredSummaries.length > 0 ? (
                        filteredSummaries.map((summary) => (
                            <li
                                key={summary._id}
                                onClick={() => handleSummaryClick(summary._id)}
                                onMouseEnter={(e) => handleMouseEnter(e, summary.summaryTitle)}
                                onMouseLeave={handleMouseLeave}
                                style={{ cursor: 'pointer' }}
                            >
                                {summary.summaryTitle}
                            </li>
                        ))
                    ) : (
                        <li>No summaries found</li>
                    )}
                </ul>
            </div>
            {tooltip.visible && (
                <div
                    className="custom-tooltip d-none d-md-block"
                    style={{
                        position: 'fixed',
                        left: tooltip.position.x,
                        top: tooltip.position.y,
                    }}
                >
                    {tooltip.text}
                </div>
            )}
            <button className="start-new-btn" onClick={onStartNew}>
                Start new
            </button>
        </div>
    );
}

Sidebar.propTypes = {
    isMobileOpen: PropTypes.bool.isRequired,
    onStartNew: PropTypes.func.isRequired,
    onSettingsClick: PropTypes.func.isRequired,
    user: PropTypes.object,
    onSummarySelect: PropTypes.func.isRequired,
    onSummaryGenerated: PropTypes.number,
    profileImage: PropTypes.string.isRequired,
    onClose: PropTypes.func
};