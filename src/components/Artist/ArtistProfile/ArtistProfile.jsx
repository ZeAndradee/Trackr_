import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import styles from "./ArtistProfile.module.css";
import HeroItem from "../../Utils/HeroItem/HeroItem";
import { GenreTag } from "../../Utils/Tags/Tags";
import TrackList from "../../Utils/TrackList/TrackList";
import { fetchArtistFriendsListened, fetchArtistInfo } from "../../../services/FetchArtist";
import FriendsFacePile from "../../Utils/FriendsFacePile/FriendsFacePile";
import Discography from "./Discography/Discography";
import DiscographyTab from "./Discography/DiscographyTab";
import useStickyFollowScroll from "../../../hooks/useStickyFollowScroll";
import { Tabs, TabPanels, TabPanel } from "../../Utils/Tabs/Tabs";
import { mockArtistStats } from "../../../mockData/artistProfileMock";
import ArtistCard from "./ArtistCard/ArtistCard";
import SimilarArtists from "./SimilarArtists/SimilarArtists";
import LatestRelease from "./LatestRelease/LatestRelease";
import Chart from "../../Utils/Chart/Chart";
import { TextInput } from "../../Utils/Inputs/Inputs";
import AboutTab from "./About/AboutTab";


const SLUG_TO_CATEGORY = {
  albums: "album",
  singles: "single",
  eps: "ep",
};

const CATEGORY_TO_SLUG = {
  album: "albums",
  single: "singles",
  ep: "eps",
};

