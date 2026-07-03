import React from "react";
import style from "./NotificationCenterSkeleton.module.css";

const NotificationCenterSkeleton = () => {
  return (
    <div className={style.container}>
      {[...Array(5)].map((_, index) => (
        <div key={index} className={style.skeletonItem}>
          <div className={`${style.avatarSkeleton} ${style.shimmer}`}></div>
          <div className={style.contentSkeleton}>
            <div className={`${style.textLine} ${style.long} ${style.shimmer}`}></div>
            <div className={`${style.textLine} ${style.short} ${style.shimmer}`}></div>
            <div className={`${style.timeSkeleton} ${style.shimmer}`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenterSkeleton;
