import { useEffect, useCallback, useRef } from "react";

const useInfiniteScroll = (loadMore, hasMore, isLoading, threshold = 200) => {
  const observerRef = useRef(null);
  const loadMoreTimeoutRef = useRef(null);
  const loadingTriggeredRef = useRef(false);
  const lastLoadTimeRef = useRef(0);
  const debounceTimeoutRef = useRef(null);

  const checkScrollPosition = useCallback(() => {
    if (isLoading || !hasMore || loadingTriggeredRef.current) return;

    const now = Date.now();
    if (now - lastLoadTimeRef.current < 800) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const distanceFromBottom = documentHeight - scrollTop - windowHeight;

    if (distanceFromBottom < threshold) {
      loadingTriggeredRef.current = true;

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      if (loadMoreTimeoutRef.current) clearTimeout(loadMoreTimeoutRef.current);
      loadMoreTimeoutRef.current = setTimeout(() => {
        lastLoadTimeRef.current = Date.now();
        loadMore();
        setTimeout(() => {
          loadingTriggeredRef.current = false;
        }, 800);
      }, 200);
    }
  }, [loadMore, hasMore, isLoading, threshold]);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        loadingTriggeredRef.current = false;
      }, 500);
    }
  }, [isLoading]);

  useEffect(() => {
    const scrollHandler = () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        checkScrollPosition();
      }, 50);
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });

    setTimeout(checkScrollPosition, 500);

    return () => {
      window.removeEventListener("scroll", scrollHandler);
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [checkScrollPosition]);

  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0]?.isIntersecting &&
            hasMore &&
            !isLoading &&
            !loadingTriggeredRef.current
          ) {
            const now = Date.now();
            if (now - lastLoadTimeRef.current < 500) return;

            loadingTriggeredRef.current = true;

            if (loadMoreTimeoutRef.current)
              clearTimeout(loadMoreTimeoutRef.current);
            loadMoreTimeoutRef.current = setTimeout(() => {
              lastLoadTimeRef.current = Date.now();
              loadMore();
              setTimeout(() => {
                loadingTriggeredRef.current = false;
              }, 800);
            }, 150);
          }
        },
        {
          threshold: 0.05,
          rootMargin: `0px 0px ${threshold * 1.5}px 0px`,
        }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore, loadMore, threshold]
  );

  return { lastElementRef };
};

export default useInfiniteScroll;
