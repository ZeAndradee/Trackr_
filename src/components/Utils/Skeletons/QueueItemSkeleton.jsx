import styles from "./QueueItemSkeleton.module.css";

const QueueItemSkeleton = () => (
  <div className={styles.wrapper}>
    <div className={styles.cover} />
    <div className={styles.meta}>
      <div className={styles.title} />
      <div className={styles.artist} />
    </div>
  </div>
);

export default QueueItemSkeleton;
