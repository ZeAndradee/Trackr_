import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { FaTimes, FaInstagram } from "react-icons/fa";
import { RiFileCopyLine } from "react-icons/ri";
import { FiDownload } from "react-icons/fi";
import styles from "./ShareModal.module.css";
import { shareLog } from "../../../../services/HandleLogs";
import { Button } from "../../../Utils/Buttons/Button";
import ShareModalSkeleton from "../../../Utils/Skeletons/ShareModalSkeleton";
import showToast from "../../../Utils/Toast/Toast";

const ShareModal = ({
  isOpen,
  onClose,
  logId,
  artistName = "Artist",
  trackTitle = "Track",
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && logId) {
      loadShareImage();
    }
  }, [isOpen, logId]);

  const loadShareImage = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const blob = await shareLog(logId);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (err) {
      console.error("Failed to load share image:", err);
      setError("Failed to generate share image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${artistName}_${trackTitle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      showToast("Image copied to clipboard!", "success");
    } catch (err) {
      console.error("Failed to copy image:", err);
      showToast("Failed to copy image to clipboard", "error");
    }
  };

  const handleInstagramShare = () => {
    handleDownload();
    if (navigator.share && navigator.canShare && imageUrl) {
      fetch(imageUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `${artistName}_${trackTitle}.png`, {
            type: blob.type,
          });
          if (navigator.canShare({ files: [file] })) {
            navigator
              .share({
                files: [file],
                title: "Check out my review on Trackr",
                text: "Check out my review on Trackr!",
              })
              .catch(() => { });
          } else {
            showToast("Image saved! Open Instagram to share.", "success");
          }
        });
    } else {
      showToast("Image saved! Open Instagram to share your story.", "success");
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Share Review</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {isLoading ? (
            <ShareModalSkeleton />
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            imageUrl && (
              <>
                <div className={styles.imageContainer}>
                  <img
                    src={imageUrl}
                    alt="Review Share"
                    className={styles.shareImage}
                  />
                </div>
                <div className={styles.actions}>
                  <Button
                    onClick={handleInstagramShare}
                    className={styles.flexButton}
                  >
                    Share on Instagram Stories
                  </Button>
                  <button
                    className={styles.actionButton}
                    onClick={handleDownload}
                    aria-label="Download"
                    title="Download"
                  >
                    <FiDownload size={20} />
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={handleCopy}
                    aria-label="Copy"
                    title="Copy"
                  >
                    <RiFileCopyLine size={20} />
                  </button>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default ShareModal;
