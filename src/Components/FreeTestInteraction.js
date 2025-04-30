import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import diamondIcon from "../Assets/images/diamond-icon.svg";
import documentIcon from "../Assets/images/document.svg";
import xIcon from "../Assets/images/x-icon.svg";
import PropTypes from "prop-types";
import audioSvg from "../Assets/images/audio.svg";


export default function FreeTestInteraction({ subHeading, subscription, onSummaryGenerated, onGenerateSummaryRequest }) {
    const [videoUrl, setVideoUrl] = useState("");
    const [expand, setExpand] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const [summary, setSummary] = useState({});
    const [message, setMessage] = useState({});
    const [copyText, setCopyText] = useState(false);
    const [shareableLink, setShareableLink] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [fileInputType, setFileInputType] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [previewKey, setPreviewKey] = useState(0);
    const [fileType, setFileType] = useState(null);


    const dropdownRefs = useRef({});
    const summaryTextRef = useRef(null);

    const handleUrlChange = (e) => {
        setVideoUrl(e.target.value);
        setShowSummary(false);
        setSummary({});
        setMessage({});
        setProgress(0);
        setEstimatedTime(0);
        setShareableLink(""); // Reset shareable link
    };

    const handleGetSummary = async (event) => {
        event.preventDefault();
        setMessage({});
        setShowSummary(false);
        setSummary({});
        setShareableLink("");
        setProgress(0);
        setEstimatedTime(0);
        if (isLoading) return;

        if (!videoUrl && !uploadedFile) {
            setMessage({ error: "Please paste a YouTube video URL or upload a file" });
            return;
        }

        if (uploadedFile) {
            const fileSizeMb = uploadedFile.size / (1024 * 1024)
            const maxSize = fileType === "video" ? 100 : 5;

            if (fileSizeMb > maxSize) {
                setMessage({ error: `File size exceeds ${maxSize}MB limit for ${fileType}.` });
                return
            }
        }

        if (onSummaryGenerated && !onGenerateSummaryRequest()) {
            setMessage({ error: "You have already generated a summary. Please login to continue." });
            return;
        }

        setIsLoading(true);
        setProgress(0);
        setEstimatedTime(120);

        try {
            let payload = {};
            let endpoint = "";

            if (uploadedFile) {
                const formData = new FormData();
                formData.append("video", uploadedFile);
                payload = formData;
                endpoint = "/api/upload";
            } else {
                payload = {
                    videoUrl,
                };
                endpoint = `/api/transcript${subscription === "Test" ? "/free" : ""}`
            }

            const response = await axiosInstance.post(endpoint, payload, {
                headers: uploadedFile ? { "Content-Type": "multipart/form-data" } : {}
            });
            const { summary, taskId, shareableLink } = response.data;

            if (summary) {
                setShowSummary(true);
                setSummary(summary);
                setShareableLink(shareableLink || "");
                if (onSummaryGenerated) onSummaryGenerated();
            } else {
                await pollForSummary(taskId);
            }
        } catch (err) {
            setShowSummary(false);
            setSummary({});
            setMessage({ error: err.response?.data?.error || err.message || "Failed to fetch summary" });
        } finally {
            setIsLoading(false);
            setProgress(0);
            setEstimatedTime(0);
        }
    };

    const pollForSummary = async (taskId) => {
        while (true) {
            try {
                const { data: task } = await axiosInstance.get(`/api/transcript/status?taskId=${taskId}`);
                setProgress(task.progress || 0);
                setEstimatedTime(task.estimatedTimeRemaining || 0);

                if (task.status === "completed") {
                    setShowSummary(true);
                    setSummary(task.summary);
                    setShareableLink(task.summary.shareableLink || "");
                    if (onSummaryGenerated) onSummaryGenerated();
                    setMessage({});
                    break;
                }
                if (task.status === "failed") throw new Error();
                await new Promise((resolve) => setTimeout(resolve, 2000));
            } catch (err) {
                setShowSummary(false);
                setSummary({});
                setMessage({ error: err.response?.data?.error || "Summary job failed" });
                break;
            }
        }
    };

    const handleCopySummary = async () => {
        if (!summaryTextRef.current?.textContent) return;
        await navigator.clipboard.writeText(summaryTextRef.current.textContent);
        setCopyText(true);
    };

    const handleCopyLink = async () => {
        if (!shareableLink) return;
        await navigator.clipboard.writeText(shareableLink);
    };

    const handleEmailShare = () => {
        if (!shareableLink) return;
        const subject = encodeURIComponent("Here’s a quick summary I made using Youtella");
        const body = encodeURIComponent(
            `I summarized this YouTube video using Youtella.\n\nCheck out the key points here: ${shareableLink}\n\nNo signup. Fast. Smart.\n\n– Shared via Youtella`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const handleWhatsAppShare = () => {
        if (!shareableLink) return;
        const message = encodeURIComponent(
            `Here’s the summary I got from this YouTube video using Youtella.\n\n ${shareableLink}`
        );
        window.open(`https://wa.me/?text=${message}`, "_blank");
    };

    const handleTwitterShare = () => {
        if (!shareableLink) return;
        const tweet = encodeURIComponent(
            `Just summarized this video with Youtella — here’s what I got:\n\n ${shareableLink}\n\nThis tool’s a beast.`
        );
        window.open(`https://x.com/intent/tweet?text=${tweet}`, "_blank");
    };

    const handleSlackShare = () => {
        if (!shareableLink) return;
        const message = encodeURIComponent(
            `Here’s the summary I got from this YouTube video using Youtella.\n\n ${shareableLink}`
        );
        // Slack doesn't have a direct share URL like WhatsApp; prompt user to paste
        navigator.clipboard.writeText(message);
        alert("Message copied! Paste it into your Slack channel.");
    };

    const handleTextMessageShare = () => {
        if (!shareableLink) return;
        const message = encodeURIComponent(
            `Skipped the whole video and got the good stuff here: ${shareableLink}`
        );
        // Use 'sms:' protocol for mobile devices
        window.location.href = `sms:?body=${message}`;
    };

    useEffect(() => {
        setTimeout(() => setCopyText(false), 3000);
    }, [copyText]);

    const formatEstimatedTime = (seconds) =>
        seconds > 0
            ? `${Math.floor(seconds / 60)
                .toString()
                .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
            : "00:00";

    const toggleDropdown = (option) => {
        if ((uploadedFile || videoUrl.length > 0) && option === "upload") return;
        setOpenDropdown(openDropdown === option ? null : option);
    };

    const triggerFileInput = (type) => {
        setFileInputType(type);
    };

    const handleRemoveFile = () => {
        if (fileUrl) {
            URL.revokeObjectURL(fileUrl);
        }
        setUploadedFile(null);
        setFileType(null);
        setFileUrl(null);
        setPreviewKey(prev => prev + 1);
        setShowSummary(false);
        setSummary({});
        setMessage({});
        const videoInput = document.getElementById("videoUploadInput");
        const audioInput = document.getElementById("audioUploadInput");
        if (videoInput) videoInput.value = "";
        if (audioInput) audioInput.value = "";
    };

    useEffect(() => {
        if (fileInputType) {
            const inputId = fileInputType === "video" ? "videoUploadInput" : "audioUploadInput";
            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                inputElement.click();
            }
            setFileInputType(null);
        }
    }, [fileInputType]);

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {

            const fileSizeMb = file.size / (1024 * 1024);
            const maxSize = type === "video" ? 100 : 5

            if (fileSizeMb > maxSize) {
                setMessage({ error: `File size exceeds ${maxSize}MB limit for ${type}.` });
                return
            }

            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
            const newFileUrl = URL.createObjectURL(file);
            setUploadedFile(file);
            setFileType(type);
            setFileUrl(newFileUrl);
            setPreviewKey(prev => prev + 1);
            setOpenDropdown(null);
            setVideoUrl("");
            setMessage({});
            setShowSummary(false);
            setSummary({});
        }
    };

    return (
        <div className="interactionContainer">
            {!showSummary && (
                <div className="mainHeading">
                    <h2>Save Hours Watching Youtube Videos</h2>
                    <p>Instantly Summarize Any Youtube Video Into a Quick, Easy-to-Read Summary.</p>
                </div>
            )
            }
            <form onSubmit={handleGetSummary} className="interactionInput">
                <input
                    type="text"
                    placeholder="Paste your link to convert video"
                    value={videoUrl}
                    onChange={handleUrlChange}
                    disabled={isLoading || uploadedFile}
                />
                {
                    subscription !== "Test" &&
                    <div className="interactionBtnMobile d-md-none">
                        <i
                            className={`bx bx-paperclip ${uploadedFile || videoUrl.length > 0 ? 'disabled' : ''}`}
                            onClick={() => toggleDropdown("upload")}
                            style={{ pointerEvents: uploadedFile || videoUrl.length > 0 ? 'none' : 'auto' }}
                        >
                            {openDropdown === "upload" && (
                                <ul className="inputsDropdown" ref={(el) => (dropdownRefs.current["upload"] = el)}>
                                    <li
                                        className="uploading-items"
                                        onTouchStart={() => triggerFileInput("video")}
                                    >
                                        Upload Video
                                    </li>
                                    <li
                                        className="uploading-items"
                                        onTouchStart={() => triggerFileInput("audio")}
                                    >
                                        Upload Audio
                                    </li>
                                </ul>
                            )}
                        </i>
                    </div>
                }
                <div className="interactionBtnWrapper">
                    {subscription !== "Test" &&
                        <i
                            className={`bx bx-paperclip d-none d-md-block ${uploadedFile || videoUrl.length > 0 ? 'disabled' : ''}`}
                            onClick={() => toggleDropdown("upload")}
                            style={{ pointerEvents: uploadedFile || videoUrl.length > 0 ? 'none' : 'auto' }}
                        >
                            {openDropdown === "upload" && (
                                <ul className="inputsDropdown d-none d-md-flex" ref={(el) => (dropdownRefs.current["upload"] = el)}>
                                    <li className="uploading-items" onClick={() => triggerFileInput("video")}>
                                        Upload Video
                                    </li>
                                    <li className="uploading-items" onClick={() => triggerFileInput("audio")}>
                                        Upload Audio
                                    </li>
                                </ul>
                            )}
                        </i>
                    }
                    <button
                        className="getSummaryBtn"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading..." : "Get Summary"}
                    </button>
                </div>
            </form>
            <p className="interactionSubheading">{subHeading}</p>
            {uploadedFile && fileUrl && (
                <div className="mb-3" key={`preview-${previewKey}`}>
                    {fileType === "video" ? (
                        <div className="previewContainer">
                            <div className="uploadBlock">
                                <video src={fileUrl} />
                                <div className="uploadInfo">
                                    <p className="uploadInfo">{uploadedFile.name}</p>
                                    <p className="filesize">{(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                                </div>
                                <div className="closeIconBtn">
                                    <i className='bx bx-x' onClick={handleRemoveFile}></i>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="previewContainer">
                            <div className="uploadBlock">
                                <img className="audioFile" src={audioSvg} alt="Audio File" />
                                <div className="uploadInfo">
                                    <p className="uploadInfo">{uploadedFile.name}</p>
                                    <p className="filesize">{(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                                </div>
                                <div className="closeIconBtn">
                                    <i className='bx bx-x' onClick={handleRemoveFile}></i>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div className="form-text text-danger">{message.error || message.success}</div>
            {isLoading && (
                <div className="loading-section">
                    <div className="progress-bar-container">
                        <div className="progress-bar-custom" style={{ width: `${progress}%` }}></div>
                        <div className="progress-percentage">{progress}%</div>
                    </div>
                    <div className="progress-info">
                        <p className="progress-text">Completed: {progress}%</p>
                        <p className="estimated-time">Est time: {formatEstimatedTime(estimatedTime)}</p>
                    </div>
                </div>
            )}
            <div className="summary-box" style={{ display: showSummary ? "flex" : "none" }}>
                <div className="summary-actions">
                    <button className="copy-btn" onClick={handleCopySummary} aria-label="Copy detailed summary">
                        <i className="bx bx-copy" aria-hidden="true"></i>
                        <span>{copyText ? "Copied" : "Copy Summary"}</span>
                    </button>
                    <div className="dropdown">
                        <button type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="bx bx-share-alt"></i>
                            <span>Share</span>
                        </button>
                        <ul className="dropdown-menu">
                            <li className="dropdown-item" onClick={handleCopyLink} onTouchStart={(e) => {
                                e.preventDefault();
                                handleCopyLink();
                            }}>
                                <div className="dropiconTextWrapper">
                                    <i className="bx bx-link"></i>
                                    Copy Sharable Link
                                </div>
                            </li>
                            <li className="dropdown-item" onClick={handleEmailShare} onTouchStart={(e) => {
                                e.preventDefault();
                                handleEmailShare();
                            }}>
                                <div className="dropiconTextWrapper">
                                    <i className="bx bx-envelope"></i>
                                    Email This to Someone
                                </div>
                            </li>
                            <li className="dropdown-item" onClick={handleWhatsAppShare} onTouchStart={(e) => {
                                e.preventDefault();
                                handleWhatsAppShare();
                            }}>
                                <div className="dropiconTextWrapper">
                                    <i className="bx bxl-whatsapp"></i>
                                    Send via WhatsApp
                                </div>
                            </li>
                            <li className="dropdown-item" onClick={handleTwitterShare} onTouchStart={(e) => {
                                e.preventDefault();
                                handleTwitterShare();
                            }}>
                                <div className="dropiconTextWrapper">
                                    <img src={xIcon} alt="X Icon" />
                                    Post on Twitter/X
                                </div>
                            </li>
                            <li className="dropdown-item" onClick={handleSlackShare} onTouchStart={(e) => {
                                e.preventDefault();
                                handleSlackShare();
                            }}>
                                <div className="dropiconTextWrapper">
                                    <i className="bx bxl-slack"></i>
                                    Slack Message
                                </div>
                            </li>
                            <li className="dropdown-item" onClick={handleTextMessageShare} onTouchStart={(e) => {
                                e.preventDefault();
                                handleTextMessageShare();
                            }}>
                                <div className="dropiconTextWrapper">
                                    <i className="bx bx-chat"></i>
                                    Text Message
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                {
                    summary?.thumbnailUrl && (
                        <div className="summary-video">
                            <div className="video-description">
                                <h5 className="video-title">{summary?.summaryTitle}</h5>
                                <div className="videoTimeStamp">
                                    <div className="videoText">
                                        Video
                                    </div>
                                    <div className="videoTime">
                                        0:00/{summary?.videoTimestamp}
                                    </div>
                                </div>
                            </div>
                            <img
                                className="summary-thumbnail"
                                src={summary?.thumbnailUrl}
                                alt="Video Thumbnail"
                            />
                        </div>
                    )
                }
                <div className="quick-summary">
                    <h3>
                        <img src={diamondIcon} alt="Diamond Icon" />
                        Quick Summary
                    </h3>
                    <ul>
                        {summary?.keypoints?.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                </div>
                <div className="detailed-summary">
                    <h3>
                        <img src={documentIcon} alt="Document Icon" />
                        Detailed Summary
                    </h3>
                    <p ref={summaryTextRef} className={expand ? "show" : ""}>
                        {summary?.summaryText}
                    </p>
                    <Link className="show-more" onClick={() => setExpand(!expand)}>
                        {expand ? "Show less" : "Show more"}
                    </Link>
                </div>
            </div>
            {subscription !== "Test" && (
                <>
                    <input
                        id="videoUploadInput"
                        type="file"
                        accept="video/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileUpload(e, "video")}
                        disabled={uploadedFile}
                    />
                    <input
                        id="audioUploadInput"
                        type="file"
                        accept="audio/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileUpload(e, "audio")}
                        disabled={uploadedFile}
                    />
                </>
            )
            }
        </div>
    );
}

FreeTestInteraction.propTypes = {
    subHeading: PropTypes.string.isRequired,
    subscription: PropTypes.string.isRequired,
    onSummaryGenerated: PropTypes.func,
    onGenerateSummaryRequest: PropTypes.func
};