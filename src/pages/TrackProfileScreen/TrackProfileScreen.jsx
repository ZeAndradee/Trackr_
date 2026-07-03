import { useLoaderData, redirect } from "react-router";

import TrackProfile from "../../components/Track/TrackProfile/TrackProfile";
import styles from "./TrackProfileScreen.module.css";
import { loaderFetch } from "../../services/ssrLoader";
import {
  buildMeta,
  musicRecordingLd,
  breadcrumbLd,
} from "../../services/seo";
import {
  createTrackSlug,
  createArtistSlug,
  createAlbumSlug,
  formatSlug,
} from "../../utils/formatters/textFormatters";

const UNKNOWN_ARTIST = "Unknown Artist";

export async function loader({ params, request }) {
  const segments = (params["*"] || "").split("/").filter(Boolean);

  if (!segments.length) {
    throw new Response("Track not found", { status: 404 });
  }

  let track = null;

  if (segments.length >= 3) {
    track = await loaderFetch(`/track/${encodeURIComponent(segments[0])}`, request);
  } else if (segments.length === 1) {
    track = await loaderFetch(`/track/${encodeURIComponent(segments[0])}`, request);
    if (track) {
      throw redirect(createTrackSlug(track.name, track.artists, segments[0]));
    }
  } else {
    const path = `/track/${formatSlug(segments[0])}/${formatSlug(segments[1])}${
      segments[2] ? `/${encodeURIComponent(segments[2])}` : ""
    }`;
    track = await loaderFetch(path, request);
  }

  if (!track) {
    throw new Response("Track not found", { status: 404 });
  }

  return { track };
}

export function meta({ data }) {
  const track = data?.track;
  if (!track) return buildMeta({ title: "Track • Trackr", noindex: true });

  const trackId = track.id || track.trackId;
  const artistName = track.artists?.[0]?.name || UNKNOWN_ARTIST;
  const allArtists = track.artists?.map((a) => a.name).filter(Boolean).join(", ") || artistName;
  const canonical = createTrackSlug(track.name, track.artists, trackId);
  const albumName = track.album?.name;
  const rating = track.stats?.averageRating;

  const descParts = [
    `Listen to ${track.name} by ${allArtists}${albumName ? ` from the album ${albumName}` : ""}.`,
    `Read the lyrics, ratings and community reviews on Trackr.`,
    rating ? `Rated ${Number(rating).toFixed(1)}/5 by listeners.` : "",
    track.genres?.length ? `Genre: ${track.genres.join(", ")}.` : "",
  ].filter(Boolean);

  const oembed = `https://api.trackr.fm/oembed?url=https://trackr.fm${canonical}`;

  return buildMeta({
    title: `${track.name} by ${artistName} — Lyrics, Ratings & Reviews | Trackr`,
    description: descParts.join(" "),
    canonical,
    type: "music.song",
    image: track.coverUrl || track.album?.images?.[0]?.url || "",
    imageAlt: `${track.name} by ${artistName} cover art`,
    jsonLd: [
      musicRecordingLd(track, { canonical }),
      breadcrumbLd([
        { name: "Trackr", url: "/" },
        { name: artistName, url: createArtistSlug(artistName, track.artists?.[0]?.id) },
        albumName
          ? { name: albumName, url: createAlbumSlug(albumName, track.artists, track.album?.id) }
          : null,
        { name: track.name, url: canonical },
      ].filter(Boolean)),
    ],
    extra: [
      {
        tagName: "link",
        rel: "alternate",
        type: "application/json+oembed",
        href: oembed,
        title: `${track.name} by ${artistName}`,
      },
    ],
  });
}

const TrackProfileScreen = () => {
  const { track } = useLoaderData();

  return (
    <div className={styles.trackProfileScreen}>
      <TrackProfile
        key={track.id || track.trackId || "default"}
        trackId={track.id || track.trackId}
        trackData={track}
      />
    </div>
  );
};

export default TrackProfileScreen;
