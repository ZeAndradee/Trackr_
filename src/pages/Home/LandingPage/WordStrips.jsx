import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./WordStrips.module.css";

const LINES = [
  { word: "Listen.", from: "right" },
  { word: "Rate.", from: "left" },
  { word: "Share.", from: "right" },
];

const OFFSETS = [-0.65, 0.5, -0.35, 0.7, -0.55, 0.4, -0.7, 0.6];

const letterOffset = (index) => OFFSETS[index % OFFSETS.length];

const WordStrips = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray(`.${styles.row}`, sectionRef.current);

      rows.forEach((row) => {
        const inner = row.querySelector(`.${styles.inner}`);
        const circle = row.querySelector(`.${styles.circle}`);
        const letters = row.querySelectorAll(`.${styles.letter}`);
        const fromRight = row.dataset.from === "right";

        gsap
          .timeline({
            scrollTrigger: {
              trigger: row,
              start: "top bottom",
              end: "center 40%",
              scrub: 2,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            [inner, circle],
            {
              x: () =>
                fromRight
                  ? window.innerWidth * 0.6
                  : -window.innerWidth * 0.6,
            },
            { x: 0, ease: "power2.out" },
            0,
          )
          .fromTo(
            letters,
            { y: (i) => `${letterOffset(i)}em` },
            { y: 0, ease: "power2.out" },
            0,
          );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      {LINES.map(({ word, from }, lineIndex) => (
        <div
          key={word}
          data-from={from}
          className={`${styles.row} ${lineIndex === 1 ? styles.rowAlt : ""}`}
        >
          <span className={styles.circle} />
          <div className={styles.inner}>
            <span className={styles.word} aria-label={word}>
              {word.split("").map((letter, letterIndex) => (
                <span
                  key={letterIndex}
                  aria-hidden="true"
                  className={styles.letter}
                >
                  {letter}
                </span>
              ))}
            </span>
          </div>
        </div>
      ))}
    </section>
  );
};

export default WordStrips;
