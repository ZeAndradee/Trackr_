import style from "./ChartLoading.module.css";

const ChartLoading = () => {
  return (
    <>
      <div className={style.ChartModel}>
        <div className={style.ChartBar1}></div>
        <div className={style.ChartBar2}></div>
        <div className={style.ChartBar3}></div>
        <div className={style.ChartBar4}></div>
        <div className={style.ChartBar5}></div>
      </div>
    </>
  );
};

export default ChartLoading;
