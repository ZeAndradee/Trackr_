import { FaStar, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { RiHeart3Fill } from "react-icons/ri";
import { IoPlay } from "react-icons/io5";
import { Link } from "react-router-dom";
import styles from "./Tags.module.css";
import { Tooltip } from "../Tooltip/Tooltip";

export const RatingTag = ({
  rating,
  size = "0.875rem",
  showBackground = true,
  solid = false,
  to,
}) => {
  const getRatingColor = (score) => {
    if (score >= 4.0) return "var(--rating-high)";
    if (score >= 2.5) return "var(--rating-medium)";
    return "var(--rating-low)";
  };

  const color = getRatingColor(rating);
  const Tag = to ? Link : "div";
  const extraProps = to
    ? { to, onClick: (e) => e.stopPropagation() }
    : {};

  const tag = (
    <Tag
      className={styles.container}
      style={{
        color: color,
        fontSize: size,
        padding: showBackground ? "0.3em 0.6em" : "0",
        borderColor: showBackground
          ? `color-mix(in srgb, currentColor, transparent ${solid ? 50 : 80}%)`
          : "transparent",
        borderWidth: showBackground ? "0.5px" : "0",
        borderStyle: "solid",
        ...(to ? { textDecoration: "none", cursor: "pointer" } : {}),
      }}
      {...extraProps}
    >
      {showBackground && (
        <div
          className={styles.background}
          style={solid ? { opacity: 1, backgroundColor: "var(--background-color)" } : undefined}
        ></div>
      )}
      <div className={styles.content}>
        <FaStar className={styles.star} />
        <span>{Number(rating).toFixed(1)}</span>
      </div>
    </Tag>
  );

  if (to) {
    return (
      <Tooltip text="View review" className={styles.tooltipOverride}>
        {tag}
      </Tooltip>
    );
  }

  return tag;
};

export const LikeTag = ({ size = "0.875rem", showBackground = true, solid = false, to }) => {
  const color = "var(--tag-like)";
  const Tag = to ? Link : "div";
  const extraProps = to
    ? { to, onClick: (e) => e.stopPropagation() }
    : {};

  const tag = (
    <Tag
      className={styles.container}
      style={{
        color: color,
        fontSize: size,
        padding: showBackground ? "0.3em 0.6em" : "0",
        borderColor: showBackground
          ? `color-mix(in srgb, currentColor, transparent ${solid ? 50 : 80}%)`
          : "transparent",
        borderWidth: showBackground ? "0.5px" : "0",
        borderStyle: "solid",
        ...(to ? { textDecoration: "none", cursor: "pointer" } : {}),
      }}
      {...extraProps}
    >
      {showBackground && (
        <div
          className={styles.background}
          style={solid ? { opacity: 1, backgroundColor: "var(--background-color)" } : undefined}
        ></div>
      )}
      <div className={styles.content}>
        <RiHeart3Fill className={styles.star} />
      </div>
    </Tag>
  );

  if (to) {
    return (
      <Tooltip text="View review" className={styles.tooltipOverride}>
        {tag}
      </Tooltip>
    );
  }

  return tag;
};

export const GenreTag = ({ genre, size = "0.75rem", onClick, solid = false, to }) => {
  const getGenreHue = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 360);
  };

  const hue = getGenreHue(genre);
  const color = `hsl(${hue}, var(--tag-genre-saturation), var(--tag-genre-lightness))`;
  const borderColor = solid
    ? `color-mix(in srgb, ${color}, transparent 50%)`
    : `color-mix(in srgb, ${color}, transparent 80%)`;

  const Tag = to ? Link : "div";
  const extraProps = to ? { to, onClick: (e) => { if (onClick) onClick(e); else e.stopPropagation(); } } : { onClick };

  return (
    <Tag
      className={styles.container}
      {...extraProps}
      style={{
        color: color,
        fontSize: size,
        padding: "0.3em 0.8em",
        borderColor: borderColor,
        borderWidth: "0.5px",
        borderStyle: "solid",
        backgroundColor: "transparent",
        cursor: (onClick || to) ? "pointer" : "default",
        textDecoration: "none",
      }}
    >
      <div
        className={styles.background}
        style={
          solid
            ? { backgroundColor: "var(--background-color)", opacity: 1 }
            : { backgroundColor: color, opacity: 0.12 }
        }
      ></div>
      <div className={styles.content}>
        <span style={{ fontWeight: 500 }}>{genre}</span>
      </div>
    </Tag>
  );
};

