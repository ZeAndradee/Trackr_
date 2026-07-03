import styles from "./ResetPasswordSkeleton.module.css";
import { SimpleHeader } from "../Header/Header";

const ResetPasswordSkeleton = () => {
  return (
    <div className={styles.pageContainer}>
      <SimpleHeader />
      <div className={styles.contentWrapper}>
        <div className={styles.resetPasswordContent}>
          <div
            className={`${styles.skeleton} ${styles.singleBlockSkeleton}`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordSkeleton;
