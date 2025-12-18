import React, { useEffect } from "react";
import styles from "./TrailerModal.module.scss";

interface TrailerModalProps {
    open: boolean;
    onClose: () => void;
    trailerUrl: string;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ open, onClose, trailerUrl }) => {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [open]);

    if (!open) return null;
    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        if (url.includes("watch?v=")) {
            const videoId = url.split("watch?v=")[1].split("&")[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }

        if (url.includes("youtu.be/")) {
            const videoId = url.split("youtu.be/")[1].split("?")[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }

        return url; // fallback nếu đã là embed
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    ✕
                </button>

                <iframe
                    src={getEmbedUrl(trailerUrl)}
                    title="Trailer"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                />

            </div>
        </div>
    );
};

export default TrailerModal;