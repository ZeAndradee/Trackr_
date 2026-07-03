import React, { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Legal.module.css";
import { SimpleHeader } from "../../components/Utils/Header/Header";
import Footer from "../../components/Utils/Layout/Footer";
import useStickyFollowScroll from "../../hooks/useStickyFollowScroll";

const LegalLayout = ({ children, title }) => {
  const location = useLocation();
  const sidebarNavRef = useRef(null);
  useStickyFollowScroll(sidebarNavRef);

  const menuItems = [
    { path: "/privacy-policy", label: "Privacy Policy" },
    { path: "/terms-of-use", label: "Terms of Service" },
    { path: "/cookie-policy", label: "Cookie Policy" },
    { path: "/faq", label: "FAQ" },
    { path: "/support", label: "Need Help?" },
  ];

  return (
    <div className={styles.layoutContainer}>
      <SimpleHeader />

      <div className={styles.mainWrapper}>
        <aside className={styles.sidebar}>
          <nav ref={sidebarNavRef} className={styles.sidebarNav}>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.sidebarLink} ${
                  location.pathname === item.path ? styles.active : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className={styles.contentArea}>
          {title && <h1 className={styles.pageTitle}>{title}</h1>}
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default LegalLayout;
