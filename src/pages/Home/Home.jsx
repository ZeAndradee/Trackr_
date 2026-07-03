import React, { useState, useContext, useRef } from "react";
import useStickyFollowScroll from "../../hooks/useStickyFollowScroll";
import { UserLoggedContext } from "../../contexts/UserLoggedContext";
import HomeHero from "./HomeHero/HomeHero";
import PopularAlbums from "./PopularAlbums/PopularAlbums";
import SuggestedUsers from "./SuggestedUsers/SuggestedUsers";
import FriendsActivity from "./FriendsActivity/FriendsActivity";
import Feed from "./Feed/Feed";
import PopularLists from "./PopularLists/PopularLists";
import PopularTracks from "./PopularTracks/PopularTracks";
import LandingPage from "./LandingPage/LandingPage";
import styles from "./Home.module.css";
import { buildMeta, websiteLd, organizationLd } from "../../services/seo";

export function meta() {
  return buildMeta({
    title: "Trackr — The Social Music Tracking & Review Platform",
    description:
      "Join Trackr to log your listening history, rate and review your favorite songs, build playlists, and discover new music with friends.",
    canonical: "/",
    type: "website",
    jsonLd: [websiteLd(), organizationLd()],
  });
}

const Home = () => {
  const { userLogged, loading } = useContext(UserLoggedContext);
  const [activeTab, setActiveTab] = useState("foryou");
  const sidebarRef = useRef(null);
  useStickyFollowScroll(sidebarRef);

  if (loading) {
    return null;
  }

  if (!userLogged) {
    return (
      <>
        <LandingPage />
      </>
    );
  }

  return (
    <>
      <div className={styles.home}>
        <div className={styles.contentContainer}>
          <div className={styles.feedLayout}>
            <div className={styles.feedHero}>
              <HomeHero
                user={userLogged}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>

            <div ref={sidebarRef} className={styles.feedSidebar}>
              <PopularTracks />
              <SuggestedUsers />
              <PopularLists userLogged={userLogged} />
            </div>

            <div className={styles.feedContent}>
              {activeTab === "foryou" && (
                <>
                  <PopularAlbums variant="trending" />
                  <Feed />
                </>
              )}
              {activeTab === "friends" && <FriendsActivity />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(Home);
