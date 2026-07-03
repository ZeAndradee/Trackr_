import React from "react";
import styles from "./TrackCardRow.module.css";

const TrackCardRow = ({ children }) => {
  return <div className={styles.tracksGrid}>{children}</div>;
};

export default TrackCardRow;
