import styles from "./Footer.module.css";
import { Link } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import twitterIcon from "../../../assets/icons/footer/twitter-icon.svg";
import youtubeIcon from "../../../assets/icons/footer/youtube-icon.svg";
import instagramIcon from "../../../assets/icons/footer/instagram-icon.svg";
import facebookIcon from "../../../assets/icons/footer/facebook-icon.svg";
import tiktokIcon from "../../../assets/icons/footer/tiktok-icon.svg";

const Footer = () => {
  const { theme } = useTheme();
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.branding}>
          <img src={theme === "light" ? "/TrackrLogoDark.png" : "/TrackrLogo.png"} alt="Trackr Logo" className={styles.logo} />
          <p className={styles.tagline}>
            Track your music journey, one song at a time.
          </p>
          <div className={styles.social}>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <img src={twitterIcon} alt="Twitter" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <img src={facebookIcon} alt="Facebook" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <img src={instagramIcon} alt="Instagram" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <img src={youtubeIcon} alt="YouTube" />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <img src={tiktokIcon} alt="TikTok" />
            </a>
          </div>
        </div>

        <div className={styles.links}>
          <div className={styles.column}>
            <h4 className={styles.title}>Product</h4>
            <ul className={styles.menu}>
              <li className={styles.menuItemDisabled}>
                <a href="#features">Features</a>
              </li>
              <li className={styles.menuItemDisabled}>
                <a href="#pricing">Pricing</a>
              </li>
              <li className={styles.menuItemDisabled}>
                <a href="#integrations">Integrations</a>
              </li>
              <li className={styles.menuItemDisabled}>
                <a href="#changelog">Changelog</a>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.title}>Resources</h4>
            <ul className={styles.menu}>
              <li className={styles.menuItemDisabled}>
                <a href="#blog">Blog</a>
              </li>
              <li className={styles.menuItemDisabled}>
                <a href="#faq">FAQs</a>
              </li>
              <li className={styles.menuItemDisabled}>
                <a href="#support">Support</a>
              </li>
              <li className={styles.menuItemDisabled}>
                <a href="#developers">Developers</a>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.title}>Company</h4>
            <ul className={styles.menu}>
              <li className={styles.menuItemDisabled}>
                <a href="#about">About</a>
              </li>
              <li className={styles.menuItemDisabled}>
                <a href="#team">Team</a>
              </li>
              <li className={styles.menuItemDisabled}>
                <a href="#careers">Careers</a>
              </li>
              <li className={styles.menuItemDisabled}>
                <a href="#contact">Contact Us</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.legal}>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-use">Terms of Service</Link>
          <a href="#cookies">Cookie Policy</a>
        </div>
        <div className={styles.copyright}>
          &copy; {new Date().getFullYear()} Trackr. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
