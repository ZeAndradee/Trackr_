export const SITE = {
  name: "Trackr",
  url: "https://trackr.fm",
  twitter: "@trackrfm",
  locale: "en_US",
  defaultImage: "https://trackr.fm/TrackrLogo.png",
  description:
    "Track, rate and review the music you listen to. Discover tracks, albums, artists and playlists with the Trackr community.",
};

const truncate = (text, max = 300) => {
  if (!text) return "";
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
};

export const absoluteUrl = (pathOrUrl) => {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE.url}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
};

export const buildMeta = ({
  title,
  description,
  canonical,
  type = "website",
  image,
  imageAlt,
  noindex = false,
  jsonLd,
  extra = [],
} = {}) => {
  const url = canonical ? absoluteUrl(canonical) : undefined;
  const img = image ? absoluteUrl(image) : SITE.defaultImage;
  const desc = truncate(description || SITE.description);
  const pageTitle = title || SITE.name;

  const tags = [
    { title: pageTitle },
    { name: "description", content: desc },
    {
      name: "robots",
      content: noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },

    { property: "og:site_name", content: SITE.name },
    { property: "og:locale", content: SITE.locale },
    { property: "og:type", content: type },
    { property: "og:title", content: pageTitle },
    { property: "og:description", content: desc },
    url ? { property: "og:url", content: url } : null,
    img ? { property: "og:image", content: img } : null,
    img ? { property: "og:image:alt", content: imageAlt || pageTitle } : null,

    { name: "twitter:card", content: img ? "summary_large_image" : "summary" },
    { name: "twitter:site", content: SITE.twitter },
    { name: "twitter:title", content: pageTitle },
    { name: "twitter:description", content: desc },
    img ? { name: "twitter:image", content: img } : null,
    img ? { name: "twitter:image:alt", content: imageAlt || pageTitle } : null,

    url ? { tagName: "link", rel: "canonical", href: url } : null,
  ].filter(Boolean);

  const ldBlocks = (Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []).filter(
    Boolean
  );
  for (const block of ldBlocks) {
    tags.push({ "script:ld+json": block });
  }

  return [...tags, ...extra];
};

const compact = (obj) => {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
};

const artistNames = (artists) => {
  if (!Array.isArray(artists)) return [];
  return artists.map((a) => a?.name).filter(Boolean);
};

