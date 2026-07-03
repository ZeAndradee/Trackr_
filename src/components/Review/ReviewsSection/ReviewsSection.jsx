import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchAlbumReviews } from "../../../services/FetchAlbum";
import { fetchTrackReviews } from "../../../services/FetchTrack";
import ReviewItem from "../ReviewItem/ReviewItem";
import styles from "./ReviewsSection.module.css";
import { IoChatbubblesOutline } from "react-icons/io5";
import { MdSort } from "react-icons/md";
import ActionMenu from "../../Utils/Dropdown/ActionMenu";
import ReviewItemSkeleton from "../../Utils/Skeletons/ReviewItemSkeleton";
import { Button } from "../../Utils/Buttons/Button";


export const PopularReviews = ({ trackId, onReviewsLoaded, onEditReview }) => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeReplyId, setActiveReplyId] = useState(null);

    useEffect(() => {
        if (!trackId) return;
        setIsLoading(true);
        setReviews([]);

        fetchTrackReviews(trackId, 1, 3, "popular")
            .then((response) => {
                const total = response?.data?.pagination?.total || 0;
                if (total <= 10) {
                    setReviews([]);
                    if (onReviewsLoaded) onReviewsLoaded([]);
                    return;
                }
                const fetched = response?.data?.reviews || [];
                setReviews(fetched);
                if (onReviewsLoaded) {
                    onReviewsLoaded(fetched.map((r) => r._id));
                }
            })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, [trackId]);

    const handleViewAll = () => {
        const el = document.getElementById("reviews-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    if (isLoading) {
        return (
            <div className={styles.reviewsSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Popular Reviews</h3>
                </div>
                <div className={styles.reviewsList}>
                    {[1, 2, 3].map((n) => (
                        <ReviewItem key={n} loading={true} />
                    ))}
                </div>
            </div>
        );
    }

    if (reviews.length === 0) return null;

    return (
        <div className={styles.reviewsSection}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Popular Reviews</h3>
                <button className={styles.viewMoreButton} onClick={handleViewAll}>
                    View All
                </button>
            </div>
            <div className={styles.reviewsList}>
                {reviews.map((review) => (
                    <ReviewItem
                        key={review._id}
                        review={review}
                        isLast={false}
                        activeReplyId={activeReplyId}
                        setActiveReplyId={setActiveReplyId}
                        onEdit={onEditReview}
                    />
                ))}
            </div>
        </div>
    );
};

const ReviewsSection = ({ id, type = "album", title, onWriteReview, onEditReview, excludeIds = [] }) => {
    const [latestReviews, setLatestReviews] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [totalReviews, setTotalReviews] = useState(0);
    const [sortOrder, setSortOrder] = useState("popular");
    const [isSortingMenuOpen, setIsSortingMenuOpen] = useState(false);
    const [sortMenuPosition, setSortMenuPosition] = useState(null);

    const observer = useRef();
    const lastReviewElementRef = useCallback((node) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                setPage((prevPage) => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    useEffect(() => {
        setLatestReviews([]);
        setPage(1);
        setHasMore(false);
        setTotalReviews(0);
    }, [id, type, sortOrder]);

    useEffect(() => {
        let isMounted = true;
        const loadReviews = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                let latestResponse;
                if (type === "track") {
                    latestResponse = await fetchTrackReviews(id, page, 5, sortOrder);
                } else {
                    latestResponse = await fetchAlbumReviews(id, page, 5, sortOrder);
                }

                if (!isMounted) return;

                if (latestResponse && latestResponse.data) {
                    setLatestReviews(prev => page === 1 ? (latestResponse.data.reviews || []) : [...prev, ...(latestResponse.data.reviews || [])]);
                    setHasMore(latestResponse.data.pagination?.hasNextPage || false);

                    if (page === 1) {
                        const total = latestResponse.data.pagination?.total || latestResponse.data.reviews?.length || 0;
                        setTotalReviews(total);
                    }
                }
            } catch (err) {
                if (!isMounted) return;
                console.error("Failed to load reviews:", err);
                setError("Failed to load reviews");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadReviews();

        return () => {
            isMounted = false;
        };
    }, [id, type, page, sortOrder]);

    const sortingItems = [
        {
            label: "Popular",
            onClick: () => {
                setSortOrder("popular");
            },
        },
        {
            label: "Latest",
            onClick: () => {
                setSortOrder("latest");
            },
        }
    ];

    if (error && latestReviews.length === 0) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div id="reviews-section" className={styles.reviewsSection}>
            {isLoading && page === 1 && latestReviews.length === 0 ? (
                <div className={styles.reviewsList}>
                    {[1, 2, 3].map((n) => (
                        <ReviewItem key={n} loading={true} />
                    ))}
                </div>
            ) : latestReviews.length === 0 ? (
                <div className={styles.ctaContainer}>
                    <div className={styles.ctaIcon}>
                        <IoChatbubblesOutline />
                    </div>
                    <h4 className={styles.ctaTitle}>Start the Conversation</h4>
                    <p className={styles.ctaDescription}>
                        This {type} hasn't been reviewed yet. Be the first to share your
                        thoughts and help others discover this music.
                    </p>
                    <Button variant="primary" onClick={onWriteReview}>
                        Write a Review
                    </Button>
                </div>
            ) : (
                <>
                    <div>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.sectionTitle}>
                                Reviews <span className={styles.reviewsCount}>{totalReviews}</span>
                            </h3>
                            <div className={styles.headerControls}>
                                <div className={styles.sortDropdownContainer}>
                                    <button
                                        className={styles.sortButton}
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setSortMenuPosition({ top: rect.bottom, right: window.innerWidth - rect.right });
                                            setIsSortingMenuOpen(true);
                                        }}
                                    >
                                        <MdSort size={18} />
                                        {sortOrder === "popular" ? "Popular" : "Latest"}
                                    </button>
                                    {isSortingMenuOpen && (
                                        <ActionMenu
                                            items={sortingItems}
                                            onClose={() => setIsSortingMenuOpen(false)}
                                            position={sortMenuPosition}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.reviewsList}>
                            {latestReviews.filter((r) => !excludeIds.includes(r._id)).map((review, index, arr) => {
                                const isLast = arr.length === index + 1;
                                return (
                                    <div ref={isLast ? lastReviewElementRef : null} key={review._id}>
                                        <ReviewItem
                                            review={review}
                                            isLast={false}
                                            activeReplyId={activeReplyId}
                                            setActiveReplyId={setActiveReplyId}
                                            onEdit={onEditReview}
                                        />
                                    </div>
                                );
                            })}
                            {isLoading && page > 1 && (
                                <ReviewItemSkeleton />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReviewsSection;
