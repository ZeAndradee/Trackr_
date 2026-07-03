import React from "react";
import classes from "../../Track/TrackProfile/ListenersOverlay.module.css";

const ListenersOverlaySkeleton = () => {
  return (
    <div className={classes.userList}>
      {Array(6)
        .fill()
        .map((_, index) => (
          <div
            key={`skeleton-user-${index}`}
            className={`${classes.userCard} ${classes.skeletonCard}`}
          >
            <div className={`${classes.userAvatar} ${classes.skeletonAvatar}`}>
              <div className={classes.skeletonImg}></div>
            </div>
            <div className={classes.userInfo}>
              <div
                className={`${classes.userName} ${classes.skeletonText}`}
              ></div>
              <div
                className={`${classes.userUsername} ${classes.skeletonText}`}
              ></div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ListenersOverlaySkeleton;
