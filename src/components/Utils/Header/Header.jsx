import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import style from "./Header.module.css";
import { UserLoggedContext } from "../../../contexts/UserLoggedContext";
import { LogContainerContext } from "../../../contexts/LogContainerContext";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import Image from "../Images/Image/Image";
import useClickOutside from "../../../hooks/useClickOutside";
import TrackReviewModal from "../../Review/TrackReviewModal/TrackReviewModal";
import { Button } from "../../Utils/Buttons/Button";
import NotificationCenter from "../../Notifications/NotificationCenter";
import ActionMenu from "../../Utils/Dropdown/ActionMenu";
import AddToListModal from "../../Utils/AddToListModal/AddToListModal";
import { getTrackCover } from "../Formater/Track";
import { searchAll } from "../../../services/HandleSearch";
import ArtistList from "../ArtistList/ArtistList";
import TrackAlbumTitle from "../TrackAlbumTitle/TrackAlbumTitle";
import UserDropdown from "../UserDropdown/UserDropdown";
import { RiPlayListAddLine } from "react-icons/ri";
import {
   FiSearch,
   FiUser,
   FiX,
   FiPlus,
   FiChevronRight,
   FiMoreHorizontal,
   FiEye,
} from "react-icons/fi";
import { ListStart, ListEnd, Play } from "lucide-react";
import { usePlayer } from "../../../contexts/PlayerContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { useRelativeColor, useRelativeColorContrast } from "../../../contexts/RelativeColorContext";
import showToast from "../../Utils/Toast/Toast";
import { createTrackSlug, createAlbumSlug, createArtistSlug } from "../../../utils/formatters/textFormatters";
import { TextInput } from "../Inputs/Inputs";

