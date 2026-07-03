import { useLoaderData } from "react-router";
import Log from "../../components/Log/Log";
import { loaderFetch } from "../../services/ssrLoader";
import { buildMeta, reviewLd } from "../../services/seo";

export async function loader({ params, request }) {
  const { logId } = params;
  if (!logId) {
    throw new Response("Log not found", { status: 404 });
  }

  const log = await loaderFetch(`/log/${logId}`, request);
  if (!log) {
    throw new Response("Log not found", { status: 404 });
  }

  return { log };
}

export function meta({ data, params }) {
  const log = data?.log;
  if (!log) {
    const title = params.username
      ? `Review by ${params.username} | Trackr`
      : "Review | Trackr";
    return buildMeta({ title, noindex: true });
  }

  const isAlbum = log.type === "album";
  const name = isAlbum
    ? log.album?.name || log.title || "Album"
    : log.track?.name || log.title || "Track";
  const author = log.name || log.username || "Someone";
  const artists = log.artists?.map((a) => a.name).filter(Boolean).join(", ") || "";
  const by = artists ? ` by ${artists}` : "";
  const canonical =
    params.username && params.logId
      ? `/${params.username}/log/${params.logId}`
      : undefined;
  const ratingText = log.rating ? `${Number(log.rating).toFixed(1)}/5` : "";

  const description = log.review
    ? `${author} rated ${name}${by}${ratingText ? ` ${ratingText}` : ""}: ${log.review.slice(0, 200)}`
    : `${author} logged ${name}${by}${ratingText ? ` and rated it ${ratingText}` : ""} on Trackr.`;

  return buildMeta({
    title: `${author}'s review of ${name}${by}${ratingText ? ` (${ratingText})` : ""} | Trackr`,
    description,
    canonical,
    type: "article",
    image: log.coverUrl || log.images?.[0]?.url || "",
    imageAlt: `${name} cover art`,
    jsonLd: reviewLd(log, { canonical }),
  });
}

const LogPage = () => {
  const { log } = useLoaderData();
  return <Log initialLog={log} />;
};

export default LogPage;
