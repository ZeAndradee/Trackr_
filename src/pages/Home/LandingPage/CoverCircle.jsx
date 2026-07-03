import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createAlbumSlug } from "../../../utils/formatters/textFormatters";
import styles from "./CoverCircle.module.css";

const COVERS = [
  { image: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/8d/0d/15/8d0d1532-493b-52ec-6a29-a239ced6931b/17UMGIM81023.rgb.jpg/500x500bb.jpg", color: "#027ad6", artist: "Lorde", album: "Melodrama" },
  { image: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/0c/06/05/0c060581-6242-6a2a-a677-20170f2cf8da/886447710180.jpg/500x500bb.jpg", color: "#f6b2c7", artist: "Tyler, the Creator", album: "Igor" },
  { image: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/45/68/bb4568f3-68cd-619d-fbcb-4e179916545d/BlondCover-Final.jpg/500x500bb.jpg", color: "#d4d4d7", artist: "Frank Ocean", album: "Blonde" },
  { image: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/25/40/c5/2540c5bd-32e5-868f-3a63-a038e020463d/08UMGIM15738.rgb.jpg/500x500bb.jpg", color: "#fef6f2", artist: "The Rolling Stones", album: "Some Girls" },
  { image: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/0b/df/50/0bdf50bb-b6bb-2ea5-6943-b092fa81f1e7/075679905413.jpg/500x500bb.jpg", color: "#e8eaf7", artist: "Young Thug", album: "Jeffery" },
  { image: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/bd/3b/a9/bd3ba9fb-9609-144f-bcfe-ead67b5f6ab3/196589564931.jpg/500x500bb.jpg", color: "#537792", artist: "SZA", album: "SOS" },
  { image: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/5f/fa/56/5ffa56c2-ea1f-7a17-6bad-192ff9b6476d/825646124206.jpg/500x500bb.jpg", color: "#636169", artist: "David Bowie", album: "The Rise and Fall of Ziggy Stardust and the Spiders from Mars" },
  { image: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/be/27/91/be279120-2285-16c6-c7ba-9d6643d4a948/075992732727.jpg/500x500bb.jpg", color: "#3f3b55", artist: "Black Sabbath", album: "Black Sabbath" },
  { image: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2a/eb/dc/2aebdc18-c2c0-0fdd-fb85-07538a925700/603497925766.jpg/500x500bb.jpg", color: "#fffce9", artist: "Fleetwood Mac", album: "Rumours" },
  { image: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/95/fd/b9/95fdb9b2-6d2b-92a6-97f2-51c1a6d77f1a/00602527874609.rgb.jpg/500x500bb.jpg", color: "#05a9c8", artist: "Nirvana", album: "Nevermind" },
  { image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/3e/76/b0/3e76b0e3-762b-2286-a019-8afb19cee541/886445635829.jpg/500x500bb.jpg", color: "#010100", artist: "Pink Floyd", album: "The Dark Side of the Moon" },
  { image: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/df/db/61/dfdb615d-47f8-06e9-9533-b96daccc029f/18UMGIM31076.rgb.jpg/500x500bb.jpg", color: "#addbf3", artist: "The Beatles", album: "Abbey Road" },
  { image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/90/5e/7e/905e7ed5-a8fa-a8f3-cd06-0028fdf3afaa/199066342442.jpg/500x500bb.jpg", color: "#60703a", artist: "Bad Bunny", album: "Debí Tirar Más Fotos" },
];

const TOTAL_COVERS = 30;
const STEP = 360 / TOTAL_COVERS;
const GROW_ROTATION = STEP * 3;
const SPIN_STEPS = 6;
const EXPAND_THRESHOLD = 0.55;
const SETTLE_DELAY = 450;
const SHAPE_VARIANTS = 6;

const RING_COVERS = Array.from(
  { length: TOTAL_COVERS },
  (_, index) => COVERS[index % COVERS.length],
);

const albumHref = (cover) =>
  createAlbumSlug(cover.album, [{ name: cover.artist }]);

const CoverCircle = () => {
  const sectionRef = useRef(null);
  const ringRef = useRef(null);
  const rotorRef = useRef(null);
  const glowRef = useRef(null);
  const clickSpinRef = useRef(0);
  const progressRef = useRef(0);
  const lastAlbumRef = useRef(-1);
  const lastExpandedRef = useRef(false);
  const settleTimerRef = useRef(null);

  const [centeredAlbum, setCenteredAlbum] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [settledAlbum, setSettledAlbum] = useState(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const initialRadius = () => Math.max(window.innerWidth * 0.25, 220);
    const initialCoverSize = () =>
      Math.min(Math.max(window.innerWidth * 0.05, 44), 72);
    const finalRadius = () => Math.max(window.innerWidth * 0.9, 700);
    const finalCoverSize = () =>
      Math.min(Math.max(window.innerWidth * 0.11, 96), 190);

    const readCenteredAlbum = () => {
      const ring = Number(gsap.getProperty(ringRef.current, "rotation")) || 0;
      const rotor = Number(gsap.getProperty(rotorRef.current, "rotation")) || 0;
      const total = ring + rotor;
      const ringIndex =
        ((Math.round(-total / STEP) % TOTAL_COVERS) + TOTAL_COVERS) %
        TOTAL_COVERS;
      const albumIndex = ringIndex % COVERS.length;
      if (albumIndex !== lastAlbumRef.current) {
        lastAlbumRef.current = albumIndex;
        setCenteredAlbum(albumIndex);
      }
      const isExpanded = progressRef.current > EXPAND_THRESHOLD;
      if (isExpanded !== lastExpandedRef.current) {
        lastExpandedRef.current = isExpanded;
        setExpanded(isExpanded);
      }
    };

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=250%",
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              progressRef.current = self.progress;
            },
            snap: {
              snapTo: (value) =>
                value < 0.5 ? value : gsap.utils.snap(0.5 / SPIN_STEPS, value),
              duration: { min: 0.15, max: 0.4 },
              ease: "power1.inOut",
            },
          },
        })
        .fromTo(
          ringRef.current,
          {
            "--radius": () => `${initialRadius()}px`,
            "--cover-size": () => `${initialCoverSize()}px`,
            y: 0,
            rotation: 0,
          },
          {
            "--radius": () => `${finalRadius()}px`,
            "--cover-size": () => `${finalCoverSize()}px`,
            y: () => -window.innerHeight * 0.22,
            rotation: GROW_ROTATION,
            ease: "none",
            duration: 1,
          },
        )
        .to(ringRef.current, {
          rotation: GROW_ROTATION + STEP * SPIN_STEPS,
          ease: "none",
          duration: 1,
        });
    }, sectionRef);

    gsap.ticker.add(readCenteredAlbum);

    return () => {
      gsap.ticker.remove(readCenteredAlbum);
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    glowRef.current.classList.toggle(styles.glowActive, expanded);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) {
      clearTimeout(settleTimerRef.current);
      return undefined;
    }
    clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      setSettledAlbum(centeredAlbum);
    }, SETTLE_DELAY);
    return () => clearTimeout(settleTimerRef.current);
  }, [centeredAlbum, expanded]);

  useEffect(() => {
    if (settledAlbum == null) return;
    const glow = glowRef.current;
    glow.style.setProperty("--glow-color", COVERS[settledAlbum].color);
    glow.dataset.shape = String(settledAlbum % SHAPE_VARIANTS);
  }, [settledAlbum]);

  const handleCoverClick = (index) => {
    const baseAngle = index * STEP;
    const scrollRotation =
      Number(gsap.getProperty(ringRef.current, "rotation")) || 0;
    const total = baseAngle + scrollRotation + clickSpinRef.current;
    const misalignment = ((total % 360) + 360) % 360;
    const delta = misalignment <= 180 ? -misalignment : 360 - misalignment;

    if (Math.abs(delta) < 1) return;

    clickSpinRef.current += delta;
    gsap.to(rotorRef.current, {
      rotation: clickSpinRef.current,
      duration: 0.9,
      ease: "power3.inOut",
    });
  };

  const current = COVERS[centeredAlbum];

  return (
    <section ref={sectionRef} className={styles.section}>
      <div ref={glowRef} className={styles.glow} data-shape="0">
        <span className={styles.wash} />
        <span className={`${styles.blob} ${styles.blobA}`} />
        <span className={`${styles.blob} ${styles.blobB}`} />
        <span className={`${styles.blob} ${styles.blobC}`} />
      </div>
      <span className={styles.fadeTop} />
      <span className={styles.fadeBottom} />
      <div className={styles.copy}>
        <h2 className={styles.title}>
          From massive hits to underground cuts. Find your tracks and drop a
          review.
        </h2>
        <p className={styles.subtitle}>Just tap to review the tracks.</p>
      </div>
      <div ref={ringRef} className={styles.ring}>
        <div ref={rotorRef} className={styles.rotor}>
          {RING_COVERS.map((cover, index) => (
            <button
              key={index}
              type="button"
              className={styles.cover}
              onClick={() => handleCoverClick(index)}
            >
              <img
                src={cover.image}
                alt=""
                className={styles.coverImg}
                draggable="false"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
      <div
        className={`${styles.nowShowing} ${expanded ? styles.nowShowingOn : ""}`}
      >
        <p key={centeredAlbum} className={styles.nowShowingInner}>
          <Link to={albumHref(current)} className={styles.nowAlbum}>
            {current.album}
          </Link>
          <span className={styles.nowArtist}>{current.artist}</span>
        </p>
      </div>
    </section>
  );
};

export default CoverCircle;
