const API_BASE = (import.meta.env.VITE_API_URL || "https://api.trackr.fm").replace(
  /\/+$/,
  ""
);

export const loaderFetch = async (path, request) => {
  const cookie = request?.headers?.get("cookie");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
      ...(cookie ? { cookie } : {}),
    },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
};
