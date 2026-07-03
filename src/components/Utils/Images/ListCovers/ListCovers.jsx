import React from "react";
import Image from "../Image/Image";
import { getTrackCover } from "../../Formater/Track";
import { Tooltip } from "../../Tooltip/Tooltip";
import styles from "./ListCovers.module.css";

const ListCovers = ({
  covers = [],
  maxCovers = 5,
  size = 100,
  borderRadius = 12,
  showTooltip = false,
  showEmpty = true,
  className = "",
  borderLength,
}) => {
  const slicedCovers = covers.slice(0, maxCovers);
  const emptyCount = showEmpty ? Math.max(0, maxCovers - slicedCovers.length) : 0;

  return (
    <div
      className={`${styles.coversRow} ${className}`}
      style={{
        "--cover-size": `${size}px`,
        "--cover-radius": `${borderRadius}px`,
        "--cover-overlap": `-${Math.round(size * 0.5)}px`,
      }}
    >
      {slicedCovers.map((trackItem, idx) =>
        showTooltip ? (
          <div className={styles.coverWrapper} key={idx}>
            <Tooltip text={trackItem.name || ""} followMouse={false} position="top" className={styles.tooltip}>
              <Image
                src={getTrackCover(trackItem)}
                alt={trackItem?.name}
                fallbackVariant="cover"
                className={styles.coverImage}
                width="100%"
                height="100%"
                borderLength={borderLength}
              />
            </Tooltip>
          </div>
        ) : (
          <div className={styles.coverWrapper} key={idx}>
            <Image
              src={getTrackCover(trackItem)}
              alt={trackItem?.name}
              fallbackVariant="cover"
              className={styles.coverImage}
              width="100%"
              height="100%"
              borderLength={borderLength}
            />
          </div>
        )
      )}
      {Array.from({ length: emptyCount }).map((_, idx) => (
        <div className={styles.coverWrapper} key={`empty-${idx}`}>
          <div className={styles.emptyCover} />
        </div>
      ))}
    </div>
  );
};

export default ListCovers;
