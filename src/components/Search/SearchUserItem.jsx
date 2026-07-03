import React from "react";
import Image from "../Utils/Images/Image/Image";
import styles from "./SearchItems.module.css";

const SearchUserItem = ({ user, onClick }) => {
  return (
    <div className={styles.itemContainer} onClick={onClick}>
      <div className={styles.avatarContainer}>
        <Image
          src={user?.userimage || user?.image || user?.userImage}
          name={user?.username}
          userId={user?._id || user?.id}
          status={user.status}
          size={50}
        />
      </div>
      <div className={styles.infoContainer}>
        <span className={styles.primaryText}>{user.name || user.username}</span>
        <span className={styles.secondaryText}>@{user.username}</span>
      </div>
    </div>
  );
};

export default SearchUserItem;
