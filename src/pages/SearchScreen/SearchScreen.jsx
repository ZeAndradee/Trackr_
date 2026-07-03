import React, { lazy, Suspense } from "react";

import styles from "./SearchScreen.module.css";
import LoadingIndicator from "../../components/Utils/LoadingIndicator";
import { buildMeta } from "../../services/seo";

const Search = lazy(() => import("../../components/Search/Search"));

export function meta({ params }) {
  const query = params.query ? decodeURIComponent(params.query) : "";
  const title = query
    ? `Search results for "${query}" | Trackr`
    : "Search tracks, albums, artists & playlists | Trackr";
  const description = query
    ? `Search results for "${query}" on Trackr — tracks, albums, artists, playlists and users.`
    : "Search for tracks, albums, artists, playlists and users on Trackr.";
  return buildMeta({
    title,
    description,
    canonical: query ? undefined : "/search",
    noindex: true,
  });
}

const SearchLoading = () => (
  <div className={styles.loadingContainer}>
    <LoadingIndicator />
  </div>
);

const SearchScreen = () => {
  return (
    <>
      <div className={styles.searchScreen}>
        <Suspense fallback={<SearchLoading />}>
          <Search />
        </Suspense>
      </div>
    </>
  );
};

export default SearchScreen;
