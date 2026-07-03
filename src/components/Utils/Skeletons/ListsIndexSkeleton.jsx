import React from "react";
import styles from "./ListsIndexSkeleton.module.css";

const ListsIndexSkeleton = () => (
    <>
        <div className={styles.header}>
            <div className={styles.headerLeft}>
                <div className={`${styles.line} ${styles.lineMedium}`} style={{ width: 200, height: 28 }} />
                <div className={`${styles.line} ${styles.lineShort}`} style={{ width: 80, height: 16 }} />
            </div>
        </div>
        <div className={styles.columnsLayout}>
            <div className={styles.leftColumn}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={styles.card}>
                        <div className={styles.coversRow}>
                            {Array.from({ length: 5 }).map((_, j) => (
                                <div key={j} className={styles.cover} />
                            ))}
                        </div>
                        <div className={styles.body}>
                            <div className={`${styles.line} ${styles.lineMedium}`} />
                            <div className={`${styles.line} ${styles.lineShort}`} />
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.rightColumn}>
                <div className={styles.searchBar} />
                <div className={styles.section}>
                    <div className={`${styles.line} ${styles.lineShort}`} />
                    <div className={`${styles.line} ${styles.lineMedium}`} />
                </div>
            </div>
        </div>
    </>
);

export default ListsIndexSkeleton;
