import React from "react";
import LegalLayout from "./LegalLayout";
import styles from "./Legal.module.css";

const Support = () => {
  return (
    <LegalLayout title="Support Center">
      <section className={styles.section}>
        <h2>How can we help you?</h2>
        <p>
          If you're experiencing issues or have any questions, our support team
          is here to assist you.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Contact Options</h2>
        <div className={styles.contactGrid}>
          <div className={styles.contactCard}>
            <h3>Email Support</h3>
            <p>Send us an email and we'll get back to you within 24 hours.</p>
            <a href="mailto:support@trackr.fm" className={styles.contactLink}>
              support@trackr.fm
            </a>
          </div>

          <div className={styles.contactCard}>
            <h3>Community Forum</h3>
            <p>
              Join our community to find answers and discuss with other users.
            </p>
            <a href="#" className={styles.contactLink}>
              Visit Forum
            </a>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Report a Bug</h2>
        <p>
          Found a bug? Please let us know by sending an email to{" "}
          <a href="mailto:bugs@trackr.fm">bugs@trackr.fm</a> with a detailed
          description of the issue.
        </p>
      </section>
    </LegalLayout>
  );
};

export default Support;
