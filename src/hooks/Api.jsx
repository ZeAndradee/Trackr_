import axios from "axios";

const CACHE_TTL_MS = 30_000;
const responseCache = new Map();
const inflight = new Map();

const stableStringify = (val) => {
  if (val == null) return "";
  if (typeof val !== "object") return String(val);
  if (val instanceof URLSearchParams) {
    const entries = [...val.entries()].sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `${k}:${v}`).join(",")}}`;
  }
  if (Array.isArray(val)) return `[${val.map(stableStringify).join(",")}]`;
  const keys = Object.keys(val).sort();
  return `{${keys.map((k) => `${k}:${stableStringify(val[k])}`).join(",")}}`;
};

const buildKey = (config) => {
  const base = (config.baseURL || "").replace(/\/$/, "");
  const url = config.url || "";
  const fullUrl = /^https?:/.test(url) ? url : `${base}${url.startsWith("/") ? "" : "/"}${url}`;
  return `${(config.method || "get").toUpperCase()} ${fullUrl} ${stableStringify(config.params)} ${stableStringify(config.data)}`;
};

const isCacheable = (config) =>
  config.cache !== false && (config.method || "get").toLowerCase() === "get";

export const invalidateCache = (predicate) => {
  if (!predicate) {
    responseCache.clear();
    return;
  }
  for (const k of [...responseCache.keys()]) {
    if (predicate(k)) responseCache.delete(k);
  }
};

const rawAxios = axios.create();

const performRequest = (config) =>
  rawAxios.request({
    ...config,
    adapter: undefined,
    transformRequest: config.transformRequest,
    transformResponse: config.transformResponse,
  });

const cachingAdapter = (config) => {
  const method = (config.method || "get").toLowerCase();

  if (!isCacheable(config)) {
    const p = performRequest(config);
    if (["post", "put", "patch", "delete"].includes(method)) {
      p.finally(() => invalidateCache());
    }
    return p;
  }

  const key = buildKey(config);

  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return Promise.resolve({ ...cached.response, config, cached: true });
  }

  const pending = inflight.get(key);
  if (pending) {
    return pending.then((response) => ({ ...response, config, cached: true }));
  }

  const promise = performRequest(config)
    .then((response) => {
      responseCache.set(key, { ts: Date.now(), response });
      return response;
    })
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, promise);
  return promise;
};

const useApi = () => {
  const baseURL = import.meta.env?.VITE_API_URL || "https://api.trackr.fm";

  const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
    adapter: cachingAdapter,
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.error("401 Error intercepted: Unauthorized.");
      }
      return Promise.reject(error);
    }
  );

  return api;
};

export default useApi;
