import { loadEnvFile } from "node:process";
import fs from "node:fs";

try {
  loadEnvFile();
} catch (e) {
  console.log(e);
}

export default {
  build: {
    outDir: "build",
    // sourcemap: true,
  },
  server: {
    https:
      process.env.SSL_CRT_FILE && process.env.SSL_KEY_FILE
        ? {
            key: fs.readFileSync(process.env.SSL_KEY_FILE),
            cert: fs.readFileSync(process.env.SSL_CRT_FILE),
          }
        : null,
    allowedHosts: true,
    proxy: {
      "/createRoom": "http://localhost:8080",
      "/resolveShard": "http://localhost:8080",
      "/resolveRoom": "http://localhost:8080",
      "/metadata": "http://localhost:8080",
      "/listRooms": "http://localhost:8080",
      "/ping": "http://localhost:8080",
      "/youtube": "http://localhost:8080",
      "/youtubePlaylist": "http://localhost:8080",
      "/subtitle": "http://localhost:8080",
      "/generateName": "http://localhost:8080",
      "/socket.io": {
        target: "http://localhost:8080",
        ws: true,
      },
    },
  },
};
