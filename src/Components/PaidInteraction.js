import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import language from "../Assets/images/language.svg";
import lengthIcon from "../Assets/images/length.svg";
import toneIcon from "../Assets/images/tone.svg";
import diamondIcon from "../Assets/images/diamond-icon.svg";
import documentIcon from "../Assets/images/document.svg";
import playIcon from "../Assets/images/play-icon.svg";
import PropTypes from 'prop-types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import audioSvg from "../Assets/images/audio.svg";
import xIcon from "../Assets/images/x-icon.svg";
import ChatBot from "./Chatbot";


export default function PaidInteraction({ subHeading, selectedSummary, onSummaryGenerated }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [expand, setExpand] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState({
        Language: "English",
        Length: "Medium",
        Tone: "Formal"
    });
    const [uploadedFile, setUploadedFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const [summary, setSummary] = useState({});
    const [message, setMessage] = useState({});
    const [copyButtonText, setCopyButtonText] = useState("Copy Summary");
    const [previewKey, setPreviewKey] = useState(0);
    const [videoUrl, setVideoUrl] = useState("");
    const [fileInputType, setFileInputType] = useState(null);
    const [shareableLink, setShareableLink] = useState("");

    const dropdownRefs = useRef({});
    const summaryTextRef = useRef(null);

    const mapLanguage = (lang) => {
        const languageMap = {
            english: "English",
            spanish: "Spanish",
            french: "French",
            german: "German"
        };
        return languageMap[lang.toLowerCase()] || "English";
    };

    const mapLength = (length) => {
        const lengthMap = {
            short: "Short",
            medium: "Medium",
            long: "Long"
        };
        return lengthMap[length.toLowerCase()] || "Medium";
    };

    const mapTone = (tone) => {
        const toneMap = {
            formal: "Formal",
            casual: "Casual",
            technical: "Professional"
        };
        return toneMap[tone.toLowerCase()] || "Formal";
    };

    useEffect(() => {
        if (selectedSummary) {
            setShowSummary(true);
            setSummary(selectedSummary);
            setSelectedOptions({
                Language: mapLanguage(selectedSummary.language || "english"),
                Length: mapLength(selectedSummary.summaryLength || "medium"),
                Tone: mapTone(selectedSummary.summaryTone || "formal")
            });
            setShareableLink(selectedSummary.shareableLink || "")
            setMessage({});
        }
    }, [selectedSummary]);

    useEffect(() => {
        if (showSummary) {
            const summaryBox = document.querySelector('.summary-box');
            if (summaryBox) {
                summaryBox.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }, [showSummary, selectedSummary]);

    useEffect(() => {
        return () => {
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [fileUrl]);

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

    const triggerFileInput = (type) => {
        setFileInputType(type);
    };

    const handleUrlChange = (e) => {
        setVideoUrl(e.target.value);
        setShowSummary(false);
        setSummary({ keypoints: [], summary: "", timestamps: [] });
        setMessage({});
        setProgress(0);
        setEstimatedTime(0);
        if (fileUrl) {
            URL.revokeObjectURL(fileUrl);
        }
        setUploadedFile(null);
        setFileType(null);
        setFileUrl(null);
        setPreviewKey(prev => prev + 1);
        const videoInput = document.getElementById("videoUploadInput");
        const audioInput = document.getElementById("audioUploadInput");
        if (videoInput) videoInput.value = "";
        if (audioInput) audioInput.value = "";
    };

    const handleGetSummary = async (event) => {
        event.preventDefault();
        setMessage({});
        setShowSummary(false);
        setSummary({});
        setProgress(0);
        setEstimatedTime(0);
        setCopyButtonText("Copy Summary");
        setIsLoading(false);
        setShareableLink("");

        if (isLoading) return;

        if (!videoUrl && !uploadedFile) {
            setMessage({ error: "Please paste a YouTube video URL or upload a file" });
            return;
        }

        if (uploadedFile) {
            const fileSizeGb = uploadedFile.size / (1024 * 1024 * 1024);
            const maxSize = 2;

            if (fileSizeGb > maxSize) {
                setMessage({ error: `File size exceeds ${maxSize}GB limit for ${fileType}.` });
                return;
            }
        }

        setIsLoading(true);
        setProgress(0);
        setEstimatedTime(120);

        try {
            let payload = {};
            let endpoint = "/api/transcript";

            if (uploadedFile) {
                const formData = new FormData();
                formData.append("video", uploadedFile);
                formData.append("language", selectedOptions.Language);
                formData.append("length", selectedOptions.Length);
                formData.append("tone", selectedOptions.Tone);
                payload = formData;
                endpoint = "/api/upload";
            } else {
                payload = {
                    videoUrl,
                    language: selectedOptions.Language,
                    length: selectedOptions.Length,
                    tone: selectedOptions.Tone
                };
            }

            const response = await axiosInstance.post(endpoint, payload, {
                headers: uploadedFile ? { "Content-Type": "multipart/form-data" } : {}
            });
            const { summary, taskId, shareableLink } = response.data;

            if (summary) {
                setShowSummary(true);
                setSummary(summary);
                setShareableLink(shareableLink || "");
            } else {
                await pollForSummary(taskId);
            }
        } catch (err) {
            setShowSummary(false);
            setSummary({ keypoints: [], summary: "", timestamps: [] });
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
                const statusResponse = await axiosInstance.get(`/api/transcript/status?taskId=${taskId}`);
                const task = statusResponse.data;

                setProgress(task.progress || 0);
                setEstimatedTime(task.estimatedTimeRemaining || 0);

                if (task.status === 'completed') {
                    setShowSummary(true);
                    setSummary(task.summary);
                    setMessage({});
                    setShareableLink(task.summary.shareableLink || "");
                    setIsLoading(false);
                    onSummaryGenerated();
                    break;
                } else if (task.status === 'failed') {
                    throw new Error(task.error);
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (err) {
                setShowSummary(false);
                setSummary({ keypoints: [], summary: "", timestamps: [], thumbnailUrl: "", videoTimestamp: "" });
                setProgress(0);
                setEstimatedTime(0);
                setMessage({ error: err.response?.data?.error || err.message || "Summary job failed" });
                break;
            }
        }
    };

    const toggleDropdown = (option) => {
        if ((uploadedFile || videoUrl.length > 0) && option === "upload") return;
        setOpenDropdown(openDropdown === option ? null : option);
    };

    const handleOptionSelect = (option, value) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [option]: value
        }));
        setOpenDropdown(null);
    };

    const handleCopySummary = () => {
        if (!summaryTextRef.current || !summaryTextRef.current.textContent) {
            setCopyButtonText("No Text");
            setTimeout(() => {
                setCopyButtonText("Copy Summary");
            }, 3000);
            return;
        }

        try {
            const range = document.createRange();
            range.selectNodeContents(summaryTextRef.current);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand("copy");
            selection.removeAllRanges();

            setCopyButtonText("Copied");
            setTimeout(() => {
                setCopyButtonText("Copy Summary");
            }, 3000);
        } catch (err) {
            setCopyButtonText("Copy Failed");
            setTimeout(() => {
                setCopyButtonText("Copy Summary");
            }, 3000);
        }
    };

    const handleDownloadPDF = () => {
        const summaryBox = document.querySelector('.summary-box');
        if (!summaryBox || !summary.summaryText) {
            return;
        }

        const clone = summaryBox.cloneNode(true);
        const actions = clone.querySelector('.summary-actions');
        const videoDescription = clone.querySelector('.summary-video');
        if (videoDescription) videoDescription.remove();
        if (actions) actions.remove();

        const detailedSummary = clone.querySelector('.detailed-summary p');
        if (detailedSummary) {
            detailedSummary.classList.add('show');
            detailedSummary.style.maxHeight = 'none';
            detailedSummary.style.overflow = 'visible';
            detailedSummary.style.color = '#000000';
            detailedSummary.style.opacity = '1';
        }

        const showMore = clone.querySelector('.show-more');
        if (showMore) showMore.remove();

        const tempContainer = document.createElement('div');
        const tempContainerStyles = {
            position: 'absolute',
            top: '-9999px',
            width: '210mm',
            padding: '10mm',
            background: '#ffffff',
            color: '#000000',
            opacity: '1',
            fontFamily: 'Arial, sans-serif'
        };
        Object.assign(tempContainer.style, tempContainerStyles);

        clone.querySelectorAll('h3, p, li').forEach(el => {
            el.style.color = '#000000';
            el.style.opacity = '1';
            el.style.background = '#ffffff';
        });

        tempContainer.appendChild(clone);
        document.body.appendChild(tempContainer);

        html2canvas(tempContainer, {
            scale: 4,
            backgroundColor: '#ffffff',
            logging: true,
            imageTimeout: 0,
            letterRendering: true
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 190;
            const pageHeight = 277;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 10;

            pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight, '', 'NONE');
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight, '', 'NONE');
                heightLeft -= pageHeight;
            }

            pdf.save('summary.pdf');
            document.body.removeChild(tempContainer);
        }).catch(() => {
            document.body.removeChild(tempContainer);
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown) {
                const dropdownRef = dropdownRefs.current[openDropdown];
                if (dropdownRef && !dropdownRef.contains(event.target)) {
                    setOpenDropdown(null);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdown]);

    const formatEstimatedTime = (seconds) => {
        const totalSeconds = Number(seconds).toFixed(0); // Round to nearest whole number
        if (!totalSeconds || totalSeconds <= 0) return "00:00 min";

        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;

        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const options = {
        Language: ["English", "Spanish", "French", "German"],
        Length: ["Short", "Medium", "Long"],
        Tone: ["Formal", "Casual", "Professional", "Friendly"]
    };

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {

            const fileSizeGb = file.size / (1024 * 1024 * 1025);
            const maxSize = 2;

            if (fileSizeGb > maxSize) {
                setMessage({ error: `File size exceeds ${maxSize}GB limit for ${type}.` });
                return;
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
            setSummary({ keypoints: [], summary: "", timestamps: [] });
        }
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
        setSummary({ keypoints: [], summary: "", timestamps: [] });
        setMessage({});
        const videoInput = document.getElementById("videoUploadInput");
        const audioInput = document.getElementById("audioUploadInput");
        if (videoInput) videoInput.value = "";
        if (audioInput) audioInput.value = "";
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
        navigator.clipboard.writeText(message);
        alert("Message copied! Paste it into your Slack channel.");
    };

    const handleTextMessageShare = () => {
        if (!shareableLink) return;
        const message = encodeURIComponent(
            `Skipped the whole video and got the good stuff here: ${shareableLink}`
        );
        window.location.href = `sms:?body=${message}`;
    };

    return (
        <div className={`interactionContainer ${showSummary ? "mt-5" : ""}`} >
            {!showSummary && (
                <div className="mainHeading">
                    <h2>Summarize YouTube Videos Instantly with AI</h2>
                    <p>Instantly turn any YouTube video into a quick, easy-to-read summary.</p>
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
                <div className="interactionBtnWrapper">
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
            <div className="options-container">
                {["Language", "Length", "Tone"].map((option) => (
                    <div className="dropdown-wrapper" key={option}>
                        <div className="buttonNIcon" onClick={() => toggleDropdown(option)}>
                            <div className="iconWrapper">
                                <img
                                    src={
                                        option === "Language"
                                            ? language
                                            : option === "Length"
                                                ? lengthIcon
                                                : toneIcon
                                    }
                                    alt={`Select ${option}`}
                                />
                            </div>
                            <p className="option-btn">{selectedOptions[option]}</p>
                        </div>
                        {openDropdown === option && (
                            <ul
                                className="dropdownMenu"
                                ref={(el) => (dropdownRefs.current[option] = el)}
                            >
                                {options[option].map((value) => (
                                    <li
                                        key={value}
                                        className="dropdownitem"
                                        onClick={() => handleOptionSelect(option, value)}
                                    >
                                        {value}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
            {isLoading && (
                <div className="loading-section">
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar-custom"
                            style={{ width: `${progress.toFixed(2)}%` }}
                        ></div>
                        <div className="progress-percentage">
                            {progress.toFixed(2)}%
                        </div>
                    </div>
                    <div className="progress-info">
                        <p className="progress-text">
                            Completed: {progress.toFixed(2)}%
                        </p>
                        <p className="estimated-time">
                            Est time: {formatEstimatedTime(estimatedTime.toFixed(2))}
                        </p>
                    </div>
                </div>
            )}
            <div
                className="summary-box"
                style={{ display: showSummary ? "flex" : "none" }}
            >
                <div className="summary-actions">
                    <button
                        className="copy-btn"
                        onClick={handleCopySummary}
                        aria-label="Copy detailed summary"
                    >
                        <i className='bx bx-copy' aria-hidden="true"></i>
                        <span>{copyButtonText}</span>
                    </button>
                    <button
                        className="download-btn"
                        onClick={handleDownloadPDF}
                        aria-label="Download summary as PDF"
                    >
                        <i className='bx bxs-download' aria-hidden="true"></i>
                        <span>Download PDF</span>
                    </button>
                    <div className="dropdown">
                        <button type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="bx bx-share-alt"></i>
                            <span>Share</span>
                        </button>
                        <ul className="dropdown-menu">
                            <li className="dropdown-item" onClick={handleCopyLink} onTouchStart={handleCopyLink}>
                                <div className="dropiconTextWrapper">
                                    <i className="bx bx-link"></i>
                                    Copy Sharable Link
                                </div>
                            </li>
                            <li className="dropdown-item" onClick={handleEmailShare} onTouchStart={handleEmailShare}>
                                <div className="dropiconTextWrapper">
                                    <i className="bx bx-envelope"></i>
                                    Email This to Someone
                                </div>
                            </li>
                            <li className="dropdown-item" onClick={handleWhatsAppShare} onTouchStart={handleWhatsAppShare}>
                                <div className="dropiconTextWrapper">
                                    <i className="bx bxl-whatsapp"></i>
                                    Send via WhatsApp
                                </div>
                            </li>
                            <li className="dropdown-item" onClick={handleTwitterShare} onTouchStart={handleTwitterShare}>
                                <div className="dropiconTextWrapper">
                                    <img src={xIcon} alt="X Icon" />
                                    Post on Twitter/X
                                </div>
                            </li>
                            <li className="dropdown-item" onClick={handleSlackShare} onTouchStart={handleSlackShare}>
                                <div className="dropiconTextWrapper">
                                    <i className="bx bxl-slack"></i>
                                    Slack Message
                                </div>
                            </li>
                            <li className="dropdown-item" onClick={handleTextMessageShare} onTouchStart={handleTextMessageShare}>
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
                            <iframe src={summary?.thumbnailUrl} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                        </div>
                    )
                }
                <div className="quick-summary">
                    <h3>
                        <img src={diamondIcon} alt="Diamond Icon" />
                        Quick Summary
                    </h3>
                    <ul>
                        {summary?.keypoints && summary?.keypoints?.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                </div>
                <div className="detailed-summary">
                    <h3>
                        <img src={documentIcon} alt="Document Icon" />
                        Detailed Summary
                    </h3>
                    <p ref={summaryTextRef} className={expand ? "show" : ""}>{summary?.summaryText}</p>
                    <Link className="show-more" onClick={() => setExpand(!expand)}>
                        {expand ? "Show less" : "Show more"}
                    </Link>
                </div>
                <div className="timestamp-breakdown">
                    <h3>
                        <img src={playIcon} alt="Play Icon" />
                        Timestamp Breakdown
                    </h3>
                    <ul>
                        {summary?.timestamps && summary?.timestamps?.map((timestamp, index) => (
                            <li key={index}>{timestamp}</li>
                        ))}
                    </ul>
                </div>
            </div>
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
            <ChatBot summary={summary?._id} />
        </div>
    );
}

PaidInteraction.propTypes = {
    subHeading: PropTypes.string.isRequired,
    selectedSummary: PropTypes.object,
};