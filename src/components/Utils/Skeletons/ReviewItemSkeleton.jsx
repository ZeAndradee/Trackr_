import styles from "./ReviewItemSkeleton.module.css";

const ReviewItemSkeleton = () => {
  return (
    <div className={styles.skeletonWrapper}>
      <div className={`${styles.avatar} ${styles.shimmer}`}></div>
      <div className={styles.content}>
        <div className={`${styles.header} ${styles.shimmer}`}></div>
        <div className={`${styles.textLine} ${styles.shimmer}`}></div>
        <div
          className={`${styles.textLine} ${styles.textLineShort} ${styles.shimmer}`}
        ></div>
        <div className={styles.footer}>
          <div className={`${styles.footerItem} ${styles.shimmer}`}></div>
        </div>
      </div>
    </div>
  );
};

export default ReviewItemSkeleton;
