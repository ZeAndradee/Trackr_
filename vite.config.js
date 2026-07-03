import { defineConfig, loadEnv } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { fileURLToPath } from "url";
import { resolve } from "path";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      "process.env.VITE_SPOTIFY_CLIENT": JSON.stringify(
        env.VITE_SPOTIFY_CLIENT
      ),
    },
    plugins: [
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      reactRouter(),
    ],
    resolve: {
      alias: {
        "@": resolve(root, "src"),
      },
    },
  };
});
