import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const PROFILE_ROOTS = new Set(['artist', 'album', 'track']);

const isProfileRootedTabSwitch = (prevPath, currPath) => {
  if (prevPath === currPath) return false;
  const a = prevPath.split('/').filter(Boolean);
  const b = currPath.split('/').filter(Boolean);
  if (a.length < 2 || b.length < 2) return false;
  if (a[0] !== b[0] || a[1] !== b[1]) return false;
  return PROFILE_ROOTS.has(a[0]);
};

const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    const skip = isProfileRootedTabSwitch(prevPathRef.current, pathname);
    prevPathRef.current = pathname;
    if (skip) return;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
