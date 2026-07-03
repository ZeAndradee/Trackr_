import { useState, useEffect, useCallback, useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { isRouteErrorResponse } from "react-router";
import Footer from "./Footer";
import style from "./Layout.module.css";
import Header from "../Header/Header";
import NotFound from "../../../pages/NotFound/NotFound";
import AuthModal from "../../Auth/AuthModal/AuthModal";
import ScrollToTop from "../ScrollToTop/ScrollToTop";

import { Toaster } from "react-hot-toast";
import Player from "../../Player/Player/Player";
import Theater from "../../Player/Theater/Theater";
import { usePlayer } from "../../../contexts/PlayerContext";
import { UserLoggedContext } from "../../../contexts/UserLoggedContext";

const Layout = ({ children, type }) => {
  const [contentKey, setContentKey] = useState(0);
  const location = useLocation();
  const path = location.pathname;
  const { userLogged } = useContext(UserLoggedContext);

  const isHeroPage =
    !path.startsWith("/search") && (
      path.startsWith("/track/") ||
      path.startsWith("/album/") ||
      path.startsWith("/artist/") ||
      (path.includes("/list/") && !path.endsWith("/lists")) ||
      path.includes("/log/") ||
      /^\/[^\/]+$/.test(path) ||
      /^\/[^\/]+\/(reviews|lists)$/.test(path) ||
      (path === "/" && !userLogged)
    );

  const { showTheaterMode, currentTrack } = usePlayer();

  const handleReviewUpdated = useCallback(() => {
    setContentKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    window.addEventListener("reviewUpdated", handleReviewUpdated);
    return () => window.removeEventListener("reviewUpdated", handleReviewUpdated);
  }, [handleReviewUpdated]);

  return (
    <div className={`${style.layout} ${isHeroPage ? style.layoutHero : ""}`}>
      <ScrollToTop />
      {!type && <Header />}
      <AuthModal />
      <Toaster position="top-center" containerStyle={{ top: '100px', zIndex: 99999 }} />
      <div className={style.children} key={contentKey}>{children || <Outlet />}</div>
      <Player />
      <Footer />
      {showTheaterMode && currentTrack && <Theater />}
    </div>
  );
};

export default Layout;

export function ErrorBoundary({ error }) {
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  let title = "Page Not Found";
  let subtitle = "The page you're looking for doesn't exist or may have moved.";

  if (!is404) {
    title = "Something went wrong";
    subtitle = isRouteErrorResponse(error)
      ? error.statusText || "An unexpected error occurred. Please try again."
      : error instanceof Error
        ? error.message
        : "An unexpected error occurred. Please try again.";
  }

  return (
    <div className={style.layout}>
      <Header />
      <NotFound title={title} subtitle={subtitle} embedded />
      <Footer />
    </div>
  );
}