export const isoDuration = (value, { unit } = {}) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "string" && /^PT/i.test(value)) return value;
  let totalSeconds;
  if (typeof value === "string" && value.includes(":")) {
    const parts = value.split(":").map(Number);
    if (parts.some(Number.isNaN)) return undefined;
    totalSeconds = parts.reduce((acc, n) => acc * 60 + n, 0);
  } else {
    const num = Number(value);
    if (Number.isNaN(num)) return undefined;
    totalSeconds = unit === "ms" ? Math.round(num / 1000) : num;
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s ? `${s}S` : ""}` || "PT0S";
};

export const aggregateRating = (average, count, { best = 5 } = {}) => {
  const ratingValue = Number(average);
  if (!ratingValue || Number.isNaN(ratingValue)) return undefined;
  const ratingCount = Number(count);
  return compact({
    "@type": "AggregateRating",
    ratingValue: Number(ratingValue.toFixed(2)),
    bestRating: best,
    worstRating: 1,
    ratingCount: ratingCount > 0 ? ratingCount : 1,
  });
};

const personFromArtist = (artist) =>
  artist?.name
    ? compact({
        "@type": "MusicGroup",
        name: artist.name,
        url: artist.id ? absoluteUrl(`/artist/${artist.id}`) : undefined,
      })
    : undefined;

export const musicRecordingLd = (track, { canonical } = {}) => {
  if (!track?.name) return undefined;
  const byArtist = (track.artists || []).map(personFromArtist).filter(Boolean);
  return compact({
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: track.name,
    url: canonical ? absoluteUrl(canonical) : undefined,
    image: track.coverUrl || track.album?.images?.[0]?.url,
    byArtist: byArtist.length ? byArtist : undefined,
    inAlbum: track.album?.name
      ? compact({ "@type": "MusicAlbum", name: track.album.name })
      : undefined,
    duration:
      track.duration_ms != null
        ? isoDuration(track.duration_ms, { unit: "ms" })
        : isoDuration(track.duration),
    genre: track.genres?.length ? track.genres : undefined,
    datePublished: track.album?.releaseDate || track.releaseDate,
    aggregateRating: aggregateRating(
      track.stats?.averageRating,
      track.stats?.ratingCount ?? track.stats?.reviews
    ),
  });
};

export const musicAlbumLd = (album, { canonical } = {}) => {
  if (!album?.name) return undefined;
  const byArtist = (album.artists || []).map(personFromArtist).filter(Boolean);
  const tracks = (album.tracks || [])
    .map((t) => (t?.name ? compact({ "@type": "MusicRecording", name: t.name }) : null))
    .filter(Boolean);
  return compact({
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name: album.name,
    url: canonical ? absoluteUrl(canonical) : undefined,
    image: album.images?.[0]?.url || album.coverUrl,
    byArtist: byArtist.length ? byArtist : undefined,
    numTracks: album.total_tracks || album.totalTracks || tracks.length || undefined,
    datePublished: album.releaseDate,
    recordLabel: album.label,
    genre: album.genres?.length ? album.genres : undefined,
    track: tracks.length ? tracks : undefined,
    aggregateRating: aggregateRating(
      album.stats?.averageRating,
      album.stats?.ratingCount ?? album.stats?.reviews
    ),
  });
};

export const musicGroupLd = (artist, { canonical } = {}) => {
  if (!artist?.name) return undefined;
  const sameAs = [
    artist.spotifyUrl,
    artist.externalUrls?.spotify,
    artist.wikipediaUrl,
  ].filter(Boolean);
  return compact({
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: artist.name,
    url: canonical ? absoluteUrl(canonical) : undefined,
    image: artist.images?.[0]?.url || artist.coverUrl,
    genre: artist.genres?.length ? artist.genres : undefined,
    description: artist.biography || artist.bio,
    sameAs: sameAs.length ? sameAs : undefined,
  });
};

export const itemListLd = (list, { canonical } = {}) => {
  if (!list?.name) return undefined;
  const items = (list.tracks || [])
    .slice(0, 50)
    .map((track, index) => {
      const name = track?.name || track?.title;
      if (!name) return null;
      const artists = artistNames(track.artists);
      const label = artists.length ? `${name} — ${artists.join(", ")}` : name;
      return compact({
        "@type": "ListItem",
        position: index + 1,
        name: label,
        url:
          track.id || track.trackId
            ? absoluteUrl(`/track/${track.id || track.trackId}`)
            : undefined,
      });
    })
    .filter(Boolean);
  return compact({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: list.name,
    description: list.description,
    url: canonical ? absoluteUrl(canonical) : undefined,
    numberOfItems: list.tracks?.length || items.length || undefined,
    itemListElement: items.length ? items : undefined,
  });
};

export const personLd = (user, { canonical } = {}) => {
  if (!user?.username) return undefined;
  return compact({
    "@context": "https://schema.org",
    "@type": "Person",
    name: user.displayName || user.username,
    alternateName: `@${user.username}`,
    url: canonical ? absoluteUrl(canonical) : absoluteUrl(`/${user.username}`),
    image: user.userimage || user.image || user.userImage,
    description: user.bio,
  });
};

export const reviewLd = (log, { canonical } = {}) => {
  if (!log) return undefined;
  const isAlbum = log.type === "album";
  const name = isAlbum
    ? log.album?.name || log.title
    : log.track?.name || log.title;
  if (!name) return undefined;
  const author = log.name || log.username || "Trackr user";
  const artists = artistNames(log.artists);
  const itemReviewed = compact({
    "@type": isAlbum ? "MusicAlbum" : "MusicRecording",
    name,
    image: log.coverUrl || log.images?.[0]?.url,
    byArtist: artists.length
      ? artists.map((n) => ({ "@type": "MusicGroup", name: n }))
      : undefined,
  });
  return compact({
    "@context": "https://schema.org",
    "@type": "Review",
    url: canonical ? absoluteUrl(canonical) : undefined,
    itemReviewed,
    author: compact({
      "@type": "Person",
      name: author,
      url: log.username ? absoluteUrl(`/${log.username}`) : undefined,
    }),
    datePublished: log.selectedDate || log.createdAt,
    reviewBody: log.review || undefined,
    reviewRating: log.rating
      ? compact({
          "@type": "Rating",
          ratingValue: log.rating,
          bestRating: 5,
          worstRating: 1,
        })
      : undefined,
  });
};

export const breadcrumbLd = (crumbs = []) => {
  const items = crumbs
    .filter((c) => c?.name && c?.url)
    .map((c, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: c.name,
      item: absoluteUrl(c.url),
    }));
  if (!items.length) return undefined;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
};

export const websiteLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE.url}/search/{search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});

export const organizationLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  logo: SITE.defaultImage,
  sameAs: ["https://twitter.com/trackrfm"],
});

export const collectionPageLd = ({ name, description, url, image } = {}) =>
  compact({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: url ? absoluteUrl(url) : undefined,
    image,
  });
