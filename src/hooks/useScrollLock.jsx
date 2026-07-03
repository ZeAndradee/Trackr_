import { useEffect, useRef } from "react";

function useScrollLock() {
  const scrollPositionRef = useRef(0);

  const lockScroll = () => {
    scrollPositionRef.current = window.pageYOffset;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.width = "100%";
  };

  const unlockScroll = () => {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    window.scrollTo(0, scrollPositionRef.current);
  };

  useEffect(() => {
    lockScroll();
    return unlockScroll;
  }, []);

  return { lockScroll, unlockScroll };
}

export default useScrollLock;