const Header = () => {
   const { theme } = useTheme();
   const { isLight: heroBgIsLight, bgUrl } = useRelativeColor();
   const { userLogged, loading } = useContext(UserLoggedContext);
   const { showLogContainer, setShowLogContainer, selectedTrack, setSelectedTrack } =
      useContext(LogContainerContext);
   const { isPlayerVisible, currentTrack, isPlaying, playTrackInQueue, addToQueue, addNextToQueue, addAlbumToQueue, playAlbumInQueue, showTheaterMode } = usePlayer();
   const { openModal } = useAuthModal();
   const [isSearchActive, setIsSearchActive] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const [searchResults, setSearchResults] = useState({ tracks: [], albums: [], artists: [], users: [] });
   const [searchFilter, setSearchFilter] = useState("all");
   const [dropdownOpen, setDropdownOpen] = useState(false);
   const [scrolled, setScrolled] = useState(false);
   const [activeIndex, setActiveIndex] = useState(-1);
   const [activeMenu, setActiveMenu] = useState(null);
   const [menuPosition, setMenuPosition] = useState(null);
   const [showListModal, setShowListModal] = useState(false);
   const [listModalTrack, setListModalTrack] = useState(null);

   const location = useLocation();
   const path = location.pathname;

   const isProfilePage =
      !path.startsWith("/search") && (
         /^\/[^\/]+$/.test(path) ||
         /^\/[^\/]+\/(reviews|lists)$/.test(path)
      );

   const isLandingPage = path === "/" && !userLogged;

   const isHeroPage =
      !path.startsWith("/search") && (
         path.startsWith("/track/") ||
         path.startsWith("/album/") ||
         path.startsWith("/artist/") ||
         (path.includes("/list/") && !path.endsWith("/lists")) ||
         path.includes("/log/") ||
         isProfilePage ||
         isLandingPage
      );

   const reviewOverlayRef = useRef(null);
   const searchInputRef = useRef(null);
   const dropdownRef = useRef(null);
   const searchRef = useRef(null);
   const headerRef = useRef(null);
   const logoRef = useRef(null);
   const profileBtnRef = useRef(null);
   const bellRef = useRef(null);

   const contrastEnabled = isHeroPage && !isProfilePage && !!bgUrl;

   const logoContrast = useRelativeColorContrast(logoRef, { enabled: contrastEnabled });
   const searchContrast = useRelativeColorContrast(searchRef, { enabled: contrastEnabled });
   const profileContrast = useRelativeColorContrast(profileBtnRef, { enabled: contrastEnabled });
   const bellContrast = useRelativeColorContrast(bellRef, { enabled: contrastEnabled });

   useClickOutside(reviewOverlayRef, () => setShowLogContainer(false));
   useClickOutside(dropdownRef, () => setDropdownOpen(false));
   useClickOutside(searchRef, () => {
      setIsSearchActive(false);
      setSearchQuery("");
      setSearchResults({ tracks: [], albums: [], artists: [], users: [] });
      setActiveIndex(-1);
   });

   const navigate = useNavigate();

   const toggleDropdown = () => {
      setDropdownOpen(!dropdownOpen);
      if (!dropdownOpen) {
         setIsSearchActive(false);
      }
   };

   const sortedUsers = searchResults.users;

   const showTracks = searchFilter === "all" || searchFilter === "tracks";
   const showAlbums = searchFilter === "all" || searchFilter === "albums";
   const showArtists = searchFilter === "all" || searchFilter === "artists";
   const showUsers = searchFilter === "all" || searchFilter === "users";

   const trackLimit = searchFilter === "tracks" ? 10 : 4;
   const albumLimit = searchFilter === "albums" ? 10 : 3;
   const artistLimit = searchFilter === "artists" ? 10 : 3;
   const userLimit = searchFilter === "users" ? 10 : 3;

   const trackSection = showTracks
      ? searchResults.tracks.slice(0, trackLimit).map((t) => ({ type: "track", data: t }))
      : [];
   const albumSection = showAlbums
      ? searchResults.albums.slice(0, albumLimit).map((a) => ({ type: "album", data: a }))
      : [];
   const artistSection = showArtists
      ? (searchResults.artists || []).slice(0, artistLimit).map((a) => ({ type: "artist", data: a }))
      : [];
   const userSection = showUsers
      ? sortedUsers.slice(0, userLimit).map((u) => ({ type: "user", data: u }))
      : [];

   const flatResults = [...trackSection, ...albumSection, ...artistSection, ...userSection];

   const fetchSearch = () => {
      const encodedTrackQuery = encodeURIComponent(searchQuery);
      encodedTrackQuery && navigate(`/search/${encodedTrackQuery}`);
      closeSearch();
   };

   const closeSearch = () => {
      setIsSearchActive(false);
      setSearchResults({ tracks: [], albums: [], artists: [], users: [] });
      setSearchQuery("");
      setActiveIndex(-1);
      setActiveMenu(null);
      setMenuPosition(null);
   };

   const toggleMenu = (e, trackId) => {
      e.preventDefault();
      e.stopPropagation();
      if (activeMenu === trackId) {
         setActiveMenu(null);
         setMenuPosition(null);
      } else {
         const rect = e.currentTarget.getBoundingClientRect();
         setMenuPosition({ top: rect.bottom, right: window.innerWidth - rect.right });
         setActiveMenu(trackId);
      }
   };

   const navigateToResult = (item) => {
      if (item.type === "track") {
         navigate(createTrackSlug(item.data.name, item.data.artists, item.data.id), { state: { trackId: item.data.id } });
      } else if (item.type === "album") {
         navigate(createAlbumSlug(item.data.name, item.data.artists, item.data.id), { state: { albumId: item.data.id } });
      } else if (item.type === "artist") {
         navigate(createArtistSlug(item.data.name, item.data.id), { state: { artistId: item.data.id } });
      } else if (item.type === "user") {
         navigate(`/${item.data.username || item.data.id}`);
      }
      closeSearch();
   };

   const handleKeyDown = (event) => {
      if (event.key === "Escape") {
         closeSearch();
         return;
      }
      if (!searchDropdownVisible) {
         if (event.key === "Enter") fetchSearch();
         return;
      }
      if (event.key === "ArrowDown") {
         event.preventDefault();
         setActiveIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0));
      } else if (event.key === "ArrowUp") {
         event.preventDefault();
         setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1));
      } else if (event.key === "Enter") {
         event.preventDefault();
         if (activeIndex >= 0 && activeIndex < flatResults.length) {
            navigateToResult(flatResults[activeIndex]);
         } else {
            fetchSearch();
         }
      }
   };

   const [show, setShow] = useState(true);
   const [isAtTop, setIsAtTop] = useState(true);
   const lastScrollY = useRef(0);

   useEffect(() => {
      const handleScroll = () => {
         const currentScrollY = window.scrollY;
         const isMobile = window.innerWidth <= 768;

         const shouldBeScrolled = currentScrollY > 20;
         setScrolled(shouldBeScrolled);

         const isTop = currentScrollY < 20;
         setIsAtTop(isTop);

         if (currentScrollY > lastScrollY.current && currentScrollY > 20) {
            setShow(false);
         } else {
            setShow(true);
         }

         lastScrollY.current = currentScrollY;
      };

      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
         window.removeEventListener("scroll", handleScroll);
      };
   }, []);

   useEffect(() => {
      if (showTheaterMode) setShow(true);
   }, [showTheaterMode]);

   useEffect(() => {
      const updateOffset = () => {
         const h = headerRef.current?.offsetHeight || 70;
         document.documentElement.style.setProperty(
            "--header-offset",
            show ? `${h + 16}px` : "16px"
         );
      };
      updateOffset();
      window.addEventListener("resize", updateOffset);
      return () => window.removeEventListener("resize", updateOffset);
   }, [show]);

   const searchDropdownVisible = isSearchActive && searchQuery.length > 1;

   useEffect(() => {
      if (searchDropdownVisible) {
         document.body.classList.add("search-dropdown-open");
      } else {
         document.body.classList.remove("search-dropdown-open");
      }
      return () => document.body.classList.remove("search-dropdown-open");
   }, [searchDropdownVisible]);

   useEffect(() => {
      if (isSearchActive && searchInputRef.current) {
         setTimeout(() => {
            searchInputRef.current.focus();
         }, 100);
      }
   }, [isSearchActive]);

   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      const delayDebounceFn = setTimeout(async () => {
         if (searchQuery.length > 1) {
            setIsLoading(true);
            setActiveIndex(-1);
            try {
               const results = await searchAll(searchQuery, { limit: 10 });
               setSearchResults({
                  tracks: results.tracks || [],
                  albums: results.albums || [],
                  artists: results.artists || [],
                  users: results.users || [],
               });
            } catch (error) {
               setSearchResults({ tracks: [], albums: [], artists: [], users: [] });
            } finally {
               setIsLoading(false);
            }
         } else {
            setSearchResults({ tracks: [], albums: [], artists: [], users: [] });
            setIsLoading(false);
         }
      }, 300);

      return () => clearTimeout(delayDebounceFn);
   }, [searchQuery]);

   useEffect(() => {
      setIsSearchActive(false);
      setDropdownOpen(false);
   }, [location.pathname]);

   const transparentActive = showTheaterMode || (isHeroPage && (isAtTop || !show));

   const HERO_OVERLAY_ALPHA = 0.4;
   const HERO_OVERLAY_LUM = 0.005;
   const effectiveIsLight = (info) => {
      if (!info) return heroBgIsLight;
      const eff = info.luminance * (1 - HERO_OVERLAY_ALPHA) + HERO_OVERLAY_LUM * HERO_OVERLAY_ALPHA;
      return eff > 0.55;
   };
   const colorFor = (info) => {
      if (!transparentActive || !contrastEnabled) return undefined;
      return effectiveIsLight(info) ? "rgba(0,0,0,0.88)" : "rgba(255,255,255,0.95)";
   };

   return (
      <header
         ref={headerRef}
         className={`${style.navbar} ${isSearchActive ? style.navbarSearchActive : ""
            } ${!show ? style.headerHidden : ""} ${transparentActive ? style.transparent : ""} ${showTheaterMode ? style.theater : ""} ${transparentActive && heroBgIsLight && !isProfilePage && !showTheaterMode ? style.invert : ""}`}
      >
         <div className={style.navbarContent}>
            <Link to="/" className={style.logo} ref={logoRef}>
               <img
                  src={
                     (transparentActive && contrastEnabled && effectiveIsLight(logoContrast)) ||
                        (!transparentActive && theme === "light")
                        ? "/TrackrLogoDark.png"
                        : "/TrackrLogo.png"
                  }
                  alt="Trackr Logo"
                  className={style.logoImg}
               />
            </Link>

            <div className={style.profileContainer}>
               <div
                  ref={searchRef}
                  className={`${style.searchBar} ${isSearchActive ? style.searchBarOpen : ""
                     } ${searchDropdownVisible ? style.hasResults : ""
                     }`}
                  style={isSearchActive ? undefined : { color: colorFor(searchContrast) }}
                  onClick={() => {
                     if (!isSearchActive) {
                        setIsSearchActive(true);
                        setDropdownOpen(false);
                     }
                  }}
               >
                  {isSearchActive ? (
                     <div className={style.searchBarInner}>
                        <TextInput
                           type="text"
                           ref={searchInputRef}
                           icon={<FiSearch size={18} />}
                           clearable
                           onClear={() => {
                              setSearchQuery("");
                              setActiveIndex(-1);
                              searchInputRef.current?.focus();
                           }}
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           onKeyDown={handleKeyDown}
                           placeholder="Search tracks, albums, users, lyrics..."
                           containerClassName={style.searchInputContainer}
                           className={style.searchInputField}
                        />
                     </div>
                  ) : (
                     <span className={style.searchIcon} aria-hidden="true">
                        <FiSearch size={18} />
                     </span>
                  )}

                  {searchDropdownVisible && (
                     <div className={style.searchResultsDropdown}>
                        <div className={style.searchFilterBar} onMouseDown={(e) => e.stopPropagation()}>
                           {[
                              { key: "all", label: "All" },
                              { key: "tracks", label: "Tracks" },
                              { key: "albums", label: "Albums" },
                              { key: "artists", label: "Artists" },
                              { key: "users", label: "Users" },
                           ].map((opt) => {
                              const active = searchFilter === opt.key;
                              return (
                                 <button
                                    key={opt.key}
                                    type="button"
                                    className={`${style.searchFilterBtn} ${active ? style.searchFilterBtnActive : ""}`}
                                    onClick={() => !active && setSearchFilter(opt.key)}
                                 >
                                    {opt.label}
                                 </button>
                              );
                           })}
                        </div>
                        <div className={style.searchResultsInner}>
                           {isLoading ? (
                              <div className={style.searchMessage}>
                                 <div className={style.searchSpinner} />
                                 Searching...
                              </div>
                           ) : flatResults.length > 0 ? (
                              <>
                                 {(() => {
                                    const renderTrackSection = () => showTracks && searchResults.tracks.length > 0 && (
                                       <div key="tracks" className={style.searchCategory}>
                                          <div className={style.searchCategoryHeader}>
                                             <span>Tracks</span>
                                          </div>
                                          {searchResults.tracks.slice(0, trackLimit).map((track, i, arr) => {
                                             const idx = flatResults.findIndex((r) => r.type === "track" && r.data.id === track.id);
                                             const isLast = i === arr.length - 1;
                                             const ui = track.userInteractions || {};
                                             const reviewLink = ui.reviewId && userLogged?.username
                                                ? `/${userLogged.username}/log/${ui.reviewId}`
                                                : undefined;
                                             return (
                                                <Link
                                                   key={track.id}
                                                   to={createTrackSlug(track.name, track.artists, track.id)}
                                                   state={{ trackId: track.id }}
                                                   onClick={closeSearch}
                                                   className={`${style.searchResultItem} ${idx === activeIndex ? style.searchResultActive : ""} ${isLast ? style.searchResultItemLast : ""}`}
                                                >
                                                   <Image
                                                      src={getTrackCover(track)}
                                                      alt={track?.name}
                                                      fallbackVariant="cover"
                                                      className={style.searchResultImg}
                                                   />
                                                   <div className={style.searchResultInfo}>
                                                      <TrackAlbumTitle
                                                         title={track.name}
                                                         rating={ui.rating}
                                                         liked={ui.liked}
                                                         tagSize="0.7rem"
                                                         logUrl={reviewLink}
                                                         ellipsis
                                                         className={`${style.searchResultName} ${style.searchResultNameText}`}
                                                      />
                                                      <ArtistList
                                                         artists={track.artists || []}
                                                         className={style.searchResultArtist}
                                                      />
                                                   </div>
                                                   <div className={style.moreMenuContainer}>
                                                      <button
                                                         className={style.moreButton}
                                                         onMouseDown={(e) => e.stopPropagation()}
                                                         onClick={(e) => toggleMenu(e, track.id)}
                                                      >
                                                         <FiMoreHorizontal size={16} />
                                                      </button>
                                                      {activeMenu === track.id && (
                                                         <ActionMenu
                                                            onClose={() => { setActiveMenu(null); setMenuPosition(null); }}
                                                            position={menuPosition}
                                                            items={[
                                                               {
                                                                  label: "View Track",
                                                                  icon: <FiEye size={18} />,
                                                                  onClick: (e) => {
                                                                     e.preventDefault();
                                                                     e.stopPropagation();
                                                                     navigate(createTrackSlug(track.name, track.artists, track.id), { state: { trackId: track.id } });
                                                                     closeSearch();
                                                                  },
                                                               },
                                                               {
                                                                  label: "Review Track",
                                                                  icon: <FiPlus size={18} />,
                                                                  onClick: (e) => {
                                                                     e.preventDefault();
                                                                     e.stopPropagation();
                                                                     setSelectedTrack(track);
                                                                     setShowLogContainer(true);
                                                                     closeSearch();
                                                                  },
                                                               },
                                                               {
                                                                  label: "Save to List",
                                                                  icon: <RiPlayListAddLine size={18} />,
                                                                  onClick: (e) => {
                                                                     e.preventDefault();
                                                                     e.stopPropagation();
                                                                     setListModalTrack(track.id);
                                                                     setShowListModal(true);
                                                                     setActiveMenu(null);
                                                                     closeSearch();
                                                                  },
                                                               },
                                                               ...(!(currentTrack?.trackId === track.id && isPlaying) ? [
                                                                  {
                                                                     label: "Play track",
                                                                     icon: <Play size={18} />,
                                                                     onClick: (e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        playTrackInQueue({ id: track.id, title: track.name, artist: track.primaryArtist?.name, coverUrl: track.albumCover || track.coverUrl });
                                                                        closeSearch();
                                                                     },
                                                                     section: "queue",
                                                                  },
                                                               ] : []),
                                                               ...(isPlayerVisible ? [
                                                                  {
                                                                     label: "Play next",
                                                                     icon: <ListStart size={18} />,
                                                                     onClick: (e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        addNextToQueue({ id: track.id, title: track.name, artist: track.primaryArtist?.name, coverUrl: track.albumCover || track.coverUrl });
                                                                        showToast(`Playing next: ${track.name}`, "success");
                                                                        closeSearch();
                                                                     },
                                                                     section: "queue",
                                                                  },
                                                                  {
                                                                     label: "Add to queue",
                                                                     icon: <ListEnd size={18} />,
                                                                     onClick: (e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        addToQueue({ id: track.id, title: track.name, artist: track.primaryArtist?.name, coverUrl: track.albumCover || track.coverUrl });
                                                                        showToast(`Added to queue: ${track.name}`, "success");
                                                                        closeSearch();
                                                                     },
                                                                     section: "queue",
                                                                  },
                                                               ] : []),
                                                            ]}
                                                         />
                                                      )}
                                                   </div>
                                                </Link>
                                             );
                                          })}
                                       </div>
                                    );

                                    const renderAlbumSection = () => showAlbums && searchResults.albums.length > 0 && (
                                       <div key="albums" className={style.searchCategory}>
                                          <div className={style.searchCategoryHeader}>
                                             <span>Albums</span>
                                          </div>
                                          {searchResults.albums.slice(0, albumLimit).map((album, i, arr) => {
                                             const idx = flatResults.findIndex((r) => r.type === "album" && r.data.id === album.id);
                                             const isLast = i === arr.length - 1;
                                             const ui = album.userInteractions || {};
                                             const reviewLink = ui.reviewId && userLogged?.username
                                                ? `/${userLogged.username}/log/${ui.reviewId}`
                                                : undefined;
                                             return (
                                                <Link
                                                   key={album.id}
                                                   to={createAlbumSlug(album.name, album.artists, album.id)}
                                                   state={{ albumId: album.id }}
                                                   onClick={closeSearch}
                                                   className={`${style.searchResultItem} ${idx === activeIndex ? style.searchResultActive : ""} ${isLast ? style.searchResultItemLast : ""}`}
                                                >
                                                   <Image
                                                      src={album.images?.[0]?.url || album.coverUrl}
                                                      alt={album?.name}
                                                      fallbackVariant="cover"
                                                      className={`${style.searchResultImg} ${style.searchResultImgAlbum}`}
                                                   />
                                                   <div className={style.searchResultInfo}>
                                                      <TrackAlbumTitle
                                                         title={album.name}
                                                         rating={ui.rating}
                                                         liked={ui.liked}
                                                         tagSize="0.7rem"
                                                         logUrl={reviewLink}
                                                         ellipsis
                                                         className={`${style.searchResultName} ${style.searchResultNameText}`}
                                                      />
                                                      <ArtistList
                                                         artists={album.artists || []}
                                                         className={style.searchResultArtist}
                                                      />
                                                   </div>
                                                   <div className={style.moreMenuContainer}>
                                                      <button
                                                         className={style.moreButton}
                                                         onMouseDown={(e) => e.stopPropagation()}
                                                         onClick={(e) => toggleMenu(e, `album-${album.id}`)}
                                                      >
                                                         <FiMoreHorizontal size={16} />
                                                      </button>
                                                      {activeMenu === `album-${album.id}` && (
                                                         <ActionMenu
                                                            onClose={() => { setActiveMenu(null); setMenuPosition(null); }}
                                                            position={menuPosition}
                                                            items={[
                                                               {
                                                                  label: "View Album",
                                                                  icon: <FiEye size={18} />,
                                                                  onClick: (e) => {
                                                                     e.preventDefault();
                                                                     e.stopPropagation();
                                                                     navigate(createAlbumSlug(album.name, album.artists, album.id), { state: { albumId: album.id } });
                                                                     closeSearch();
                                                                  },
                                                               },
                                                               ...(isPlayerVisible ? [
                                                                  {
                                                                     label: "Add to queue",
                                                                     icon: <ListEnd size={18} />,
                                                                     onClick: (e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        addAlbumToQueue(album.id).then((count) => {
                                                                           if (count > 0) showToast(`Added ${count} tracks to queue`, "success");
                                                                        });
                                                                        closeSearch();
                                                                     },
                                                                     section: "queue",
                                                                  },
                                                               ] : []),
                                                            ]}
                                                         />
                                                      )}
                                                   </div>
                                                </Link>
                                             );
                                          })}
                                       </div>
                                    );

                                    const renderArtistSection = () => showArtists && (searchResults.artists || []).length > 0 && (
                                       <div key="artists" className={style.searchCategory}>
                                          <div className={style.searchCategoryHeader}>
                                             <span>Artists</span>
                                          </div>
                                          {(searchResults.artists || []).slice(0, artistLimit).map((artist, i, arr) => {
                                             const idx = flatResults.findIndex((r) => r.type === "artist" && r.data.id === artist.id);
                                             const isLast = i === arr.length - 1;
                                             const imageUrl = artist.coverUrl || artist.images?.[0]?.url || artist.imageUrl;
                                             const genre = artist.genres?.[0];
                                             return (
                                                <Link
                                                   key={artist.id}
                                                   to={createArtistSlug(artist.name, artist.id)}
                                                   state={{ artistId: artist.id }}
                                                   onClick={closeSearch}
                                                   className={`${style.searchResultItem} ${idx === activeIndex ? style.searchResultActive : ""} ${isLast ? style.searchResultItemLast : ""}`}
                                                >
                                                   <div className={style.searchResultAvatar}>
                                                      <Image
                                                         src={imageUrl}
                                                         name={artist.name}
                                                         size={36}
                                                         showBadge={false}
                                                      />
                                                   </div>
                                                   <div className={style.searchResultInfo}>
                                                      <span className={style.searchResultName}>{artist.name}</span>
                                                      {genre && (
                                                         <span className={style.searchResultArtist}>{genre}</span>
                                                      )}
                                                   </div>
                                                </Link>
                                             );
                                          })}
                                       </div>
                                    );

                                    const renderUserSection = () => showUsers && sortedUsers.length > 0 && (
                                       <div key="users" className={style.searchCategory}>
                                          <div className={style.searchCategoryHeader}>
                                             <span>Users</span>
                                          </div>
                                          {sortedUsers.slice(0, userLimit).map((user, i, arr) => {
                                             const idx = flatResults.findIndex((r) => r.type === "user" && r.data.id === (user._id || user.id));
                                             const isLast = i === arr.length - 1;
                                             const userId = user._id || user.id;
                                             return (
                                                <Link
                                                   key={userId}
                                                   to={`/${user.username || user.id}`}
                                                   onClick={closeSearch}
                                                   className={`${style.searchResultItem} ${idx === activeIndex ? style.searchResultActive : ""} ${isLast ? style.searchResultItemLast : ""}`}
                                                >
                                                   <div className={style.searchResultAvatar}>
                                                      <Image
                                                         src={user?.userimage || user?.image || user?.userImage}
                                                         name={user?.username}
                                                         userId={user?._id || user?.id}
                                                         status={user?.status}
                                                         size={36}
                                                      />
                                                   </div>
                                                   <div className={style.searchResultInfo}>
                                                      <span className={style.searchResultName}>{user.name || user.username}</span>
                                                      <span className={style.searchResultArtist}>@{user.username}</span>
                                                   </div>
                                                   <div className={style.moreMenuContainer}>
                                                      <button
                                                         className={style.moreButton}
                                                         onMouseDown={(e) => e.stopPropagation()}
                                                         onClick={(e) => toggleMenu(e, `user-${userId}`)}
                                                      >
                                                         <FiMoreHorizontal size={16} />
                                                      </button>
                                                      {activeMenu === `user-${userId}` && (
                                                         <ActionMenu
                                                            onClose={() => { setActiveMenu(null); setMenuPosition(null); }}
                                                            position={menuPosition}
                                                            items={[
                                                               {
                                                                  label: "View Profile",
                                                                  icon: <FiUser size={18} />,
                                                                  onClick: (e) => {
                                                                     e.preventDefault();
                                                                     e.stopPropagation();
                                                                     navigate(`/${user.username || user.id}`);
                                                                     closeSearch();
                                                                  },
                                                               },
                                                            ]}
                                                         />
                                                      )}
                                                   </div>
                                                </Link>
                                             );
                                          })}
                                       </div>
                                    );

                                    return [
                                       renderTrackSection(),
                                       renderAlbumSection(),
                                       renderArtistSection(),
                                       renderUserSection(),
                                    ];
                                 })()}

                              </>
                           ) : (
                              <div className={style.searchMessage}>
                                 <FiSearch size={20} />
                                 No results found for "{searchQuery}"
                              </div>
                           )}
                        </div>
                        {!isLoading && flatResults.length > 0 && (
                           <Link
                              to={`/search/${encodeURIComponent(searchQuery)}`}
                              onClick={closeSearch}
                              className={style.searchSeeAll}
                           >
                              See all results for "{searchQuery}"
                              <FiChevronRight size={16} />
                           </Link>
                        )}
                     </div>
                  )}
               </div>

               {!loading && (
                  <>
                     {userLogged ? (
                        <>
                           <span
                              ref={bellRef}
                              style={{
                                 display: "inline-flex",
                                 "--header-icon-color": colorFor(bellContrast),
                              }}
                           >
                              <NotificationCenter />
                           </span>

                           <button
                              ref={profileBtnRef}
                              className={`${style.profileButton} ${dropdownOpen ? style.active : ""
                                 }`}
                              style={{ color: colorFor(profileContrast) }}
                              onClick={toggleDropdown}
                              aria-label="User Menu"
                              aria-expanded={dropdownOpen}
                           >
                              <Image
                                 src={userLogged?.userimage || userLogged?.image || userLogged?.userImage}
                                 name={userLogged?.username}
                                 userId={userLogged?._id || userLogged?.id}
                                 size={45}
                                 status={userLogged?.status || "online"}
                              />
                           </button>
                        </>
                     ) : (
                        <>
                           <Button
                              variant="primary"
                              size="md"
                              onClick={() => openModal("login")}
                              className={style.signUpButton}
                           >
                              Sign in
                           </Button>
                        </>
                     )}
                  </>
               )}
            </div>

            <UserDropdown
               ref={dropdownRef}
               open={dropdownOpen}
               onClose={() => setDropdownOpen(false)}
            />

            { }
            {showLogContainer && selectedTrack && (
               <TrackReviewModal
                  trackId={selectedTrack.id || selectedTrack.trackId}
                  onClose={() => setShowLogContainer(false)}
               />
            )}
            {showListModal && listModalTrack && (
               <AddToListModal
                  trackId={listModalTrack}
                  onClose={() => { setShowListModal(false); setListModalTrack(null); }}
               />
            )}
         </div>
      </header>
   );
};

export const SimpleHeader = () => {
   const { theme } = useTheme();
   return (
      <header className={style.simpleHeader}>
         <Link to="/">
            <img src={theme === "light" ? "/TrackrLogoDark.png" : "/TrackrLogo.png"} alt="Trackr" className={style.simpleLogo} />
         </Link>
         <div className={style.simpleLinks}>
            <Link to="/privacy-policy" className={style.simpleLink}>
               Privacy Policies
            </Link>
            <Link to="/terms-of-use" className={style.simpleLink}>
               Terms of Use
            </Link>
         </div>
      </header>
   );
};

export default Header;
