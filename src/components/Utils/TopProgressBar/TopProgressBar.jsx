import { useEffect, useRef, useState } from "react";
import { useNavigation } from "react-router";
import styles from "./TopProgressBar.module.css";

export default function TopProgressBar() {
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const barRef = useRef(null);
  const trickleRef = useRef(null);
  const hideRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      clearTimeout(hideRef.current);
      setVisible(true);
      setProgress(8);

      trickleRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          const remaining = 90 - prev;
          return prev + Math.max(0.5, remaining * 0.08);
        });
      }, 200);
    } else {
      clearInterval(trickleRef.current);
      setProgress((prev) => (prev > 0 ? 100 : 0));
      hideRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
    }

    return () => clearInterval(trickleRef.current);
  }, [isLoading]);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${progress}%`;
    }
  }, [progress]);

  useEffect(() => {
    return () => {
      clearInterval(trickleRef.current);
      clearTimeout(hideRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      ref={barRef}
      className={`${styles.bar} ${isLoading ? styles.active : ""}`}
      role="progressbar"
      aria-hidden="true"
    >
      <span className={styles.peg} />
    </div>
  );
}
