import React from "react";
import style from "./Title.module.css";

const Title = ({ title, more, tip }) => {
  return (
    <div className={style.title}>
      <span title={tip ? tip : null}>{title}</span>
      {more && <span className={style.more}>show more</span>}
    </div>
  );
};

export default Title;
