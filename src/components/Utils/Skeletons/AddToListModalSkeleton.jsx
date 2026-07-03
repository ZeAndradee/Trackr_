import styles from "./AddToListModalSkeleton.module.css";

const AddToListModalSkeleton = ({ count = 4 }) => {
  return (
    <div className={styles.container}>
      {Array(count)
        .fill()
        .map((_, index) => (
          <div key={index} className={styles.listItem}>
            <div className={styles.coverSkeleton} />
            <div className={styles.infoSkeleton}>
              <div className={styles.nameSkeleton} />
              <div className={styles.metaSkeleton} />
            </div>
          </div>
        ))}
    </div>
  );
};

export default AddToListModalSkeleton;
