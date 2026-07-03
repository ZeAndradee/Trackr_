import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowRight } from "lucide-react";
import { Button } from "../../components/Utils/Buttons/Button";
import styles from "./NotFound.module.css";

export default function NotFound({
  title = "Page Not Found",
  subtitle = "The page you're looking for doesn't exist or may have moved.",
  embedded = false,
}) {
  const contentRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced || !contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(contentRef.current.children, {
        y: 18,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.1,
        clearProps: "opacity,transform",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className={`${styles.page} ${embedded ? styles.embedded : ""}`}>
      <div ref={contentRef} className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        <Button
          to="/"
          variant="secondary"
          size="lg"
          rightIcon={<ArrowRight size={16} />}
          className={styles.cta}
        >
          Return to homepage
        </Button>
      </div>
    </main>
  );
}
