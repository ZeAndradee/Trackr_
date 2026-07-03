import style from "../Settings.module.css";

const SettingsTab = ({ title, children }) => {
  return (
    <>
      <header className={style.tabHeader}>
        <h1 className={style.tabTitle}>{title}</h1>
      </header>
      <div className={style.tabBody}>{children}</div>
    </>
  );
};

export default SettingsTab;
