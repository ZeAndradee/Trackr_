import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useIsomorphicLayoutEffect } from "../../../../hooks/useIsomorphicLayoutEffect";
import { gsap } from "gsap";
import styles from "./ArtistCard.module.css";
import Flag, { getCountryName } from "../../../Utils/Flag/Flag";
import Image from "../../../Utils/Images/Image/Image";
import { DurationTag, GenreTag } from "../../../Utils/Tags/Tags";
import { setImageResolution } from "../../../../utils/handlers/image";

const formatDate = (iso) => {
  if (!iso) return null;
  if (/^\d{4}$/.test(String(iso).trim())) return String(iso).trim();
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const yearsActive = (since) => {
  if (!since) return null;
  const start = parseInt(since, 10);
  if (!start) return null;
  return new Date().getFullYear() - start;
};

const ageFrom = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
};

const Fact = ({ label, children }) => (
  <div className={styles.fact}>
    <div className={styles.factBody}>
      <span className={styles.factLabel}>{label}</span>
      <span className={styles.factValue}>{children}</span>
    </div>
  </div>
);

const ArtistCard = ({ artistName, artistImage, stats, biography, biographySource, genres, hideBio, artistInfo, bioReadMoreHref, children }) => {
  const [heroVisible, setHeroVisible] = useState(true);
  const [bioExpanded, setBioExpanded] = useState(false);
  const bannerRef = useRef(null);
  const avatarRef = useRef(null);
  const identityRef = useRef(null);
  const identityTextRef = useRef(null);
  const statsRef = useRef(null);
  const didMountRef = useRef(false);
  const bioTextRef = useRef(null);
  const isBioMount = useRef(true);

  const bannerBgUrl = setImageResolution(artistImage, 4000) || artistImage;

  const isGroup = artistInfo?.type && artistInfo.type !== "Person";

  const hasFacts = !!(
    artistInfo &&
    ((!isGroup && artistInfo.bornName) ||
      artistInfo.bornDate ||
      artistInfo.bornCity ||
      artistInfo.bornCountry ||
      artistInfo.bornPlace ||
      artistInfo.origin ||
      artistInfo.activeSince ||
      artistInfo.debutRelease ||
      artistInfo.occupations?.length > 0 ||
      artistInfo.instruments?.length > 0)
  );
  const showBio = !hideBio && !!biography;
  const hasContent = hasFacts || showBio;

  useIsomorphicLayoutEffect(() => {
    const banner = bannerRef.current;
    const avatar = avatarRef.current;
    const identity = identityRef.current;
    const identityText = identityTextRef.current;
    const statsContainer = statsRef.current;
    if (!banner || !avatar || !identity || !identityText) return;

    const show = !heroVisible;
    const bannerTarget = show
      ? { height: 100, opacity: 1, marginBottom: 0, display: "block" }
      : { height: 0, opacity: 0, marginBottom: 0, display: "none" };

    const avatarTarget = show
      ? { width: 96, height: 96, marginRight: 14, scale: 1, opacity: 1 }
      : { width: 0, height: 0, marginRight: 0, scale: 0.6, opacity: 0 };

    const identityTarget = show
      ? { marginTop: -64, display: "flex", height: "auto" }
      : { marginTop: 0, display: "none", height: 0 };

    const identityTextTarget = show
      ? { opacity: 1, height: "auto" }
      : { opacity: 0, height: 0 };

    const statsTarget = show
      ? { marginTop: 5 }
      : { marginTop: 10 };

    if (!didMountRef.current) {
      didMountRef.current = true;
      gsap.set(banner, bannerTarget);
      gsap.set(avatar, avatarTarget);
      gsap.set(identity, identityTarget);
      gsap.set(identityText, identityTextTarget);
      if (statsContainer) gsap.set(statsContainer, statsTarget);
      return;
    }

    gsap.to(banner, { ...bannerTarget, duration: 0.45, ease: "power3.out" });
    gsap.to(avatar, { ...avatarTarget, duration: 0.45, ease: "power3.out" });
    gsap.to(identity, { ...identityTarget, duration: 0.45, ease: "power3.out" });
    gsap.to(identityText, { ...identityTextTarget, duration: 0.45, ease: "power3.out" });
    if (statsContainer) gsap.to(statsContainer, { ...statsTarget, duration: 0.45, ease: "power3.out" });
  }, [heroVisible]);

  useEffect(() => {
    const hero = document.querySelector("[data-artist-hero]");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (isBioMount.current) {
      isBioMount.current = false;
      return;
    }
    const el = bioTextRef.current;
    if (!el) return;

    const startHeight = el.offsetHeight;
    el.style.overflow = "hidden";

    if (bioExpanded) {
      el.classList.remove(styles.clamped);
      el.style.height = "auto";
      const targetHeight = el.offsetHeight;

      gsap.fromTo(
        el,
        { height: startHeight },
        {
          height: targetHeight,
          duration: 0.35,
          ease: "power2.out",
          onComplete: () => {
            el.style.height = "auto";
            el.style.overflow = "visible";
          },
        }
      );
    } else {
      el.style.height = "auto";
      el.classList.add(styles.clamped);
      const targetHeight = el.offsetHeight;

      el.classList.remove(styles.clamped);

      gsap.fromTo(
        el,
        { height: startHeight },
        {
          height: targetHeight,
          duration: 0.35,
          ease: "power2.out",
          onComplete: () => {
            el.classList.add(styles.clamped);
            el.style.height = "auto";
            el.style.overflow = "hidden";
          },
        }
      );
    }
  }, [bioExpanded]);

  if (!hasContent) return null;

  return (
    <div className={styles.card} style={{ overflow: "hidden" }}>
      <div ref={bannerRef} className={`${styles.bannerWrapper} ${styles.initialHidden}`}>
        <div
          className={styles.banner}
          style={{
            backgroundImage: bannerBgUrl ? `url(${bannerBgUrl})` : "none",
          }}
        />
        <div className={styles.noiseLayer} />
        <div className={styles.bannerOverlay} />
      </div>

      <div ref={identityRef} className={`${styles.identity} ${styles.identityInitialHidden}`}>
        <div ref={avatarRef} className={`${styles.sidebarAvatar} ${styles.avatarInitialHidden}`}>
          <Image
            src={artistImage}
            name={artistName}
            size={96}
            showBadge={false}
          />
        </div>
        <div ref={identityTextRef} className={`${styles.identityText} ${styles.identityTextInitialHidden}`}>
          <span className={styles.sidebarDisplayName}>{artistName}</span>
          {genres && genres.length > 0 && (
            <div className={styles.sidebarGenres}>
              {genres.slice(0, 2).map((g) => (
                <GenreTag key={g} genre={g} size="0.7rem" />
              ))}
            </div>
          )}
        </div>
      </div>

      {hasFacts && (
        <div ref={statsRef} className={styles.artistInfoContainer}>
          <div className={styles.factsGrid}>
            {!isGroup && artistInfo.bornName && (
              <Fact label="Real name">
                {artistInfo.bornName}
              </Fact>
            )}
            {artistInfo.bornDate && (
              <Fact label={isGroup ? "Formed" : "Born"}>
                <span className={styles.factInline}>
                  {formatDate(artistInfo.bornDate)}
                  {!isGroup && ageFrom(artistInfo.bornDate) != null && (
                    <DurationTag duration={`age ${ageFrom(artistInfo.bornDate)}`} size="0.7rem" />
                  )}
                </span>
              </Fact>
            )}
            {(artistInfo.bornCity || artistInfo.bornCountry || artistInfo.bornPlace) && (
              <Fact label={isGroup ? "Origin" : "From"}>
                <span className={styles.factInlineWrap}>
                  {artistInfo.bornCountry ? (
                    <>
                      {artistInfo.bornCity && <span>{artistInfo.bornCity},</span>}
                      <span>{getCountryName(artistInfo.bornCountry) || artistInfo.bornCountry}</span>
                      <Flag country={artistInfo.bornCountry} size={20} />
                    </>
                  ) : (
                    <span>{artistInfo.bornPlace}</span>
                  )}
                </span>
              </Fact>
            )}
            {artistInfo.origin && artistInfo.origin !== artistInfo.bornPlace && artistInfo.origin !== artistInfo.bornCity && (
              <Fact label="Based in">
                <span className={styles.factInlineWrap}>
                  <span>{artistInfo.origin}</span>
                  {artistInfo.originCountry && <Flag country={artistInfo.originCountry} size={16} />}
                </span>
              </Fact>
            )}
            {artistInfo.activeSince && (
              <Fact label="Active since">
                <span className={styles.factInline}>
                  {artistInfo.activeSince}
                  {yearsActive(artistInfo.activeSince) != null && (
                    <DurationTag duration={`${yearsActive(artistInfo.activeSince)} yrs`} size="0.7rem" />
                  )}
                </span>
              </Fact>
            )}
            {artistInfo.debutRelease && (
              <Fact label="Debut">
                {artistInfo.debutRelease.name}
                <span className={styles.factSub}>
                  {" "}
                  · {artistInfo.debutRelease.type} · {artistInfo.debutRelease.year}
                </span>
              </Fact>
            )}
            {artistInfo.occupations?.length > 0 && (
              <Fact label="Roles">
                {artistInfo.occupations.join(" · ")}
              </Fact>
            )}
            {artistInfo.instruments?.length > 0 && (
              <Fact label="Instruments">
                {artistInfo.instruments.join(", ")}
              </Fact>
            )}
          </div>
        </div>
      )}

      {!hideBio && biography && (
        <div className={styles.bioSection}>
          <div className={styles.bioContent}>
            <p ref={bioTextRef} className={`${styles.bioText} ${!bioExpanded && !bioReadMoreHref ? styles.clamped : ""}`}>
              {biography}
            </p>
            {bioReadMoreHref ? (
              <Link to={bioReadMoreHref} className={styles.bioReadMore}>
                Read more
              </Link>
            ) : (
              <button
                className={styles.bioReadMore}
                onClick={() => setBioExpanded(!bioExpanded)}
              >
                {bioExpanded ? "Read less" : "Read more"}
              </button>
            )}
          </div>
          {bioExpanded && biographySource && (
            <div className={styles.bioSourceContainer}>
              {biographySource.url ? (
                <a
                  href={biographySource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.bioSourceLink}
                >
                  {biographySource.name}
                </a>
              ) : (
                <span className={styles.bioSourceLink}>{biographySource.name}</span>
              )}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default ArtistCard;