export const PlayTag = ({ label = "List", size = "0.95rem", solid = false, onClick }) => {
  const color = "var(--text-color)";

  return (
    <div
      className={styles.container}
      style={{
        color: color,
        fontSize: size,
        padding: "0.4em 1em",
        borderColor: `color-mix(in srgb, var(--text-color) ${solid ? 35 : 12}%, transparent)`,
        borderWidth: "0.5px",
        borderStyle: "solid",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <div
        className={styles.background}
        style={
          solid
            ? { backgroundColor: "var(--background-color)", opacity: 1 }
            : { backgroundColor: color, opacity: 0.1 }
        }
      ></div>
      <div className={styles.content}>
        <IoPlay style={{ fontSize: "1em" }} />
        <span style={{ fontWeight: 500 }}>{label}</span>
      </div>
    </div>
  );
};

export const DurationTag = ({ duration, size = "0.75rem", solid = false }) => {
  return (
    <div
      className={styles.container}
      style={{
        fontSize: size,
        color: "var(--text-secondary-color)",
        backgroundColor: solid
          ? "var(--background-color)"
          : "color-mix(in srgb, var(--text-color) 6%, transparent)",
        padding: "0.2em 0.5em",
        borderRadius: "4px",
        fontWeight: 500,
        letterSpacing: "0.02em",
        borderColor: `color-mix(in srgb, var(--text-color) ${solid ? 25 : 10}%, transparent)`,
        borderWidth: "0.5px",
        borderStyle: "solid",
      }}
    >
      {duration}
    </div>
  );
};

export const SyncedTag = ({ size = "0.75rem", solid = false }) => {
  return (
    <Tooltip
      text="Tracks may not be properly synced yet."
      className={styles.tooltipOverride}
    >
      <div
        className={styles.container}
        style={{
          fontSize: size,
          color: "var(--text-secondary-color)",
          backgroundColor: solid
            ? "var(--background-color)"
            : "color-mix(in srgb, var(--text-color) 6%, transparent)",
          padding: "0.2em 0.5em",
          borderRadius: "4px",
          fontWeight: 500,
          borderColor: `color-mix(in srgb, var(--text-color) ${solid ? 25 : 10}%, transparent)`,
          borderWidth: "1px",
          borderStyle: "solid",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3em",
          cursor: "help",
        }}
      >
        Synced
      </div>
    </Tooltip>
  );
};

export const TrendingTag = ({ position, movement, country, to, solid = false, size = "0.75rem" }) => {
  const color = "var(--text-secondary-color)";
  const Tag = to ? Link : "div";
  const extraProps = to ? { to, onClick: (e) => e.stopPropagation() } : {};

  const countryLabels = {
    global: "Global",
    us: "US",
    uk: "UK",
    brazil: "Brazil",
    canada: "Canada",
    australia: "Australia",
    germany: "Germany",
    france: "France",
    japan: "Japan",
    mexico: "Mexico",
    spain: "Spain",
    italy: "Italy",
    india: "India",
    south_korea: "South Korea",
    argentina: "Argentina",
    colombia: "Colombia",
    chile: "Chile",
    netherlands: "Netherlands",
    sweden: "Sweden",
    norway: "Norway",
    turkey: "Turkey",
    indonesia: "Indonesia",
    philippines: "Philippines",
    poland: "Poland",
    portugal: "Portugal",
  };

  const countryLabel = country
    ? countryLabels[country] || country.charAt(0).toUpperCase() + country.slice(1)
    : null;

  return (
    <Tooltip text="View on Trending" className={styles.tooltipOverride}>
      <Tag
        className={styles.container}
        style={{
          color: color,
          fontSize: size,
          padding: "0.3em 0.6em",
          borderColor: solid ? "color-mix(in srgb, var(--text-color) 25%, transparent)" : "transparent",
          borderWidth: solid ? "0.5px" : 0,
          borderStyle: "solid",
          backgroundColor: solid
            ? "var(--background-color)"
            : "color-mix(in srgb, var(--text-color) 8%, transparent)",
          ...(to ? { textDecoration: "none", cursor: "pointer" } : {}),
        }}
        {...extraProps}
      >
        <div className={styles.content}>
          <span>#{position}{countryLabel ? ` ${countryLabel}` : ""}</span>
          {movement !== undefined && movement !== 0 && (
            movement > 0 ? <FaArrowUp /> : <FaArrowDown />
          )}
        </div>
      </Tag>
    </Tooltip>
  );
};

export const PopularityTag = ({ size = "0.75rem", solid = false }) => {
  return (
    <div
      className={styles.container}
      style={{
        fontSize: size,
        color: "var(--tag-popularity)",
        backgroundColor: solid
          ? "var(--background-color)"
          : "color-mix(in srgb, var(--tag-popularity), transparent 88%)",
        padding: "0.2em 0.5em",
        borderRadius: "4px",
        fontWeight: 600,
        letterSpacing: "0.02em",
        borderColor: `color-mix(in srgb, var(--tag-popularity), transparent ${solid ? 50 : 75}%)`,
        borderWidth: "1px",
        borderStyle: "solid",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        textWrap: "nowrap",
        flexShrink: 0,
      }}
    >
      Most Popular
    </div>
  );
};

export const Tag = ({ children, size = "0.7rem" }) => {
  return (
    <div
      className={styles.typeTag}
      style={{
        fontSize: size,
      }}
    >
      <div className={styles.content}>{children}</div>
    </div>
  );
};

