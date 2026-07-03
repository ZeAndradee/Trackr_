import { useEffect } from "react";

export default function useStickyFollowScroll(ref, { gap = 16 } = {}) {
    useEffect(() => {
        let cancelled = false;
        let cleanup = null;
        let rafAttach = null;

        const setup = (el) => {
            let lastScrollY = window.scrollY;
            let currentTop = null;
            let ticking = false;

            const getHeaderOffset = () => {
                const v = getComputedStyle(document.documentElement)
                    .getPropertyValue("--header-offset")
                    .trim();
                const parsed = parseInt(v, 10);
                return Number.isFinite(parsed) ? parsed : 100;
            };

            const update = () => {
                const scrollY = window.scrollY;
                const delta = scrollY - lastScrollY;
                const headerOffset = getHeaderOffset();
                const sidebarHeight = el.offsetHeight;
                const viewportHeight = window.innerHeight;

                if (currentTop === null) currentTop = headerOffset;

                if (sidebarHeight + headerOffset + gap <= viewportHeight) {
                    currentTop = headerOffset;
                } else {
                    const maxTop = headerOffset;
                    const minTop = viewportHeight - sidebarHeight - gap;
                    currentTop = Math.max(
                        minTop,
                        Math.min(maxTop, currentTop - delta)
                    );
                }

                el.style.top = `${currentTop}px`;
                lastScrollY = scrollY;
            };

            const onScroll = () => {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(() => {
                    update();
                    ticking = false;
                });
            };

            update();
            window.addEventListener("scroll", onScroll, { passive: true });
            window.addEventListener("resize", update);

            return () => {
                window.removeEventListener("scroll", onScroll);
                window.removeEventListener("resize", update);
            };
        };

        const tryAttach = () => {
            if (cancelled) return;
            const el = ref.current;
            if (el) {
                cleanup = setup(el);
            } else {
                rafAttach = requestAnimationFrame(tryAttach);
            }
        };

        tryAttach();

        return () => {
            cancelled = true;
            if (rafAttach) cancelAnimationFrame(rafAttach);
            if (cleanup) cleanup();
        };
    }, [ref, gap]);
}
