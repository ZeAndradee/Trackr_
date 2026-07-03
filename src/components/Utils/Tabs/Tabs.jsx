import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import gsap from "gsap";
import { useIsomorphicLayoutEffect } from "../../../hooks/useIsomorphicLayoutEffect";
import styles from "./Tabs.module.css";

export const Tabs = ({
  items,
  activeKey,
  onChange,
  rightSlot,
  className = "",
  tabClassName = "",
  activeTabClassName = "",
}) => {
  const containerRef = useRef(null);
  const indicatorRef = useRef(null);
  const didMountRef = useRef(false);
  const location = useLocation();
  const [_, force] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;
    const active = container.querySelector(`.${styles.tabButtonActive}`);
    if (!active) {
      gsap.to(indicator, { autoAlpha: 0, duration: 0.15 });
      return;
    }
    const cRect = container.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();
    const target = {
      x: aRect.left - cRect.left,
      width: aRect.width,
      autoAlpha: 1,
    };
    if (!didMountRef.current) {
      gsap.set(indicator, target);
      didMountRef.current = true;
    } else {
      gsap.to(indicator, {
        ...target,
        duration: 0.32,
        ease: "power3.out",
        overwrite: true,
      });
    }
  }, [activeKey, location.pathname, items]);

  useEffect(() => {
    const onResize = () => force((n) => n + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div ref={containerRef} className={`${styles.tabs} ${className}`}>
      {items.map((tab) => {
        const isActive = activeKey === tab.key;
        const classes = `${styles.tabButton} ${tabClassName} ${
          isActive ? `${styles.tabButtonActive} ${activeTabClassName}` : ""
        }`;

        if (tab.to !== undefined) {
          return (
            <NavLink
              key={tab.key}
              to={tab.to}
              end={tab.end}
              className={({ isActive: navActive }) =>
                `${styles.tabButton} ${tabClassName} ${
                  navActive
                    ? `${styles.tabButtonActive} ${activeTabClassName}`
                    : ""
                }`
              }
            >
              {tab.label}
            </NavLink>
          );
        }

        return (
          <button
            key={tab.key}
            type="button"
            className={classes}
            onClick={() => onChange?.(tab.key)}
          >
            {tab.label}
          </button>
        );
      })}
      <span ref={indicatorRef} className={styles.indicator} aria-hidden="true" />
      {rightSlot && <div className={styles.rightSlot}>{rightSlot}</div>}
    </div>
  );
};

export const TabPanels = ({ activeKey, children, className = "" }) => {
  const ref = useRef(null);
  const prev = useRef(activeKey);

  useEffect(() => {
    if (prev.current === activeKey) return;
    prev.current = activeKey;
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
    );
  }, [activeKey]);

  return (
    <div ref={ref} className={`${styles.panels} ${className}`}>
      {children}
    </div>
  );
};

export const TabPanel = ({
  tabKey,
  activeKey,
  keepMounted = true,
  children,
  className = "",
}) => {
  const isActive = tabKey === activeKey;
  if (!isActive && !keepMounted) return null;
  return (
    <div
      className={`${styles.panel} ${isActive ? "" : styles.panelHidden} ${className}`}
    >
      {children}
    </div>
  );
};
