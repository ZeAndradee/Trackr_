import React from "react";
import styles from "./CreateListSkeleton.module.css";
import listSkeletonStyles from "./ListSkeleton.module.css";

const CreateListSkeleton = () => {
    return (
        <div className={listSkeletonStyles.container}>
            <div className={listSkeletonStyles.heroSection}>
                <div className={listSkeletonStyles.heroContent}>
                    <div className={listSkeletonStyles.heroMain}>
                        <div className={listSkeletonStyles.heroCoverStackStub}>
                            <div className={listSkeletonStyles.heroCoverSkeleton} />
                        </div>

                        <div className={listSkeletonStyles.heroInfo}>
                            <div className={listSkeletonStyles.heroText}>
                                <div className={listSkeletonStyles.heroTitleSkeleton} />
                                <div className={listSkeletonStyles.heroMetaSkeleton} />
                            </div>

                            <div className={listSkeletonStyles.heroStatsRow}>
                                <div className={listSkeletonStyles.heroStats}>
                                    <div className={listSkeletonStyles.statItemSkeleton} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.leftColumn}>
                    <div className={styles.toolbarSkeleton} />
                    <div className={styles.emptyStateSkeleton} />
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.cardSkeleton}>
                        <div className={styles.cardTitleSkeleton} />
                        <div className={styles.fieldSkeleton} />
                        <div className={styles.fieldSkeleton} style={{ height: '80px' }} />
                        <div className={styles.fieldSkeleton} />
                    </div>
                    
                    <div className={styles.cardSkeleton}>
                        <div className={styles.cardTitleSkeleton} />
                        <div className={styles.settingRowSkeleton} />
                        <div className={styles.settingRowSkeleton} />
                    </div>

                    <div className={styles.actionsSkeleton}>
                        <div className={styles.buttonSkeleton} />
                        <div className={styles.buttonSkeleton} style={{ width: '120px' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateListSkeleton;
