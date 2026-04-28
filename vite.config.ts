import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api/nvidia": {
          target: "https://integrate.api.nvidia.com",
          changeOrigin: true,
          rewrite: () => "/v1/chat/completions",
          headers: {
            Authorization: `Bearer ${env.VITE_NVIDIA_API_KEY}`,
          },
        },
      },
    },
    plugins: [vue()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
