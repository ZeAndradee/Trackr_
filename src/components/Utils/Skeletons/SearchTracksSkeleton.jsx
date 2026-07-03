import React from "react";
import styles from "./SearchTracksSkeleton.module.css";

const SearchTracksSkeleton = ({ count = 5 }) => {
    return (
        <div className={styles.container}>
            {Array(count)
                .fill(0)
                .map((_, i) => (
                    <div key={i} className={styles.row}>
                        <div className={styles.cover}></div>
                        <div className={styles.info}>
                            <div className={styles.name}></div>
                            <div className={styles.artist}></div>
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default SearchTracksSkeleton;
