import React, { useState, useEffect } from "react";
import styles from "./WikipediaSection.module.css";
import { fetchWikipediaArticle } from "../../../../services/FetchAlbum";

const WikipediaSection = ({ albumName, artistName }) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!albumName || !artistName) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const result = await fetchWikipediaArticle(albumName, artistName);
      if (!cancelled) {
        setArticle(result);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [albumName, artistName]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonLine} style={{ width: "100%" }} />
          <div className={styles.skeletonLine} style={{ width: "90%" }} />
          <div className={styles.skeletonLine} style={{ width: "75%" }} />
        </div>
      </div>
    );
  }

  if (!article || !article.extract) return null;

  const MAX_LENGTH = 200;
  const shouldTruncate = article.extract.length > MAX_LENGTH;
  const rawText = shouldTruncate && !expanded
    ? `${article.extract.slice(0, MAX_LENGTH)}...`
    : article.extract;

  const paragraphs = rawText.split("\n").filter(p => p.trim() !== "");

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {paragraphs.map((para, index) => (
          <p key={index} className={styles.extract}>
            {para}
            {index === paragraphs.length - 1 && shouldTruncate && (
              <button
                className={styles.readMoreButton}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </p>
        ))}
      </div>
    </div>
  );
};

export default WikipediaSection;
