import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default (mode: string) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [react()],

    server: {
      proxy: {
        "/api/v1": `http://localhost:${process.env.VITE_API_PORT}/`,
      },
    },
  });
};
