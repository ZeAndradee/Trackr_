import React, { useEffect } from "react";
import style from "./UserProfileLoading.module.css";
import { Height } from "@mui/icons-material";

const UserProfileLoading = ({ size }) => {
  return (
    <div
      className={style.UserProfileLoading}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minHeight: `${size}px`,
        minWidth: `${size}px`,
      }}
    ></div>
  );
};

export default UserProfileLoading;
