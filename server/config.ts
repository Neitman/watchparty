import { loadEnvFile } from "node:process";

try {
  loadEnvFile();
} catch (e) {
  console.log(e);
}

const defaults = {
  REDIS_URL: "", // Optional, for metrics
  DATABASE_URL: "", // Optional, for permanent rooms
  YOUTUBE_API_KEY: "", // Optional, provide one to enable searching YouTube
  NODE_ENV: "", // Usually, you should let process.env.NODE_ENV override this
  FIREBASE_ADMIN_SDK_CONFIG: "", // Optional, for features requiring sign-in/authentication
  FIREBASE_DATABASE_URL: "", // Optional (unused)
  STRIPE_SECRET_KEY: "", // Optional, for subscriptions
  SSL_KEY_FILE: "", // Optional, Filename of SSL key (to use https)
  SSL_CRT_FILE: "", // Optional, Filename of SSL cert (to use https)
  PORT: 8080, // Port to use for server
  HOST: "0.0.0.0", // Host interface to bind server to
  STATS_KEY: "", // Secret string to validate viewing stats
  BETA_USER_EMAILS: "", // Comma-delimited list of user emails to include in the beta
  CUSTOM_SETTINGS_HOSTNAME: "", // Hostname to send different config settings to client
  STREAM_PATH: "", // Path of server that supports additional video streams
  CONVERT_PATH: "", // Path of server that supports video conversion
  ROOM_CAPACITY: 0, // Maximum capacity of a standard room. Set to 0 for unlimited.
  ROOM_CAPACITY_SUB: 0, // Maximum capacity of a sub room. Set to 0 for unlimited.
  BUILD_DIRECTORY: "build", // Name of the directory where the built React UI is served from
  SHARD: undefined, // Shard ID of the web server (configure in ecosystem.config.js)
  FREE_ROOM_LIMIT: 1, // The maximum number of rooms a free user can have
  SUBSCRIBER_ROOM_LIMIT: 20, // The maximum number of rooms a subscriber can have
  DISCORD_BOT_TOKEN: "", // Token for the Discord bot that generates WatchParty links
  DISCORD_ADMIN_BOT_TOKEN: "", // Optional, for Discord bot to set subscriber roles
  DISCORD_ADMIN_BOT_SERVER_ID: "708181150220156929", // Optional, ID of the Discord server
  DISCORD_ADMIN_BOT_SUB_ROLE_ID: "722202622345609246", // Optional, ID of subscriber role
  MEDIASOUP_SERVER: "", // Optional, URL of the MediaSoup server to broadcast to for larger screen/file shares
  TWITCH_PROXY_PATH: "", // Optional, URL of the server that can proxy twitch HLS stream playlists and segments
  OPENSUBTITLES_KEY: "", // Optional, key to OpenSubtitles API
};

export default {
  ...defaults,
  ...process.env,
};
