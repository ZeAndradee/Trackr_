import React from "react";
import styles from "./ListSkeleton.module.css";

const ListSkeleton = () => {
    return (
        <div className={styles.container}>
            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <div className={styles.heroMain}>
                        <div className={styles.heroCoverStackStub}>
                            <div className={styles.heroCoverSkeleton} />
                        </div>

                        <div className={styles.heroInfo}>
                            <div className={styles.heroText}>
                                <div className={styles.heroTitleSkeleton} />
                                <div className={styles.heroMetaSkeleton} />
                            </div>

                            <div className={styles.heroStatsRow}>
                                <div className={styles.heroStats}>
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className={styles.statItemSkeleton} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.leftColumn}>
                    <div className={styles.headerSkeleton} />

                    <div className={styles.listContainer}>
                        {Array(8)
                            .fill()
                            .map((_, index) => (
                                <div key={index} className={styles.listItemSkeleton}>
                                    <div className={styles.rankSkeleton} />
                                    <div className={styles.coverSmallSkeleton} />
                                    <div className={styles.trackInfoSkeleton}>
                                        <div className={styles.trackTitleSkeleton} />
                                        <div className={styles.trackArtistSkeleton} />
                                    </div>
                                    <div className={styles.listensSkeleton} />
                                </div>
                            ))}
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.aboutCardSkeleton} />

                    <div className={styles.listenedCardSkeleton} />

                    <div className={styles.sideListSkeleton}>
                        <div className={styles.sectionTitleSkeleton} />
                        {Array(3).fill().map((_, i) => (
                            <div key={i} className={styles.sideItemSkeleton}>
                                <div className={styles.sideCoverSkeleton} />
                                <div className={styles.sideInfoSkeleton}>
                                    <div className={styles.sideTextSkeleton1} />
                                    <div className={styles.sideTextSkeleton2} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListSkeleton;
