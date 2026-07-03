import React from "react";
import LegalLayout from "./LegalLayout";
import styles from "./Legal.module.css";

const CookiePolicy = () => {
  return (
    <LegalLayout title="Cookie Policy">
      <p className={styles.lastUpdated}>Last updated: December 1, 2025</p>

      <section className={styles.section}>
        <h2>1. What Are Cookies</h2>
        <p>
          Cookies are small text files that are placed on your computer or
          mobile device by websites that you visit. They are widely used in
          order to make websites work, or work more efficiently, as well as to
          provide information to the owners of the site.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. How We Use Cookies</h2>
        <p>
          We use cookies for a variety of reasons detailed below. Unfortunately
          in most cases there are no industry standard options for disabling
          cookies without completely disabling the functionality and features
          they add to this site.
        </p>
        <ul>
          <li>
            <strong>Essential Cookies:</strong> These are necessary for the
            website to function properly.
          </li>
          <li>
            <strong>Analytics Cookies:</strong> These help us understand how
            users interact with our website.
          </li>
          <li>
            <strong>Functionality Cookies:</strong> These allow the website to
            remember choices you make.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>3. Disabling Cookies</h2>
        <p>
          You can prevent the setting of cookies by adjusting the settings on
          your browser (see your browser Help for how to do this). Be aware that
          disabling cookies will affect the functionality of this and many other
          websites that you visit.
        </p>
      </section>
    </LegalLayout>
  );
};

export default CookiePolicy;
