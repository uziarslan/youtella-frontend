import React, { useEffect, useState, useContext } from "react";
import Navbar from "../Components/Navbar";
import { useParams, Link } from "react-router-dom";
import diamondIcon from "../Assets/images/diamond-icon.svg";
import documentIcon from "../Assets/images/document.svg";
import axiosInstance from "../services/axiosInstance";
import { AuthContext } from "../Context/AuthContext";
import xIcon from "../Assets/images/x-icon.svg";


export default function Share() {
    const { sharename } = useParams();
    const [expand, setExpand] = useState(false);
    const [summary, setSummary] = useState({});
    const { isLoading, setIsLoading } = useContext(AuthContext);
    const [shareableLink, setShareableLink] = useState("");

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

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setIsLoading(true)
                const { data } = await axiosInstance.post("/api/shared/summary", { sharename });
                console.log(data)
                setSummary(data);
                setShareableLink(data.shareableLink || "")

            } catch ({ response }) {
                console.error(response.data.error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSummary();
    }, [sharename, setIsLoading])

    return (
        <>
            <Navbar />
            <div style={{ maxWidth: "659px", margin: "0 auto" }} className="basic-body">
                {
                    !isLoading && (
                        <div
                            className="summary-box mb-5"
                            style={{ display: "flex" }}
                        >
                            <div className="summary-actions">
                                <div className="dropdown">
                                    <button type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i className="bx bx-share-alt"></i>
                                        <span>Share</span>
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li className="dropdown-item" onClick={handleCopyLink}>
                                            <div className="dropiconTextWrapper">
                                                <i className="bx bx-link"></i>
                                                Copy Sharable Link
                                            </div>
                                        </li>
                                        <li className="dropdown-item" onClick={handleEmailShare}>
                                            <div className="dropiconTextWrapper">
                                                <i className="bx bx-envelope"></i>
                                                Email This to Someone
                                            </div>
                                        </li>
                                        <li className="dropdown-item" onClick={handleWhatsAppShare}>
                                            <div className="dropiconTextWrapper">
                                                <i className="bx bxl-whatsapp"></i>
                                                Send via WhatsApp
                                            </div>
                                        </li>
                                        <li className="dropdown-item" onClick={handleTwitterShare}>
                                            <div className="dropiconTextWrapper">
                                                <img src={xIcon} alt="X Icon" />
                                                Post on Twitter/X
                                            </div>
                                        </li>
                                        <li className="dropdown-item" onClick={handleSlackShare}>
                                            <div className="dropiconTextWrapper">
                                                <i className="bx bxl-slack"></i>
                                                Slack Message
                                            </div>
                                        </li>
                                        <li className="dropdown-item" onClick={handleTextMessageShare}>
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
                                <p className={expand ? "show" : ""}>{summary?.summaryText}</p>
                                <Link className="show-more" onClick={() => setExpand(!expand)}>
                                    {expand ? "Show less" : "Show more"}
                                </Link>
                            </div>
                        </div>
                    )
                }
            </div>
            <div className="footerCTA">
                <Link to="/">Try Youtella for Free</Link>
            </div>
        </>
    )
}