import React from "react";
import Review from "../../components/Review/Review";

import styles from "./FriendsReviewsScreen.module.css";

export function meta() {
  return [{ title: "Friends Reviews | Trackr" }];
}

const FriendsReviewsScreen = () => {
  return (
    <>
      <div className={styles.friendsReviewsScreen}>
        <Review />
      </div>
    </>
  );
};

export default FriendsReviewsScreen;