const ArtistProfile = ({ artistData }) => {
  const discographySidebarRef = useRef(null);
  const overviewSidebarRef = useRef(null);
  useStickyFollowScroll(discographySidebarRef);
  useStickyFollowScroll(overviewSidebarRef);
  const [friendsListened, setFriendsListened] = useState([]);
  const [artistInfo, setArtistInfo] = useState(null);
  const [discographyInput, setDiscographyInput] = useState("");
  const [discographyQuery, setDiscographyQuery] = useState("");
  const [availableDecades, setAvailableDecades] = useState([]);
  const [activeDecade, setActiveDecade] = useState("all");
  const debounceRef = useRef(null);

  const handleDiscographyInput = useCallback((value) => {
    setDiscographyInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDiscographyQuery(value), 300);
  }, []);

  useEffect(() => {
    if (activeDecade !== "all" && !availableDecades.includes(activeDecade)) {
      setActiveDecade("all");
    }
  }, [availableDecades, activeDecade]);

  const clearDiscographySearch = useCallback(() => {
    setDiscographyInput("");
    setDiscographyQuery("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const cleanPath = location.pathname.replace(/\/$/, "");
  const discographyMatch = cleanPath.match(/\/discography(?:\/([a-z-]+))?$/);
  const isDiscographyRoute = !!discographyMatch;
  const isAboutRoute = /\/about$/.test(cleanPath);
  const catParam = searchParams.get("cat");
  const activeCategory = useMemo(() => {
    if (catParam) {
      const arr = catParam
        .split(",")
        .map((c) => SLUG_TO_CATEGORY[c])
        .filter(Boolean);
      if (arr.length === 1) return arr[0];
      if (arr.length > 1) return arr;
    }
    if (!discographyMatch) return "all";
    const slug = discographyMatch[1];
    return (slug && SLUG_TO_CATEGORY[slug]) || "album";
  }, [cleanPath, catParam]);
  const sortOrder = searchParams.get("order") || "newest";
  const viewParam = searchParams.get("view") || "";

  const initialTab = isDiscographyRoute
    ? "discography"
    : isAboutRoute
      ? "about"
      : "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(
      isDiscographyRoute ? "discography" : isAboutRoute ? "about" : "overview"
    );
  }, [isDiscographyRoute, isAboutRoute]);

  const basePath = useMemo(
    () => cleanPath.replace(/\/(discography(?:\/[a-z-]+)?|about)$/, ""),
    [cleanPath]
  );

  const switchTab = useCallback(
    (tab) => {
      setActiveTab(tab);
      const next =
        tab === "discography"
          ? `${basePath}/discography`
          : tab === "about"
            ? `${basePath}/about`
            : basePath;
      if (next !== location.pathname) {
        navigate(next, { replace: false });
      }
    },
    [basePath, location.pathname, navigate]
  );

  const handleCategoryChange = useCallback(
    (category) => {
      const order = searchParams.get("order");
      const view = searchParams.get("view");
      const isSingleOnly = category === "single" || category === "ep";
      const params = new URLSearchParams();
      if (order && order !== "newest") params.set("order", order);
      if (view && !isSingleOnly) params.set("view", view);
      let path = `${basePath}/discography`;
      if (Array.isArray(category)) {
        const slugs = category.map((c) => CATEGORY_TO_SLUG[c]).filter(Boolean);
        if (slugs.length) params.set("cat", slugs.join(","));
      } else if (category && category !== "all") {
        const slug = CATEGORY_TO_SLUG[category];
        if (slug) path += `/${slug}`;
      }
      const qs = params.toString();
      navigate(`${path}${qs ? `?${qs}` : ""}`, { replace: true });
    },
    [basePath, navigate, searchParams]
  );

  const handleSortChange = useCallback(
    (order) => {
      const cat = searchParams.get("cat");
      const view = searchParams.get("view");
      const categorySlug = !cat && discographyMatch?.[1] ? `/${discographyMatch[1]}` : "";
      const params = new URLSearchParams();
      if (cat) params.set("cat", cat);
      if (view) params.set("view", view);
      if (order && order !== "newest") params.set("order", order);
      const qs = params.toString();
      navigate(`${basePath}/discography${categorySlug}${qs ? `?${qs}` : ""}`, { replace: true });
    },
    [basePath, navigate, discographyMatch, searchParams]
  );

  const handleViewChange = useCallback(
    (view) => {
      const cat = searchParams.get("cat");
      const order = searchParams.get("order");
      const categorySlug = !cat && discographyMatch?.[1] ? `/${discographyMatch[1]}` : "";
      const params = new URLSearchParams();
      if (cat) params.set("cat", cat);
      if (order && order !== "newest") params.set("order", order);
      if (view) params.set("view", view);
      const qs = params.toString();
      navigate(`${basePath}/discography${categorySlug}${qs ? `?${qs}` : ""}`, { replace: true });
    },
    [basePath, navigate, discographyMatch, searchParams]
  );

  useEffect(() => {
    const loadFriends = async () => {
      if (!artistData?.id) return;
      try {
        const friendsData = await fetchArtistFriendsListened(artistData.id);
        const friendsArray =
          friendsData?.data?.friends ||
          friendsData?.friends ||
          (Array.isArray(friendsData) ? friendsData : null) ||
          (Array.isArray(friendsData?.data) ? friendsData.data : null);
        if (friendsArray && friendsArray.length > 0) {
          setFriendsListened(friendsArray);
        }
      } catch (e) {
        console.error("Failed to load artist friends listened", e);
      }
    };

    loadFriends();
  }, [artistData?.id]);

  useEffect(() => {
    let alive = true;
    const loadInfo = async () => {
      if (!artistData?.id) return;
      try {
        const res = await fetchArtistInfo(artistData.id);
        if (!alive || !res) return;
        const place = [res.birthPlace, res.country].filter(Boolean).join(", ");
        setArtistInfo({
          type: res.type,
          bornName: res.realName,
          bornDate: res.birthDate,
          bornPlace: place || undefined,
          bornCity: res.birthPlace || undefined,
          bornCountry: res.country || undefined,
          biography: res.biography,
          mbid: res.mbid,
        });
      } catch (e) {
        console.error("Failed to load artist info", e);
      }
    };
    loadInfo();
    return () => { alive = false; };
  }, [artistData?.id]);

  if (!artistData) return null;

  const artistImage = artistData.images?.[0]?.url || artistData.coverUrl;
  const popularTracks = artistData.top_tracks || [];
  const albums = artistData.albums || [];

  return (
    <div className={styles.container}>

      <HeroItem
        dataAttribute={{ "data-artist-hero": true }}
        coverUrl={artistImage}
        title={artistData.name}
        type="Artist"
        userRating={artistData.userInteractions?.avgRating || 0}
        ratingTooltip="Your average rating"
        showCoverCard={true}
        coverWrapperClassName={styles.circularCoverWrapper}
        coverClassName={styles.circularCoverImage}
        subtitle={
          (artistData.genres?.length > 0 || artistData.followers != null) ? (
            <div className={styles.subtitleContainer}>
              {artistData.genres && artistData.genres.length > 0 && (
                <div className={styles.genresRow}>
                  {artistData.genres.map((genre) => (
                    <GenreTag key={genre} genre={genre} />
                  ))}
                </div>
              )}
              {artistData.followers != null && (
                <span className={styles.followersText}>
                  {Number(artistData.followers).toLocaleString()} followers
                </span>
              )}
            </div>
          ) : null
        }
        stats={
          <div className={styles.heroRightStats}>
            <div className={styles.statLineItem}>
              <span className={styles.statLineValue}>
                {artistData.stats?.listens || 0}
              </span>
              <span className={styles.statLineLabel}>Reviews</span>
            </div>
            <div className={styles.statSeparator} />
            <div className={styles.statLineItem}>
              <span className={styles.statLineValue}>
                {artistData.stats?.likes || 0}
              </span>
              <span className={styles.statLineLabel}>Likes</span>
            </div>
            <div className={styles.statSeparator} />
            <div className={styles.statLineItem}>
              <span className={styles.statLineValue}>
                {artistData.stats?.rating || 0}
              </span>
              <span className={styles.statLineLabel}>Avg. Rating</span>
            </div>
          </div>
        }
      >
        <FriendsFacePile users={friendsListened} />
      </HeroItem>

      <Tabs
        activeKey={activeTab}
        onChange={switchTab}
        items={[
          { key: "overview", label: "Overview" },
          { key: "discography", label: "Discography" },
          { key: "about", label: "About" },
        ]}
      />

      <div className={styles.tabContent}>
        <TabPanels activeKey={activeTab}>
          <TabPanel tabKey="overview" activeKey={activeTab}>
            <div className={styles.overviewTab}>
              <div className={styles.contentContainer}>
                <div className={styles.mainColumn}>
                  {popularTracks.length > 0 && (
                    <section className={styles.popularTracksSection}>
                      <div className={styles.sectionHeading}>
                        <h2>Popular Tracks</h2>
                      </div>
                      <TrackList
                        tracks={popularTracks}
                        showAlbumCover={true}
                        showAlbumName={true}
                        initialDisplayCount={5}
                        onViewMore={() => navigate(`${basePath}/discography?view=tracks`)}
                      />
                    </section>
                  )}

                  <Discography
                    albums={albums}
                    artist={artistData}
                    onViewMore={() => switchTab("discography")}
                  />
                  <SimilarArtists artistId={artistData.id} />
                </div>
                <div ref={overviewSidebarRef} className={styles.sidebar}>
                  <ArtistCard
                    artistName={artistData.name}
                    artistImage={artistImage}
                    stats={mockArtistStats}
                    biography={artistInfo?.biography ? artistInfo.biography.split(/\n+/)[0].match(/^[\s\S]*?[.!?](?=\s|$)/)?.[0]?.trim() || artistInfo.biography.split(/\n+/)[0] : null}
                    biographySource={artistInfo?.mbid ? { name: "MusicBrainz", url: `https://musicbrainz.org/artist/${artistInfo.mbid}` } : null}
                    genres={artistData.genres}
                    artistInfo={artistInfo || undefined}
                    bioReadMoreHref={`${basePath}/about`}
                  />
                  <LatestRelease artist={artistData} />
                  <div className={styles.statsCard}>
                    <Chart
                      data={mockArtistStats.monthlyData.map((d) => ({
                        date: new Date(d.year, d.month, 1),
                        value: d.plays,
                      }))}
                      type="artist"
                      title="Listening Activity"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel tabKey="discography" activeKey={activeTab}>
            <div className={styles.discographyTab}>
              <div className={styles.contentContainer}>
                <div className={styles.mainColumn}>
                  <DiscographyTab
                    artist={artistData}
                    searchQuery={discographyQuery}
                    activeCategory={activeCategory}
                    sortOrder={sortOrder}
                    activeView={viewParam}
                    activeDecade={activeDecade}
                    onCategoryChange={handleCategoryChange}
                    onSortChange={handleSortChange}
                    onViewChange={handleViewChange}
                    onDecadesChange={setAvailableDecades}
                  />
                </div>
                <div ref={discographySidebarRef} className={styles.discographySidebar}>
                  <div className={styles.searchBar}>
                    <TextInput
                      type="text"
                      icon={<FiSearch size={16} />}
                      clearable
                      onClear={clearDiscographySearch}
                      value={discographyInput}
                      onChange={(e) => handleDiscographyInput(e.target.value)}
                      placeholder="Search discography"
                    />
                  </div>
                  <LatestRelease artist={artistData} />
                  {availableDecades.length > 1 && (
                    <div className={styles.decadeChips}>
                      <button
                        type="button"
                        className={`${styles.decadeChip} ${activeDecade === "all" ? styles.decadeChipActive : ""}`}
                        onClick={() => setActiveDecade("all")}
                      >
                        All
                      </button>
                      {availableDecades.map((d) => (
                        <button
                          key={d}
                          type="button"
                          className={`${styles.decadeChip} ${activeDecade === d ? styles.decadeChipActive : ""}`}
                          onClick={() => setActiveDecade(d)}
                        >
                          {`${d}s`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel tabKey="about" activeKey={activeTab}>
            <div className={styles.aboutTab}>
              <AboutTab
                artist={artistData}
                artistImage={artistImage}
                stats={mockArtistStats}
              />
            </div>
          </TabPanel>
        </TabPanels>
      </div>
    </div>
  );
};

export default ArtistProfile;
