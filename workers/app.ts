import { createRequestHandler } from "react-router";

const API_BASE_URL = "https://api.trackr.fm";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (/^\/sitemap(_index|-[a-z]+(-\d+)?)?\.xml$/.test(url.pathname)) {
      const sitemapResponse = await fetch(`${API_BASE_URL}${url.pathname}`);
      return new Response(sitemapResponse.body, {
        status: sitemapResponse.status,
        statusText: sitemapResponse.statusText,
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
};
