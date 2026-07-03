import React from "react";
import ReactDOM from "react-dom";
import { FaTimes } from "react-icons/fa";
import styles from "./ImageModal.module.css";

const ImageModal = ({ isOpen, onClose, imageUrl, altText }) => {
    if (!isOpen) return null;

    const content = (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
                    <FaTimes size={24} />
                </button>
                <div className={styles.imageContainer}>
                    <img src={imageUrl} alt={altText || "Large view"} className={styles.largeImage} />
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(content, document.body);
};

export default ImageModal;
