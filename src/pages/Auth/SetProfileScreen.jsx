import React from "react";
import Layout from "../../components/Utils/Layout/Layout";
import SetProfile from "../../components/Auth/SetProfile/SetProfile";
import { useLocation } from "react-router-dom";
import styles from "./AuthScreens.module.css";

const SetProfileScreen = () => {
  const location = useLocation();
  const credentials = location.state?.credentials || {};

  return (
    <Layout type={true}>
      <div className={styles.authScreenContainer}>
        <SetProfile credentials={credentials} />
      </div>
    </Layout>
  );
};

export default SetProfileScreen;
