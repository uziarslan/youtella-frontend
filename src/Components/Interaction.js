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

export default function Interaction({ subHeading, subscription, selectedSummary, onSummaryGenerated, onGenerateSummaryRequest }) {
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
    const [summary, setSummary] = useState({ keypoints: [], summary: "", timestamps: [] });
    const [error, setError] = useState("");
    const [copyButtonText, setCopyButtonText] = useState("Copy Summary");
    const [previewKey, setPreviewKey] = useState(0);

    const videoUrlRef = useRef("");
    const dropdownRefs = useRef({});
    const errorRef = useRef(null);
    const summaryBoxRef = useRef(null);
    const buttonRef = useRef(null);
    const summaryTextRef = useRef(null);
    const videoUploadRef = useRef(null);
    const audioUploadRef = useRef(null);

    // Mapping functions to convert backend values to frontend dropdown values
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

    // Update state when selectedSummary changes
    useEffect(() => {
        if (selectedSummary) {
            console.log("Selected Summary:", selectedSummary);
            setShowSummary(true);
            setSummary({
                keypoints: selectedSummary.keypoints || [],
                summary: selectedSummary.summary || "",
                timestamps: selectedSummary.timestamps || []
            });
            setSelectedOptions({
                Language: mapLanguage(selectedSummary.language || "english"),
                Length: mapLength(selectedSummary.summaryLength || "medium"),
                Tone: mapTone(selectedSummary.summaryTone || "formal")
            });
            setError("");
            if (summaryBoxRef.current) {
                summaryBoxRef.current.style.display = "flex";
                summaryBoxRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            if (errorRef.current) errorRef.current.textContent = "";
        }
    }, [selectedSummary]);

    // Update error display
    useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.textContent = error;
        }
    }, [error]);

    // Cleanup file URL when component unmounts
    useEffect(() => {
        return () => {
            if (fileUrl) {
                console.log("Revoking file URL on unmount");
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [fileUrl]);

    const handleUrlChange = (e) => {
        videoUrlRef.current = e.target.value;
        setShowSummary(false);
        setSummary({ keypoints: [], summary: "", timestamps: [] });
        setError("");
        if (errorRef.current) errorRef.current.textContent = "";
        if (summaryBoxRef.current) summaryBoxRef.current.style.display = "none";
        setProgress(0);
        setEstimatedTime(0);
    };

    const handleGetSummary = async (event) => {
        event.preventDefault();
        if (errorRef.current) errorRef.current.textContent = "";

        const videoUrl = videoUrlRef.current;

        if (!videoUrl && !uploadedFile) {
            setError("Please paste a YouTube video URL or upload a file");
            return;
        }

        if (onGenerateSummaryRequest && !onGenerateSummaryRequest()) {
            return;
        }

        setIsLoading(true);
        setProgress(0);
        setEstimatedTime(120);
        if (buttonRef.current) buttonRef.current.textContent = "Loading...";
        if (buttonRef.current) buttonRef.current.disabled = true;

        try {
            let payload = {};
            let endpoint = `/api/transcript${subscription === "Test" ? "/free" : ""}`;

            if (uploadedFile) {
                const formData = new FormData();
                formData.append("video", uploadedFile); // Match backend's upload.single("video")
                if (subscription === "active") {
                    formData.append("language", selectedOptions.Language);
                    formData.append("length", selectedOptions.Length);
                    formData.append("tone", selectedOptions.Tone);
                }
                payload = formData;
                endpoint = "/api/upload"; // Use upload endpoint for files
            } else {
                payload = { videoUrl };
                if (subscription === "active") {
                    payload.language = selectedOptions.Language;
                    payload.length = selectedOptions.Length;
                    payload.tone = selectedOptions.Tone;
                }
            }

            const response = await axiosInstance.post(endpoint, payload, {
                headers: uploadedFile ? { "Content-Type": "multipart/form-data" } : {}
            });
            const data = response.data;

            if (data.summary) {
                setShowSummary(true);
                setSummary(data.summary);
                setError("");
                if (summaryBoxRef.current) {
                    summaryBoxRef.current.style.display = "flex";
                    summaryBoxRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                }
                if (onSummaryGenerated) onSummaryGenerated();
            } else {
                const { taskId } = data;
                await pollForSummary(taskId);
            }
        } catch (err) {
            setShowSummary(false);
            setSummary({ keypoints: [], summary: "", timestamps: [] });
            setError(err.response?.data?.error || err.message || "Failed to fetch summary");
            if (summaryBoxRef.current) summaryBoxRef.current.style.display = "none";
        } finally {
            setIsLoading(false);
            setProgress(0);
            setEstimatedTime(0);
            if (buttonRef.current) buttonRef.current.textContent = "Get Summary";
            if (buttonRef.current) buttonRef.current.disabled = false;
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
                    setError("");
                    if (summaryBoxRef.current) {
                        summaryBoxRef.current.style.display = "flex";
                        summaryBoxRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                    if (onSummaryGenerated) onSummaryGenerated();
                    break;
                } else if (task.status === 'failed') {
                    throw new Error(task.error);
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (err) {
                setShowSummary(false);
                setSummary({ keypoints: [], summary: "", timestamps: [] });
                setError(err.response?.data?.error || err.message || "Summary job failed");
                if (summaryBoxRef.current) summaryBoxRef.current.style.display = "none";
                break;
            }
        }
    };

    const toggleDropdown = (option) => {
        if (uploadedFile && option === "upload") return;
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
        console.log("Copy button clicked");
        if (!summaryTextRef.current || !summaryTextRef.current.textContent) {
            console.warn("No summary text to copy");
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

            console.log("Summary copied to clipboard");
            setCopyButtonText("Copied");
            setTimeout(() => {
                setCopyButtonText("Copy Summary");
            }, 3000);
        } catch (err) {
            console.error("Copy failed:", err);
            setCopyButtonText("Copy Failed");
            setTimeout(() => {
                setCopyButtonText("Copy Summary");
            }, 3000);
        }
    };

    const handleDownloadPDF = () => {
        console.log("Download PDF button clicked");
        console.log("Current summary for PDF:", summary);
        if (!summaryBoxRef.current || !summary.summary) {
            console.warn("No summary content to generate PDF");
            return;
        }

        const clone = summaryBoxRef.current.cloneNode(true);
        const actions = clone.querySelector('.summary-actions');
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
        tempContainer.style.position = 'absolute';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = '210mm';
        tempContainer.style.padding = '10mm';
        tempContainer.style.background = '#ffffff';
        tempContainer.style.color = '#000000';
        tempContainer.style.opacity = '1';
        tempContainer.style.fontFamily = 'Arial, sans-serif';

        clone.querySelectorAll('h3, p, li').forEach(el => {
            el.style.color = '#000000';
            el.style.opacity = '1';
            el.style.background = '#ffffff';
        });

        tempContainer.appendChild(clone);
        document.body.appendChild(tempContainer);

        console.log("Temp container styles:", {
            color: window.getComputedStyle(tempContainer).color,
            background: window.getComputedStyle(tempContainer).background,
            opacity: window.getComputedStyle(tempContainer).opacity
        });
        console.log("Detailed summary styles:", {
            color: detailedSummary ? window.getComputedStyle(detailedSummary).color : 'N/A',
            opacity: detailedSummary ? window.getComputedStyle(detailedSummary).opacity : 'N/A'
        });

        html2canvas(tempContainer, {
            scale: 4,
            useCORS: true,
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
            console.log("PDF generated and downloaded");

            document.body.removeChild(tempContainer);
        }).catch(err => {
            console.error("PDF generation failed:", err);
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
        if (!seconds || seconds <= 0) return "00:00 min";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')} min`;
    };

    const options = {
        Language: ["English", "Spanish", "French", "German"],
        Length: ["Short", "Medium", "Long"],
        Tone: ["Formal", "Casual", "Professional", "Friendly"]
    };

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            console.log("File uploaded:", file.name, "Type:", type);
            // Revoke previous URL if it exists
            if (fileUrl) {
                console.log("Revoking previous file URL");
                URL.revokeObjectURL(fileUrl);
            }
            const newFileUrl = URL.createObjectURL(file);
            console.log("New file URL created:", newFileUrl);
            setUploadedFile(file);
            setFileType(type);
            setFileUrl(newFileUrl);
            setPreviewKey(prev => prev + 1);
            setOpenDropdown(null);
            videoUrlRef.current = "";
            setError("");
            if (errorRef.current) errorRef.current.textContent = "";
        } else {
            console.warn("No file selected");
        }
    };

    const handleRemoveFile = () => {
        console.log("Removing file, current fileUrl:", fileUrl);
        if (fileUrl) {
            URL.revokeObjectURL(fileUrl);
            console.log("File URL revoked");
        }
        setUploadedFile(null);
        setFileType(null);
        setFileUrl(null);
        setPreviewKey(prev => prev + 1);
        setShowSummary(false);
        setSummary({ keypoints: [], summary: "", timestamps: [] });
        setError("");
        if (errorRef.current) errorRef.current.textContent = "";
        if (summaryBoxRef.current) summaryBoxRef.current.style.display = "none";
        // Reset file inputs
        if (videoUploadRef.current) videoUploadRef.current.value = "";
        if (audioUploadRef.current) audioUploadRef.current.value = "";
        console.log("File removed, state reset");
    };

    return (
        <div className="interactionContainer">
            <form onSubmit={handleGetSummary} className="interactionInput">
                <input
                    type="text"
                    placeholder="Paste your link to convert video"
                    defaultValue={videoUrlRef.current}
                    onChange={handleUrlChange}
                    disabled={isLoading || uploadedFile}
                />
                {
                    subscription === "active" && (
                        <div className="interactionBtnMobile d-md-none">
                            <i
                                className={`bx bx-paperclip ${uploadedFile ? 'disabled' : ''}`}
                                onClick={() => toggleDropdown("upload")}
                                style={{ pointerEvents: uploadedFile ? 'none' : 'auto' }}
                            >
                                {openDropdown === "upload" && (
                                    <ul className="inputsDropdown" ref={(el) => (dropdownRefs.current["upload"] = el)}>
                                        <li
                                            className="uploading-items"
                                            onTouchStart={() => document.getElementById("videoUpload").click()}
                                        >
                                            Upload Video
                                        </li>
                                        <li className="uploading-items"
                                            onTouchStart={() => document.getElementById("audioUpload").click()}
                                        >
                                            Upload Audio
                                        </li>
                                    </ul>
                                )}
                            </i>
                        </div>
                    )
                }
                <div className="interactionBtnWrapper">
                    {
                        subscription === "active" && (
                            <i
                                className={`bx bx-paperclip d-none d-md-block ${uploadedFile ? 'disabled' : ''}`}
                                onClick={() => toggleDropdown("upload")}
                                style={{ pointerEvents: uploadedFile ? 'none' : 'auto' }}
                            >
                                {openDropdown === "upload" && (
                                    <ul className="inputsDropdown d-none d-md-flex" ref={(el) => (dropdownRefs.current["upload"] = el)}>
                                        <li className="uploading-items" onClick={() => document.getElementById("videoUpload").click()}>
                                            Upload Video
                                        </li>
                                        <li className="uploading-items" onClick={() => document.getElementById("audioUpload").click()}>
                                            Upload Audio
                                        </li>
                                    </ul>
                                )}
                            </i>
                        )
                    }
                    <button
                        className="getSummaryBtn"
                        type="submit"
                        ref={buttonRef}
                        disabled={isLoading}
                    >
                        Get Summary
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
                                {/* <audio src={fileUrl} /> */}
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
            <div className="form-text text-danger" ref={errorRef}></div>
            {subscription === "active" && (
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
                                            className="dropdown-item"
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
            )}
            {isLoading && (
                <div className="loading-section">
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar-custom"
                            style={{ width: `${progress}%` }}
                        ></div>
                        <div className="progress-percentage">
                            {progress}%
                        </div>
                    </div>
                    <div className="progress-info">
                        <p className="progress-text">
                            Completed: {progress}%
                        </p>
                        <p className="estimated-time">
                            Est time: {formatEstimatedTime(estimatedTime)}
                        </p>
                    </div>
                </div>
            )}
            <div
                className="summary-box"
                ref={summaryBoxRef}
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
                    <button className="save-btn">
                        <i className='bx bx-envelope' aria-hidden="true"></i>
                        <span>Email to self</span>
                    </button>
                </div>
                <div className="quick-summary">
                    <h3>
                        <img src={diamondIcon} alt="Diamond Icon" />
                        Quick Summary
                    </h3>
                    <ul>
                        {summary.keypoints && summary.keypoints.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                </div>
                <div className="detailed-summary">
                    <h3>
                        <img src={documentIcon} alt="Document Icon" />
                        Detailed Summary
                    </h3>
                    <p ref={summaryTextRef} className={expand ? "show" : ""}>{summary.summary}</p>
                    <Link className="show-more" onClick={() => setExpand(!expand)}>
                        {expand ? "Show less" : "Show more"}
                    </Link>
                </div>
                {subscription === "active" && (
                    <div className="timestamp-breakdown">
                        <h3>
                            <img src={playIcon} alt="Play Icon" />
                            Timestamp Breakdown
                        </h3>
                        <ul>
                            {summary.timestamps && summary.timestamps.map((timestamp, index) => (
                                <li key={index}>{timestamp}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <input
                id="videoUpload"
                type="file"
                accept="video/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileUpload(e, "video")}
                disabled={uploadedFile}
                ref={videoUploadRef}
            />
            <input
                id="audioUpload"
                type="file"
                accept="audio/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileUpload(e, "audio")}
                disabled={uploadedFile}
                ref={audioUploadRef}
            />
        </div>
    );
}

Interaction.propTypes = {
    subHeading: PropTypes.string.isRequired,
    subscription: PropTypes.string.isRequired,
    selectedSummary: PropTypes.object,
    onSummaryGenerated: PropTypes.func,
    onGenerateSummaryRequest: PropTypes.func
};