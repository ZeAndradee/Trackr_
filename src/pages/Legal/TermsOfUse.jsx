import LegalLayout from "./LegalLayout";
import styles from "./Legal.module.css";

const TermsOfUse = () => {
  return (
    <LegalLayout title="Terms of Use">
      <p className={styles.lastUpdated}>Last updated: December 1, 2025</p>

      <section className={styles.section}>
        <h2>1. Agreement to Terms</h2>
        <p>
          By accessing or using our website, you agree to be bound by these
          Terms of Use and our Privacy Policy. If you do not agree to these
          terms, please do not use our services.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. Intellectual Property Rights</h2>
        <p>
          Unless otherwise indicated, the Site and its entire contents,
          features, and functionality (including but not limited to all
          information, software, text, displays, images, video, and audio, and
          the design, selection, and arrangement thereof) are owned by Trackr,
          its licensors, or other providers of such material and are protected
          by international copyright, trademark, patent, trade secret, and other
          intellectual property or proprietary rights laws.
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. User Representations</h2>
        <p>
          By using the Site, you represent and warrant that: (1) all
          registration information you submit will be true, accurate, current,
          and complete; (2) you will maintain the accuracy of such information
          and promptly update such registration information as necessary; (3)
          you have the legal capacity and you agree to comply with these Terms
          of Use; (4) you are not a minor in the jurisdiction in which you
          reside.
        </p>
      </section>

      <section className={styles.section}>
        <h2>4. Prohibited Activities</h2>
        <p>
          You may not access or use the Site for any purpose other than that for
          which we make the Site available. The Site may not be used in
          connection with any commercial endeavors except those that are
          specifically endorsed or approved by us.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. Limitation of Liability</h2>
        <p>
          In no event will we or our directors, employees, or agents be liable
          to you or any third party for any direct, indirect, consequential,
          exemplary, incidental, special, or punitive damages, including lost
          profit, lost revenue, loss of data, or other damages arising from your
          use of the site, even if we have been advised of the possibility of
          such damages.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. Disclaimer</h2>
        <p>
          Trackr is an independent project and is not affiliated, associated,
          authorized, endorsed by, or in any way officially connected with
          Spotify, Apple Music, or any of their subsidiaries or affiliates. All
          product and company names are trademarks™ or registered® trademarks of
          their respective holders. Use of them does not imply any affiliation
          with or endorsement by them.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. Contact Us</h2>
        <p>
          In order to resolve a complaint regarding the Site or to receive
          further information regarding use of the Site, please contact us at:
          support@trackr.fm
        </p>
      </section>
    </LegalLayout>
  );
};

export default TermsOfUse;
