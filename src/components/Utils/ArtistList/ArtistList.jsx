import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import styles from "./ArtistList.module.css";
import { createArtistSlug } from "../../../utils/formatters/textFormatters";

const ArtistList = ({
  artists = [],
  maxVisible = 2,
  fontSize,
  color,
  hoverColor,
  className,
  emptyText = "Unknown artist",
}) => {
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState(null);

  const list = Array.isArray(artists) ? artists.filter((a) => a && a.name) : [];
  const visible = list.slice(0, maxVisible);
  const hidden = list.slice(maxVisible);

  useEffect(() => {
    if (!showMore) return;
    const handleClick = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        moreRef.current && !moreRef.current.contains(e.target)
      ) {
        setShowMore(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMore]);

  const handleMoreClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (showMore) {
      setShowMore(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: rect.left });
    setShowMore(true);
  };

  const inlineStyle = {};
  if (fontSize) inlineStyle.fontSize = fontSize;
  if (color) inlineStyle.color = color;

  const linkStyle = {};
  if (color) linkStyle.color = color;

  const renderArtist = ({ id, artistId, _id, spotifyId, name }, i, prefix) => {
    const linkId = id || artistId || _id || spotifyId;
    return (
      <span key={linkId || i}>
        {prefix}
        {linkId ? (
          <Link
            to={createArtistSlug(name, linkId)}
            className={styles.artistLink}
            style={linkStyle}
            onClick={(e) => e.stopPropagation()}
          >
            {name}
          </Link>
        ) : (
          name
        )}
      </span>
    );
  };

  if (list.length === 0) {
    return (
      <span className={`${styles.artistList} ${styles.empty} ${className || ""}`} style={inlineStyle}>
        {emptyText}
      </span>
    );
  }

  return (
    <span className={`${styles.artistList} ${className || ""}`} style={inlineStyle}>
      {visible.map((a, i) => renderArtist(a, i, i > 0 ? ", " : ""))}
      {hidden.length > 0 && (
        <>
          <button
            ref={moreRef}
            className={styles.moreButton}
            style={inlineStyle}
            onClick={handleMoreClick}
          >
            +{hidden.length} more
          </button>
          {showMore && menuPos && ReactDOM.createPortal(
            <div
              ref={menuRef}
              className={styles.dropdown}
              style={{ top: menuPos.top, left: menuPos.left }}
            >
              {hidden.map(({ id, artistId, _id, spotifyId, name }, i) => {
                const linkId = id || artistId || _id || spotifyId;
                return linkId ? (
                  <Link
                    key={linkId}
                    to={createArtistSlug(name, linkId)}
                    className={styles.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMore(false);
                    }}
                  >
                    {name}
                  </Link>
                ) : (
                  <span key={i} className={styles.dropdownItem}>{name}</span>
                );
              })}
            </div>,
            document.body
          )}
        </>
      )}
    </span>
  );
};

export default ArtistList;
