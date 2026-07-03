import { useLoaderData, redirect } from "react-router";

import AlbumProfile from "../../components/Album/AlbumProfile/AlbumProfile";
import styles from "./AlbumProfileScreen.module.css";
import { loaderFetch } from "../../services/ssrLoader";
import { buildMeta, musicAlbumLd, breadcrumbLd } from "../../services/seo";
import { createAlbumSlug, createArtistSlug } from "../../utils/formatters/textFormatters";

const slugifyPart = (str) =>
  encodeURIComponent(str.toLowerCase().replace(/ /g, "-"));

const fetchAlbumData = ({ albumId, artist, album }, request) =>
  loaderFetch(
    albumId
      ? `/album/${albumId}`
      : `/album/${slugifyPart(artist)}/${slugifyPart(album)}`,
    request
  );

export async function loader({ params, request }) {
  const path = params["*"] || "";
  const segments = path.split("/").filter(Boolean);

  let albumData = null;

  if (segments.length >= 3) {
    albumData = await fetchAlbumData({ albumId: segments[0] }, request);
  } else if (segments.length >= 2) {
    if (segments[0] === "slug") {
      albumData = await fetchAlbumData({ albumId: segments[1] }, request);
    } else {
      albumData = await fetchAlbumData({
        artist: segments[0],
        album: segments[1],
      }, request);
    }
  } else if (segments.length === 1) {
    albumData = await fetchAlbumData({ albumId: segments[0] }, request);
    if (albumData) {
      throw redirect(
        createAlbumSlug(albumData.name, albumData.artists, segments[0])
      );
    }
  }

  if (!albumData) {
    throw new Response("Album not found", { status: 404 });
  }

  return { album: albumData };
}

export function meta({ data }) {
  const album = data?.album;
  if (!album) {
    return buildMeta({ title: "Album • Trackr", noindex: true });
  }

  const artistNames =
    album.artists?.map((a) => a.name).join(", ") ||
    album.primaryArtist?.name ||
    "";
  const by = artistNames ? ` by ${artistNames}` : "";
  const canonical = createAlbumSlug(album.name, album.artists, album.id);
  const year = album.releaseDate ? album.releaseDate.split("-")[0] : "";
  const trackCount = album.total_tracks || album.totalTracks || album.tracks?.length;
  const rating = album.stats?.averageRating;
  const firstArtist = album.artists?.[0];

  const descParts = [
    `${album.name}${by}${year ? ` (${year})` : ""}.`,
    trackCount ? `${trackCount} tracks.` : "",
    `Explore the full tracklist, ratings and reviews on Trackr.`,
    rating ? `Rated ${Number(rating).toFixed(1)}/5 by listeners.` : "",
  ].filter(Boolean);

  return buildMeta({
    title: `${album.name}${by} — Reviews, Ratings & Tracklist | Trackr`,
    description: descParts.join(" "),
    canonical,
    type: "music.album",
    image: album.images?.[0]?.url || album.coverUrl || "",
    imageAlt: `${album.name}${by} cover art`,
    jsonLd: [
      musicAlbumLd(album, { canonical }),
      breadcrumbLd([
        { name: "Trackr", url: "/" },
        firstArtist
          ? { name: firstArtist.name, url: createArtistSlug(firstArtist.name, firstArtist.id) }
          : null,
        { name: album.name, url: canonical },
      ].filter(Boolean)),
    ],
  });
}

const AlbumProfileScreen = () => {
  const { album } = useLoaderData();

  return (
    <div className={styles.albumProfileScreen}>
      <AlbumProfile albumData={album} />
    </div>
  );
};

export default AlbumProfileScreen;
