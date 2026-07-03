import React from "react";
import styles from "./EmptyShelfIcon.module.css";

const EmptyShelfIcon = ({ className }) => {
  return (
    <div className={`${styles.svgContainer} ${className || ""}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="100 130 400 200">
        <defs>
          <g id="vinyl">
            <ellipse
              cx="0"
              cy="-40"
              rx="10"
              ry="40"
              fill="var(--dark-bg-color, #2e2f33)"
              stroke="var(--text-secondary-color, #f2f0eb)"
              strokeWidth="3"
            />
            <ellipse
              cx="0"
              cy="-40"
              rx="3.5"
              ry="14"
              fill="var(--text-secondary-color, #f2f0eb)"
            />
            <ellipse
              cx="0"
              cy="-40"
              rx="1"
              ry="3.5"
              fill="var(--dark-bg-color, #2e2f33)"
            />
          </g>
        </defs>

        <g className={styles.debris}>
          <polygon
            points="295,250 305,250 300,265"
            fill="var(--text-secondary-color, #f2f0eb)"
            stroke="var(--dark-bg-color, #2e2f33)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <polygon
            points="290,255 300,252 295,260"
            fill="var(--dark-bg-color, #2e2f33)"
          />
        </g>

        <g className={styles.shelfLeft}>
          <g className={styles.recordsLeft}>
            <g transform="translate(180, 247) rotate(-5)">
              <use href="#vinyl" />
            </g>
            <g transform="translate(210, 247) rotate(2)">
              <use href="#vinyl" />
            </g>
            <g transform="translate(240, 247) rotate(8)">
              <use href="#vinyl" />
            </g>
          </g>
          <polygon
            points="150,250 300,250 292,256 300,260 150,260"
            fill="var(--text-secondary-color, #f2f0eb)"
            stroke="var(--dark-bg-color, #2e2f33)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </g>

        <g className={styles.shelfRight}>
          <g className={styles.recordsRight}>
            <g transform="translate(420, 247) rotate(4)">
              <use href="#vinyl" />
            </g>
            <g transform="translate(390, 247) rotate(-6)">
              <use href="#vinyl" />
            </g>
          </g>
          <polygon
            points="300,250 450,250 450,260 300,260 292,256"
            fill="var(--text-secondary-color, #f2f0eb)"
            stroke="var(--dark-bg-color, #2e2f33)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};

export default EmptyShelfIcon;
