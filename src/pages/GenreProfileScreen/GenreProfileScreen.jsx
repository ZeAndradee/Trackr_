import React from "react";
import { useLoaderData } from "react-router";
import { loaderFetch } from "../../services/ssrLoader";
import { buildMeta, collectionPageLd, breadcrumbLd } from "../../services/seo";

import GenreProfile from "../../components/Genre/GenreProfile/GenreProfile";
import styles from "./GenreProfileScreen.module.css";

export async function loader({ params, request }) {
  const slug = params.slug || params["*"] || "";
  if (!slug) {
    throw new Response("Genre not found", { status: 404 });
  }

  const genre = await loaderFetch(`/genres/${slug}`, request);
  if (!genre) {
    throw new Response("Genre not found", { status: 404 });
  }

  return { genre: { ...genre, slug: genre.slug || slug } };
}

export function meta({ data }) {
  const genre = data?.genre;
  if (!genre) return buildMeta({ title: "Genre • Trackr", noindex: true });

  const canonical = `/genre/${genre.slug}`;
  const description =
    genre.description ||
    `Explore ${genre.name} on Trackr. Discover top tracks, albums, artists, reviews and listeners in the ${genre.name} genre.`;

  return buildMeta({
    title: `${genre.name} — Top Tracks, Albums & Artists | Trackr`,
    description,
    canonical,
    image: genre.coverUrl || "",
    imageAlt: `${genre.name} genre`,
    jsonLd: [
      collectionPageLd({
        name: `${genre.name} on Trackr`,
        description,
        url: canonical,
        image: genre.coverUrl,
      }),
      breadcrumbLd([
        { name: "Trackr", url: "/" },
        { name: genre.name, url: canonical },
      ]),
    ],
  });
}

const GenreProfileScreen = () => {
  const { genre } = useLoaderData();

  return (
    <div className={styles.genreProfileScreen}>
      <GenreProfile key={genre.slug} genreData={genre} slug={genre.slug} />
    </div>
  );
};

export default GenreProfileScreen;
