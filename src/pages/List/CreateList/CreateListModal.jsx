import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { FiSearch, FiX, FiArrowRight } from "react-icons/fi";
import { IoMusicalNotesOutline } from "react-icons/io5";
import { FaList } from "react-icons/fa6";

import styles from "./CreateListModal.module.css";
import Image from "../../../components/Utils/Images/Image/Image";
import { getTrackCover } from "../../../components/Utils/Formater/Track";
import ArtistList from "../../../components/Utils/ArtistList/ArtistList";
import SearchTracksSkeleton from "../../../components/Utils/Skeletons/SearchTracksSkeleton";
import { searchTracks } from "../../../services/HandleSearch";
import { getRecentTrackLogs } from "../../../services/HandleLogs";
import useScrollLock from "../../../hooks/useScrollLock";
import { useUserContext } from "../../../contexts/UserContext";
import { TextInput } from "../../../components/Utils/Inputs/Inputs";


const CLOSE_DURATION = 250;

const CreateListModal = ({ onComplete }) => {
    const { userLogged } = useUserContext();
    useScrollLock();

    const [step, setStep] = useState("welcome");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [modalTracks, setModalTracks] = useState([]);
    const [isClosing, setIsClosing] = useState(false);
    const [lastTracks, setLastTracks] = useState([]);
    const [isLoadingLastTracks, setIsLoadingLastTracks] = useState(false);

    const closeModal = useCallback((result) => {
        setIsClosing(true);
        setTimeout(() => onComplete(result), CLOSE_DURATION);
    }, [onComplete]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") closeModal({ tracks: [], listName: "" });
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [closeModal]);

    useEffect(() => {
        if (step !== "search") return;

        if (searchQuery.length <= 1) {
            setSearchResults([]);
            setIsSearching(false);
            setHasSearched(false);
            return;
        }

        const delay = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await searchTracks(searchQuery, 5);
                setSearchResults(results);
            } catch {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
                setHasSearched(true);
            }
        }, 300);

        return () => clearTimeout(delay);
    }, [searchQuery, step]);

    useEffect(() => {
        const userId = userLogged?._id || userLogged?.id;
        const loadLastTracks = async () => {
            setIsLoadingLastTracks(true);
            const logs = await getRecentTrackLogs(userId, 5);
            setLastTracks(logs);
            setIsLoadingLastTracks(false);
        };
        loadLastTracks();
    }, [step, userLogged?._id, userLogged?.id]);

    const handleAddTrack = (item) => {
        if (!modalTracks.find((t) => t.id === item.id)) {
            const newTrack = { ...item, type: "track" };
            if (modalTracks.length === 0) {
                closeModal({ tracks: [newTrack], listName: "" });
                return;
            }
            setModalTracks([...modalTracks, newTrack]);
        }
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleRemoveTrack = (id) => {
        setModalTracks(modalTracks.filter((t) => t.id !== id));
    };

    const content = (
        <div className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ""}`} onClick={() => closeModal({ tracks: [], listName: "" })}>
            <div className={`${styles.modal} ${isClosing ? styles.modalClosing : ""}`} onClick={(e) => e.stopPropagation()}>
                {step === "welcome" ? (
                    <div className={styles.welcomeStep}>
                        <button
                            className={styles.welcomeClose}
                            onClick={() => closeModal({ tracks: [], listName: "" })}
                            aria-label="Close modal"
                        >
                            <FiX size={18} />
                        </button>
                        <div className={styles.welcomeIconWrapper}>
                            <FaList className={styles.welcomeIcon} />
                        </div>
                        <span className={styles.welcomeTitle}>Let's set up your list</span>
                        <span className={styles.welcomeSubtitle}>
                            Create a collection of your favorite tracks or albums. Start by adding your first item.
                        </span>
                        <button className={styles.welcomeButton} onClick={() => setStep("search")}>
                            Get Started
                            <FiArrowRight />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={styles.header}>
                            <div className={styles.searchBar}>
                                <TextInput
                                    type="text"
                                    icon={<FiSearch />}
                                    clearable
                                    placeholder="Search for a track or album..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <button
                                className={styles.closeButton}
                                onClick={() => searchQuery ? setSearchQuery("") : closeModal({ tracks: [], listName: "" })}
                                aria-label={searchQuery ? "Clear search" : "Close modal"}
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className={styles.body}>
                            {searchQuery.length > 1 && (isSearching || hasSearched) ? (
                                <div className={styles.resultsList}>
                                    {isSearching ? (
                                        <SearchTracksSkeleton count={5} />
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map((item) => (
                                            <div
                                                key={item.id}
                                                className={styles.resultItem}
                                                onClick={() => handleAddTrack(item)}
                                            >
                                                <Image
                                                    src={getTrackCover(item, 2)}
                                                    alt={item?.name}
                                                    fallbackVariant="cover"
                                                    className={styles.resultImg}
                                                />
                                                <div className={styles.resultInfo}>
                                                    <span className={styles.resultName}>{item.name}</span>
                                                    <span className={styles.resultArtist}>
                                                        <ArtistList artists={item?.artists || (item?.primaryArtist ? [item.primaryArtist] : [])} />
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : hasSearched ? (
                                        <div className={styles.searchFeedback}>
                                            <FiSearch className={styles.feedbackIcon} />
                                            <span className={styles.feedbackText}>
                                                No tracks found for "<strong>{searchQuery}</strong>"
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                            ) : modalTracks.length > 0 ? (
                                <>
                                    <span className={styles.addedLabel}>
                                        {modalTracks.length} {modalTracks.length === 1 ? "track" : "tracks"} added
                                    </span>
                                    <div className={styles.addedTracks}>
                                        {modalTracks.map((track) => (
                                            <div key={track.id} className={styles.addedTrack}>
                                                <Image
                                                    src={getTrackCover(track, 2)}
                                                    alt={track?.name}
                                                    fallbackVariant="cover"
                                                    className={styles.addedTrackCover}
                                                />
                                                <div className={styles.addedTrackInfo}>
                                                    <span className={styles.addedTrackName}>{track.name}</span>
                                                    <span className={styles.addedTrackArtist}>
                                                        <ArtistList artists={track?.artists || []} />
                                                    </span>
                                                </div>
                                                <button
                                                    className={styles.removeTrackBtn}
                                                    onClick={() => handleRemoveTrack(track.id)}
                                                >
                                                    <FiX />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : lastTracks.length > 0 ? (
                                <>
                                    <span className={styles.addedLabel}>Recomendations for your list</span>
                                    <div className={styles.resultsList}>
                                        {lastTracks.map((item) => (
                                            <div
                                                key={item._id}
                                                className={styles.resultItem}
                                                onClick={() => handleAddTrack({ ...item, id: item.trackId || item._id })}
                                            >
                                                <Image
                                                    src={item.coverUrl || item.images?.[0]?.url}
                                                    alt={item?.name}
                                                    fallbackVariant="cover"
                                                    className={styles.resultImg}
                                                />
                                                <div className={styles.resultInfo}>
                                                    <span className={styles.resultName}>{item.name}</span>
                                                    <span className={styles.resultArtist}>
                                                        <ArtistList artists={item?.artists || (item?.primaryArtist ? [item.primaryArtist] : [])} />
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : isLoadingLastTracks ? (
                                <div className={styles.searchFeedback}>
                                    <FiSearch className={styles.feedbackIcon} />
                                    <span className={styles.feedbackText}>Loading recommendations...</span>
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIconWrapper}>
                                        <IoMusicalNotesOutline className={styles.emptyIcon} />
                                    </div>
                                    <span className={styles.emptyTitle}>Add your first item on list</span>
                                    <span className={styles.emptySubtitle}>
                                        Search for a track to get started. You can always add more later.
                                    </span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return ReactDOM.createPortal(content, document.body);
};

export default CreateListModal;
