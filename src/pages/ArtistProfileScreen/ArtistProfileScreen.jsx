import { useLoaderData, redirect } from "react-router";

import ArtistProfile from "../../components/Artist/ArtistProfile/ArtistProfile";
import styles from "./ArtistProfileScreen.module.css";
import { loaderFetch } from "../../services/ssrLoader";
import { buildMeta, musicGroupLd, breadcrumbLd } from "../../services/seo";
import { createArtistSlug } from "../../utils/formatters/textFormatters";

export async function loader({ params, request }) {
  const segments = (params["*"] || "").split("/").filter(Boolean);

  if (!segments.length) {
    throw new Response("Artist not found", { status: 404 });
  }

  const id = segments[0];
  const artist = await loaderFetch(`/artist/${encodeURIComponent(id)}`, request);

  if (!artist) {
    throw new Response("Artist not found", { status: 404 });
  }

  if (segments.length === 1) {
    throw redirect(createArtistSlug(artist.name, id));
  }

  return { artist };
}

export function meta({ data }) {
  const artist = data?.artist;
  if (!artist) return buildMeta({ title: "Artist • Trackr", noindex: true });

  const canonical = createArtistSlug(artist.name, artist.id);
  const genres = artist.genres?.length ? artist.genres.join(", ") : "";
  const bioLead = artist.biography
    ? artist.biography.split(/\n+/)[0].slice(0, 180)
    : "";

  const descParts = [
    `${artist.name}${genres ? ` — ${genres}` : ""}.`,
    bioLead || `Explore ${artist.name}'s discography, top tracks, ratings and reviews on Trackr.`,
  ].filter(Boolean);

  return buildMeta({
    title: `${artist.name} — Discography, Top Tracks & Reviews | Trackr`,
    description: descParts.join(" "),
    canonical,
    type: "profile",
    image: artist.images?.[0]?.url || "",
    imageAlt: `${artist.name} photo`,
    jsonLd: [
      musicGroupLd(artist, { canonical }),
      breadcrumbLd([
        { name: "Trackr", url: "/" },
        { name: artist.name, url: canonical },
      ]),
    ],
  });
}

const ArtistProfileScreen = () => {
  const { artist } = useLoaderData();

  return (
    <div className={styles.artistProfileScreen}>
      <ArtistProfile artistData={artist} />
    </div>
  );
};

export default ArtistProfileScreen;
