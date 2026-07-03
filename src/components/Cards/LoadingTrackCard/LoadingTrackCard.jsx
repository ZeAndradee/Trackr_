import React from "react";
import style from "./LoadingTrackCard.module.css";

const LoadingTrackCard = ({ limit }) => {
  return (
    <>
      {Array.from({ length: limit }).map((_, index) => (
        <div key={index} className={style.cardContainer}></div>
      ))}
    </>
  );
};

export default LoadingTrackCard;
